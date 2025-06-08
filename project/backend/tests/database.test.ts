import { assert } from "@std/assert";
import DatabaseManager from "../src/services/databaseManager.ts";
import { CommentDto } from "../src/models/dtoModels.ts";

// Test database manager
Deno.test("DatabaseManager - Basic Operations", () => {
	const dbPath = ":memory:"; // Use in-memory SQLite for testing
	const dbManager = new DatabaseManager(dbPath);

	// Test database health check
	assert(dbManager.isConnected(), "Database should be connected");

	// Test project creation
	const requestData = {
		git_repo_url: "https://github.com/test/repo",
		repo_type: "git",
		commit: "main",
		token: "test-token",
		backend_base_url: "http://localhost:4000",
	};

	const project = dbManager.createProject(requestData);
	assert(project.identifier > 0, "Project should have valid ID");
	assert(
		project.repository.project_id === project.identifier,
		"Repository should reference project"
	);

	// Test comment addition
	const commentData: CommentDto = {
		filePath: "src/test.ts",
		lineNumber: 42,
		content: "This is a test comment",
	};

	dbManager.addComment(project.identifier, commentData);

	// Test comment retrieval
	const comments = dbManager.getCommentsByProjectId(project.identifier);
	assert(comments.length === 1, "Should have one comment");
	assert(comments[0].filePath === "src/test.ts", "Comment should have correct file path");
	assert(comments[0].lineNumber === 42, "Comment should have correct line number");
	assert(comments[0].content === "This is a test comment", "Comment should have correct text");

	// Test database statistics
	const stats = dbManager.getStats();
	assert(stats.projectCount === 1, "Should have one project");
	assert(stats.commentCount === 1, "Should have one comment");
	assert(stats.repositoryCount === 1, "Should have one repository");

	// Clean up
	dbManager.close();
});

Deno.test("DatabaseManager - Error Handling", () => {
	const dbPath = ":memory:";
	const dbManager = new DatabaseManager(dbPath);

	// Test getting non-existent project
	const project = dbManager.getProjectById(999);
	assert(project === null, "Should return null for non-existent project");

	// Test getting comments for non-existent project
	const comments = dbManager.getCommentsByProjectId(999);
	assert(Array.isArray(comments), "Should return empty array for non-existent project");
	assert(comments.length === 0, "Should return empty array for non-existent project");

	dbManager.close();
});
