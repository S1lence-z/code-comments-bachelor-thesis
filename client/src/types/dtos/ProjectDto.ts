import type RepositoryDto from "./RepositoryDto";

export default interface ProjectDto {
	id: string;
	version: string;
	name: string;
	serverBaseUrl: string;
	readWriteApiUrl: string;
	repository: RepositoryDto;
}
