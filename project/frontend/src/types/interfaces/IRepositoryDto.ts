import type { RepositoryType } from "../enums/RepositoryType";

export default interface IRepositoryDto {
	id: string;
	repositoryType: RepositoryType;
	repositoryUrl: string;
	branch: string;
	commitHash: string;
}
