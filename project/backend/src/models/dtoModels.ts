import { z } from "zod";
import ICommentDto from "../../../shared/dtos/ICommentDto.ts";
import IRepositoryDto from "../../../shared/dtos/IRepositoryDto.ts";
import IProjectDto from "../../../shared/dtos/IProjectDto.ts";
import { CommentType } from "../../../shared/enums/CommentType.ts";

export const CommentDtoSchema = z.object({
	id: z.number().int().positive("Comment ID must be a positive integer"),
	filePath: z.string().min(1, "File path is required"),
	content: z.string().min(1, "Comment content is required"),
	type: z.nativeEnum(CommentType, {
		message: "Invalid comment type",
	}),
	lineNumber: z.number().int().positive("Line number must be a positive integer").optional(),
	startLineNumber: z
		.number()
		.int()
		.positive("Start line number must be a positive integer")
		.optional(),
	endLineNumber: z
		.number()
		.int()
		.positive("End line number must be a positive integer")
		.optional(),
	categories: z.array(z.string()).optional(),
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

export type CommentDto = z.infer<typeof CommentDtoSchema & ICommentDto>;
export type ProjectDto = z.infer<typeof ProjectDtoSchema & IProjectDto>;
export type RepositoryDto = z.infer<typeof RepositoryDtoSchema & IRepositoryDto>;
