import type { RepositoryType } from "./RepositoryType";

export default interface RepositoryDto {
	id: string;
	repositoryType: RepositoryType;
	repositoryUrl: string;
	branch: string;
	commitHash: string;
}
