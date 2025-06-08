import { z } from "zod";
import { CommentDtoSchema, RepositoryDtoSchema } from "../models/dtos.ts";

// Request body validation schemas
export const SetupProjectBodySchema = z.object({
	repoUrl: z.string().url("Invalid repository URL"),
	repoType: z.string().optional().default("git"),
	commit: z.string().optional().default(""),
	token: z.string().optional().default(""),
});

// Response validation schemas
export const GetCommentsResponseSchema = z.object({
	message: z.string(),
	repository: RepositoryDtoSchema,
	comments: z.array(CommentDtoSchema),
});

// Type exports from schemas
export type SetupProjectBody = z.infer<typeof SetupProjectBodySchema>;
export type GetCommentsResponse = z.infer<typeof GetCommentsResponseSchema>;
