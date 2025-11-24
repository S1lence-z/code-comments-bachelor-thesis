import type RepositoryDto from "./repository-dto.ts";

export default interface ProjectDto {
	id: string;
	version: string;
	name: string;
	serverBaseUrl: string;
	readWriteApiUrl: string;
	repository: RepositoryDto;
}
