import { CommentType } from "../enums/CommentType";
import type ICategoryDto from "../interfaces/ICategoryDto";
import type ICommentDto from "../interfaces/ICommentDto";
import type ILocationDto from "../interfaces/ILocationDto";
import type IProjectDto from "../interfaces/IProjectDto";

export default class CommentDto implements ICommentDto {
	id: string;
	project?: IProjectDto;
	location: ILocationDto;
	categoryId: string;
	category?: ICategoryDto;
	type: CommentType;
	content: string;

	private constructor() {
		throw new Error("Use factory methods instead of direct construction.");
	}

	public static Singleline(
		filePath: string,
		lineNumber: number,
		content: string,
		categoryId: string,
		id: string | null
	): ICommentDto {
		return {
			location: { type: CommentType.Singleline, filePath, lineNumber } as ILocationDto,
			categoryId,
			content,
			type: CommentType.Singleline,
			...(id != null ? { id } : {}),
		} as ICommentDto;
	}

	public static Multiline(
		filePath: string,
		startLineNumber: number,
		endLineNumber: number,
		content: string,
		categoryId: string,
		id: string | null
	): ICommentDto {
		return {
			...(id != null ? { id } : {}),
			location: { type: CommentType.Multiline, filePath, startLineNumber, endLineNumber } as ILocationDto,
			categoryId,
			type: CommentType.Multiline,
			content,
		} as ICommentDto;
	}

	public static File(filePath: string, content: string, id: string | null): ICommentDto {
		return {
			...(id != null ? { id } : {}),
			location: { type: CommentType.File, filePath } as ILocationDto,
			categoryId: "",
			type: CommentType.File,
			content,
		} as ICommentDto;
	}

	public static Project(repositoryName: string, content: string, id: string | null): ICommentDto {
		return {
			...(id != null ? { id } : {}),
			location: { type: CommentType.Project, filePath: repositoryName } as ILocationDto,
			categoryId: "",
			type: CommentType.Project,
			content,
		} as ICommentDto;
	}
}
