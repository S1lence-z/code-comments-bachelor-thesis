import express from "express";
import cors from "cors";
import path from "node:path";
import process from "node:process";
import { config } from "dotenv";
import { DatabaseManager } from "./database/databaseManager.ts";
import { projectToDto } from "./utils/mappers.ts";
import { validateEnv, logEnvironment } from "./utils/envValidator.ts";
import { SetupProjectBodySchema, type GetCommentsResponse } from "./types/api.ts";
import { CommentDtoSchema, type ProjectDto } from "./models/dtos.ts";

// Load environment variables
config({
	path: path.resolve(process.cwd(), ".env.local"),
});

// Validate environment configuration
const env = validateEnv();
logEnvironment(env);

const app = express();

// Environment variables from validated env
const BACKEND_API_PORT = env.BACKEND_API_PORT;
const BACKEND_HOSTNAME = env.BACKEND_HOSTNAME;
const BACKEND_BASE_URL = `${BACKEND_HOSTNAME}:${BACKEND_API_PORT}`;
const FRONTEND_BASE_URL = env.FRONTEND_BASE_URL;

// Database setup
const DB_FILE_PATH = env.DB_PATH || path.join(import.meta.dirname || ".", "../db/main.db");
const dbManager = new DatabaseManager(DB_FILE_PATH);

// Middleware
app.use(
	cors({
		origin: "*",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["*"],
	})
);

app.use(express.json({ limit: "10mb" }));

// Routes
app.get("/", (req: express.Request, res: express.Response) => {
	console.log(req.method, req.url);
	res.send("Welcome to the Code Commenting API!");
});

// Health check endpoint
app.get("/health", (_req: express.Request, res: express.Response) => {
	const isDbConnected = dbManager.isConnected();
	const dbStats = dbManager.getStats();

	res.json({
		status: isDbConnected ? "healthy" : "unhealthy",
		timestamp: new Date().toISOString(),
		version: "1.0.0",
		database: {
			connected: isDbConnected,
			statistics: dbStats,
		},
	});
});

// API documentation endpoint
app.get("/api", (_req: express.Request, res: express.Response) => {
	res.json({
		name: "Code Commenting API",
		version: "1.0.0",
		description: "Express TypeScript backend for code commenting project with SQLite database",
		endpoints: {
			"POST /api/setup": {
				description: "Create a new project",
				body: {
					repoUrl: "string (required)",
					repoType: "string (optional, default: 'git')",
					commit: "string (optional)",
					token: "string (optional)",
				},
				response: "ProjectDto",
			},
			"GET /api/project/:project_id/comments": {
				description: "Get all comments for a project",
				parameters: {
					project_id: "number (required)",
				},
				response: "GetCommentsResponse",
			},
			"PUT /api/comments/:project_id": {
				description: "Add a comment to a project",
				parameters: {
					project_id: "number (required)",
				},
				body: {
					filePath: "string (required)",
					lineNumber: "number (required)",
					text: "string (required)",
					tags: "string[] (optional)",
				},
				response: "Success message",
			},
		},
	});
});

// Setup project endpoint
app.post("/api/setup", (req: express.Request, res: express.Response) => {
	try {
		// Validate request body
		const validatedBody = SetupProjectBodySchema.parse(req.body);

		const requestData = {
			git_repo_url: validatedBody.repoUrl,
			repo_type: validatedBody.repoType,
			commit: validatedBody.commit,
			token: validatedBody.token,
			frontend_base_url: FRONTEND_BASE_URL,
			backend_base_url: BACKEND_BASE_URL,
		};

		const newProject = dbManager.createProject(requestData);
		const newProjectDto: ProjectDto = projectToDto(newProject);

		res.status(201).json(newProjectDto);
	} catch (error) {
		console.error("Error in /api/setup:", error);

		if (error instanceof Error && error.message.includes("validation")) {
			res.status(400).json({
				error: "Validation error",
				details: error.message,
			});
		} else {
			res.status(500).json({
				error: "Failed to setup project",
				details: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}
});

// Get comments for a project
app.get("/api/project/:project_id/comments", (req: express.Request, res: express.Response) => {
	try {
		const projectId = parseInt(req.params.project_id);

		if (isNaN(projectId)) {
			return res.status(400).json({ error: "Invalid project ID" });
		}

		const project = dbManager.getProjectById(projectId);

		if (!project) {
			return res.status(404).json({ error: "Project not found" });
		}

		const comments = dbManager.getCommentsByProjectId(projectId);

		const response: GetCommentsResponse = {
			message: "Comments retrieved successfully",
			repository: {
				identifier: project.repository.identifier,
				type: project.repository.type,
				repoLandingPageUrl: project.repository.repo_landing_page_url,
			},
			comments,
		};

		res.json(response);
	} catch (error) {
		console.error("Error in GET /api/project/:project_id/comments:", error);
		res.status(500).json({
			error: "Failed to retrieve comments",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// Add comment to a project
app.put("/api/project/:project_id/comments", (req: express.Request, res: express.Response) => {
	try {
		const projectId = parseInt(req.params.project_id);

		if (isNaN(projectId)) {
			return res.status(400).json({ error: "Invalid project ID" });
		}

		// Validate comment data
		const validatedComment = CommentDtoSchema.parse(req.body);

		// Check if project exists
		const project = dbManager.getProjectById(projectId);
		if (!project) {
			return res.status(404).json({ error: "Project not found" });
		}

		dbManager.addComment(projectId, validatedComment);

		res.json({
			message: "Comment added successfully",
			project_id: projectId,
		});
	} catch (error) {
		console.error("Error in PUT /api/comments/:project_id:", error);

		if (error instanceof Error && error.message.includes("validation")) {
			res.status(400).json({
				error: "Validation error",
				details: error.message,
			});
		} else {
			res.status(500).json({
				error: "Failed to add comment",
				details: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}
});

// 404 handler for undefined routes
app.use((_req: express.Request, res: express.Response) => {
	res.status(404).json({
		error: "Route not found",
		message: "The requested endpoint does not exist",
	});
});

// Error handling middleware
app.use(
	(error: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
		console.error(`Error in ${req.method} ${req.url}:`, error);

		if (error.name === "ZodError") {
			return res.status(400).json({
				error: "Validation error",
				details: error.message,
			});
		}

		if (error.message.includes("SQLITE_")) {
			return res.status(500).json({
				error: "Database error",
				details: "Internal database error occurred",
			});
		}

		res.status(500).json({
			error: "Internal server error",
			details: error.message,
		});
	}
);

// Graceful shutdown
process.on("SIGINT", () => {
	console.log("\nShutting down gracefully...");
	dbManager.close();
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("\nShutting down gracefully...");
	dbManager.close();
	process.exit(0);
});

// Start server
app.listen(BACKEND_API_PORT, () => {
	console.log("- Express TypeScript Backend for Code Commenting Project (SQLite) -");
	console.log(`Server running on: ${BACKEND_BASE_URL}`);
	console.log(`Frontend Base URL expected: ${FRONTEND_BASE_URL}`);
	console.log("API Endpoints:");
	console.log(`POST ${BACKEND_BASE_URL}/api/setup`);
	console.log(`GET  ${BACKEND_BASE_URL}/api/project/{project_id}/comments`);
	console.log(`PUT  ${BACKEND_BASE_URL}/api/project/{project_id/comments`);
	console.log(`Database file: ${DB_FILE_PATH}`);
});
