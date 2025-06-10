import type IRepositoryDto from "./IRepositoryDto.ts";

export default interface IProjectDto {
	identifier: number;
	version: string;
	label: string;
	readApiUrl: string;
	writeApiUrl: string | null;
	repository: IRepositoryDto;
}
