import { CommentType } from "../enums/CommentType.ts";
import type CategoryDto from "./CategoryDto.ts";
import type ProjectDto from "./ProjectDto.ts";
import type LocationDto from "./LocationDto.ts";

export default interface CommentDto {
	id: string | null;
	project?: ProjectDto;
	location: LocationDto;
	categoryId: string | null;
	category?: CategoryDto;
	type: CommentType;
	content: string;
}
