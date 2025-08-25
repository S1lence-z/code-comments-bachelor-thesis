import type IRepositoryDto from "./IRepositoryDto.ts";

export default interface IProjectDto {
	id: string;
	version: string;
	name: string;
	readApiUrl: string;
	writeApiUrl: string;
	repository: IRepositoryDto;
}
