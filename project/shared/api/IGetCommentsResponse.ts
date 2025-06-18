import type ICommentDto from "../dtos/ICommentDto.ts";
import type IRepositoryDto from "../dtos/IRepositoryDto.ts";

export default interface IGetCommentsResponse {
	repository: IRepositoryDto;
	comments: ICommentDto[];
}
