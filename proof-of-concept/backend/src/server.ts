import express, { Express, Request, Response } from "express";

const app: Express = express();
const port: number = 4000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory store for the PoC
interface Comment {
	text: string;
	// Potentially: lineNumber: number, author: string, timestamp: Date, tags?: string[]
	tags?: string[];
}

interface Config {
	id: string;
	repo_url: string;
	comments_api_url: string;
	comments: Comment[];
}

const db: Record<string, Config> = {};
let nextId = 1; // Simple ID generator

const FRONTEND_BASE_URL = "http://localhost:5173"; // Assuming Vite default
const BACKEND_BASE_URL = `http://localhost:${port}`;

// POST /api/setup - User provides repo_url, get back a URL for frontend
app.post("/api/setup", (req: Request, res: Response): any => {
	const { repo_url } = req.body;

	if (!repo_url) {
		return res.status(400).json({ message: "repo_url is required" });
	}

	const id = (nextId++).toString();
	const comments_api_url = `${BACKEND_BASE_URL}/api/comments/${id}`;

	db[id] = {
		id,
		repo_url,
		comments_api_url,
		comments: [],
	};

	const frontendRedirectUrl = `${FRONTEND_BASE_URL}?repo_url=${encodeURIComponent(
		repo_url
	)}&comments_api_url=${encodeURIComponent(comments_api_url)}`;

	res.status(201).json({
		message: "Configuration created",
		id,
		repo_url,
		comments_api_url,
		frontend_url: frontendRedirectUrl, // URL for frontend to use/redirect to
	});
});

// GET /api/configs - Get a list of all configurations and their comments
app.get("/api/configs", (req: Request, res: Response) => {
	res.status(200).json(Object.values(db));
});

// PUT /api/comments/:id - Add a comment to a specific configuration
app.put("/api/comments/:id", (req: Request, res: Response): any => {
	const { id } = req.params;
	const { text, tags } = req.body; // Assuming a comment has 'text' and optional 'tags'

	if (!db[id]) {
		return res.status(404).json({ message: "Configuration not found" });
	}

	if (!text) {
		return res.status(400).json({ message: "Comment text is required" });
	}

	const newComment: Comment = { text };
	if (tags) {
		newComment.tags = tags;
	}

	db[id].comments.push(newComment);

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
	console.log(`PUT  ${BACKEND_BASE_URL}/api/comments/:id`);
});
