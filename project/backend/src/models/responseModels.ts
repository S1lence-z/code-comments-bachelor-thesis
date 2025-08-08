import { z } from "zod";
import { CommentDtoSchema } from "./dtoModels";
import { RepositoryDtoSchema } from "./dtoModels";
import IGetCommentsResponse from "../../../shared/api/IGetCommentsResponse";

export const GetCommentsResponseSchema = z.object({
	repository: RepositoryDtoSchema,
	comments: z.array(CommentDtoSchema),
});

export type GetCommentsResponse = z.infer<typeof GetCommentsResponseSchema & IGetCommentsResponse>;
