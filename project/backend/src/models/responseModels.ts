import { z } from "zod";
import { CommentDtoSchema } from "./dtoModels.ts";
import { RepositoryDtoSchema } from "./dtoModels.ts";
import IGetCommentsResponse from "../../../shared/api/IGetCommentsResponse.ts";

export const GetCommentsResponseSchema = z.object({
	repository: RepositoryDtoSchema,
	comments: z.array(CommentDtoSchema),
});

export type GetCommentsResponse = z.infer<typeof GetCommentsResponseSchema & IGetCommentsResponse>;
