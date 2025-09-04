import type RepositoryDto from "./RepositoryDto.ts";

export default interface ProjectDto {
	id: string;
	version: string;
	name: string;
	readApiUrl: string;
	writeApiUrl: string;
	repository: RepositoryDto;
}
