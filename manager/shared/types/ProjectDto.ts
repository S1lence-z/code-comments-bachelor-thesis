import type RepositoryDto from "../../../frontend/src/types/dtos/RepositoryDto.js";

export default interface ProjectDto {
	id: string;
	version: string;
	name: string;
	serverBaseUrl: string;
	readWriteApiUrl: string;
	repository: RepositoryDto;
}
