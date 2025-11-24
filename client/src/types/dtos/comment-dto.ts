import { CommentType } from "./comment-type.ts";
import type CategoryDto from "./category-dto.ts";
import type ProjectDto from "../shared/project-dto.ts";
import type LocationDto from "./location-dto.ts";

export default interface CommentDto {
	id: string | null;
	project?: ProjectDto;
	location: LocationDto;
	categoryId: string | null;
	category?: CategoryDto;
	type: CommentType;
	content: string;
	// Threading fields
	rootCommentId: string | null;
	parentCommentId: string | null;
	depth?: number;
	replies?: CommentDto[];
}
