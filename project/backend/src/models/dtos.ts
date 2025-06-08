import { z } from "zod";

export const CommentDtoSchema = z.object({
	filePath: z.string().min(1, "File path is required"),
	lineNumber: z.number().int().positive("Line number must be a positive integer"),
	content: z.string().min(1, "Comment content is required"),
	tags: z.array(z.string()).optional(),
});

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

export type CommentDto = z.infer<typeof CommentDtoSchema>;
export type ProjectDto = z.infer<typeof ProjectDtoSchema>;
export type RepositoryDto = z.infer<typeof RepositoryDtoSchema>;
