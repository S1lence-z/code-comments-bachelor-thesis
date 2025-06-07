import { z } from "zod";

// Request body validation schemas
export const SetupProjectBodySchema = z.object({
	repoUrl: z.string().url("Invalid repository URL"),
	repoType: z.string().optional().default("git"),
	commit: z.string().optional().default(""),
	token: z.string().optional().default(""),
});

export const CommentDtoSchema = z.object({
	filePath: z.string().min(1, "File path is required"),
	lineNumber: z.number().int().positive("Line number must be a positive integer"),
	text: z.string().min(1, "Comment text is required"),
	tags: z.array(z.string()).optional(),
});

// Response validation schemas
export const RepositoryDtoSchema = z.object({
	identifier: z.number().int(),
	type: z.string(),
	repoLandingPageUrl: z.string().url(),
});

export const ProjectDtoSchema = z.object({
	identifier: z.number().int(),
	version: z.string(),
	label: z.string(),
	readApiUrl: z.string().url(),
	writeApiUrl: z.string().url().nullable(),
	repository: RepositoryDtoSchema,
});

export const GetCommentsResponseSchema = z.object({
	message: z.string(),
	repository: RepositoryDtoSchema,
	comments: z.array(CommentDtoSchema),
});

// Type exports from schemas
export type SetupProjectBody = z.infer<typeof SetupProjectBodySchema>;
export type CommentDto = z.infer<typeof CommentDtoSchema>;
export type RepositoryDto = z.infer<typeof RepositoryDtoSchema>;
export type ProjectDto = z.infer<typeof ProjectDtoSchema>;
export type GetCommentsResponse = z.infer<typeof GetCommentsResponseSchema>;
