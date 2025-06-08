import ICommentDto from "../dtos/ICommentDto.ts";
import IRepositoryDto from "../dtos/IRepositoryDto.ts";

export default interface IGetCommentsResponse {
	repository: IRepositoryDto;
	comments: ICommentDto[];
}
