import { CommentType } from "../enums/CommentType.ts";
import type ICategoryDto from "./ICategoryDto.ts";
import type IProjectDto from "./IProjectDto.ts";
import type ILocationDto from "./ILocationDto.ts";

export default interface ICommentDto {
	id: string | null;
	project?: IProjectDto;
	location: ILocationDto;
	categoryId: string;
	category?: ICategoryDto;
	type: CommentType;
	content: string;
}
