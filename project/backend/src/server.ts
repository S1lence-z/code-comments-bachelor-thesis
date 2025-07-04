import express from "express";
import cors from "cors";
import path from "node:path";
import process from "node:process";
import { config } from "dotenv";
import { validateEnv, logEnvironment } from "./utils/envValidator.ts";
import DatabaseManager from "./services/databaseManager.ts";
import ProjectService from "./services/projectService.ts";
import CommentsService from "./services/commentsService.ts";
import CategoriesService from "./services/categoriesService.ts";
import ProjectController from "./controllers/projectController.ts";
import CommentsController from "./controllers/commentsController.ts";
import CategoriesController from "./controllers/categoriesController.ts";
import { SetupProjectBodySchema } from "./models/requestModels.ts";
import { CommentDtoSchema, type ProjectDto } from "./models/dtoModels.ts";
import { GetCommentsResponse } from "./models/responseModels.ts";

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
const DB_FILE_PATH = path.join(import.meta.dirname || ".", "../db/main.db");
const dbManager = new DatabaseManager(DB_FILE_PATH);

// Services setup
const projectService = new ProjectService(dbManager);
const commentsService = new CommentsService(dbManager);
const categoriesService = new CategoriesService(dbManager);

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

	res.json({
		status: isDbConnected ? "healthy" : "unhealthy",
		timestamp: new Date().toISOString(),
		version: "1.0.0",
		database: {
			connected: isDbConnected,
		},
	});
});

// Setup project endpoint
app.post("/api/setup", (req: express.Request, res: express.Response) => {
	try {
		// Validate request body
		const validatedBody = SetupProjectBodySchema.parse(req.body);

		const newProjectDto: ProjectDto = ProjectController.createProject(
			projectService,
			validatedBody,
			FRONTEND_BASE_URL,
			BACKEND_BASE_URL
		);

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

		const getCommentsResponse: GetCommentsResponse = CommentsController.getComments(
			commentsService,
			projectService,
			projectId
		);

		res.status(200).json(getCommentsResponse);
	} catch (error) {
		console.error("Error in GET /api/project/:project_id/comments:", error);
		res.status(500).json({
			error: "Failed to retrieve comments",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// Add comment to a project
app.post("/api/project/:project_id/comments", (req: express.Request, res: express.Response) => {
	try {
		const projectId = parseInt(req.params.project_id);
		if (isNaN(projectId)) {
			return res.status(400).json({ error: "Invalid project ID" });
		}

		// Validate comment data
		const validatedComment = CommentDtoSchema.parse(req.body);

		CommentsController.addComment(commentsService, projectId, validatedComment);

		res.status(201).json({ success: true });
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

// Delete comment from a project
app.delete("/api/project/:project_id/comments/:comment_id", (req: express.Request, res: express.Response) => {
	try {
		const projectId = parseInt(req.params.project_id);
		const commentId = parseInt(req.params.comment_id);

		if (isNaN(projectId)) {
			return res.status(400).json({ error: "Invalid project ID or comment ID" });
		}

		if (isNaN(commentId)) {
			return res.status(400).json({ error: "Invalid comment ID" });
		}

		CommentsController.deleteComment(commentsService, projectId, commentId);

		res.status(200).send({ success: true });
	} catch (error) {
		console.error("Error in DELETE /api/project/:project_id/comments", error);
		res.status(500).json({
			error: "Failed to delete comment",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

app.put("/api/project/:project_id/comments/:comment_id", (req: express.Request, res: express.Response) => {
	try {
		const projectId = parseInt(req.params.project_id);
		const commentId = parseInt(req.params.comment_id);

		if (isNaN(projectId) || isNaN(commentId)) {
			return res.status(400).json({ error: "Invalid project ID or comment ID" });
		}

		// Validate updated comment data
		const validatedComment = CommentDtoSchema.parse(req.body);

		CommentsController.updateComment(commentsService, projectId, commentId, validatedComment);

		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Error in PUT /api/project/:project_id/comments/:comment_id:", error);
		res.status(500).json({
			error: "Failed to update comment",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// Get all categories
app.get("/api/categories", (_req: express.Request, res: express.Response) => {
	try {
		const categories = CategoriesController.getCategories(categoriesService);
		res.status(200).json(categories);
	} catch (error) {
		console.error("Error in GET /api/categories:", error);
		res.status(500).json({
			error: "Failed to retrieve categories",
			details: error instanceof Error ? error.message : "Unknown error",
		});
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
app.use((error: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
});

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
	console.log(`POST  ${BACKEND_BASE_URL}/api/project/{project_id}/comments`);
	console.log(`DELETE ${BACKEND_BASE_URL}/api/project/{project_id}/comments/{comment_id}`);
	console.log(`GET  ${BACKEND_BASE_URL}/api/categories`);
	console.log(`Database file: ${DB_FILE_PATH}`);
});
