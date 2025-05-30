import express, { Express, Request, Response } from "express";
import cors from "cors";

const app: Express = express();
const port: number = 4000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// In-memory store for the PoC
interface Comment {
	filePath: string; // Added
	lineNumber: number; // Added
	text: string;
	tags?: string[];
}

interface Config {
	id: string;
	repoUrl: string;
	commentsApiUrl: string;
	comments: Comment[];
}

const db: Record<string, Config> = {};
let nextId = 1; // Simple ID generator

const FRONTEND_BASE_URL = "http://localhost:5173"; // Assuming Vite default
const BACKEND_BASE_URL = `http://localhost:${port}`;

// POST /api/setup - User provides repoUrl, get back a URL for frontend
app.post("/api/setup", (req: Request, res: Response): any => {
	const { repoUrl } = req.body;

	if (!repoUrl) {
		return res.status(400).json({ message: "repoUrl is required" });
	}

	const id = (nextId++).toString();
	const commentsApiUrl = `${BACKEND_BASE_URL}/api/comments/${id}`;

	db[id] = {
		id,
		repoUrl,
		commentsApiUrl,
		comments: [],
	};

	const frontendRedirectUrl = `${FRONTEND_BASE_URL}?repoUrl=${encodeURIComponent(
		repoUrl
	)}&commentsApiUrl=${encodeURIComponent(commentsApiUrl)}`;

	res.status(201).json({
		message: "Configuration created",
		id,
		repoUrl,
		commentsApiUrl,
		frontend_url: frontendRedirectUrl, // URL for frontend to use/redirect to
	});
});

// GET /api/configs - Get a list of all configurations and their comments
app.get("/api/configs", (req: Request, res: Response) => {
	res.status(200).json(Object.values(db));
});

// GET /api/comments/:id - Get comments for a specific configuration
app.get("/api/comments/:id", (req: Request, res: Response): any => {
	const { id } = req.params;

	if (!db[id]) {
		return res.status(404).json({ message: "Configuration not found" });
	}

	res.status(200).json(db[id].comments);
});

// PUT /api/comments/:id - Add a comment to a specific configuration
app.put("/api/comments/:id", (req: Request, res: Response): any => {
	const { id } = req.params;
	// Updated to expect filePath and lineNumber
	const { text, tags, filePath, lineNumber } = req.body as Comment;

	if (!db[id]) {
		return res.status(404).json({ message: "Configuration not found" });
	}

	if (!text || typeof lineNumber !== "number" || !filePath) {
		return res
			.status(400)
			.json({ message: "Comment text, filePath, and lineNumber are required" });
	}

	const newComment: Comment = { text, filePath, lineNumber };
	if (tags) {
		newComment.tags = tags;
	}

	db[id].comments.push(newComment);
	// Sort comments by line number, then by file path if line numbers are the same
	db[id].comments.sort((a, b) => {
		if (a.filePath < b.filePath) return -1;
		if (a.filePath > b.filePath) return 1;
		return a.lineNumber - b.lineNumber;
	});

	res.status(200).json({ message: "Comment added", config: db[id] });
});

// Original GET / endpoint, can be removed or kept for basic check
app.get("/", (req: Request, res: Response) => {
	res.send("Backend for Code Commenting PoC is running!");
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
	console.log(`PoC Backend Endpoints:`);
	console.log(`POST ${BACKEND_BASE_URL}/api/setup`);
	console.log(`GET  ${BACKEND_BASE_URL}/api/configs`);
	console.log(`GET  ${BACKEND_BASE_URL}/api/comments/:id`);
	console.log(`PUT  ${BACKEND_BASE_URL}/api/comments/:id`);
});
