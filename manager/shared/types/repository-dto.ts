import type { RepositoryType } from "./repository-type.ts";

export default interface RepositoryDto {
	id: string;
	repositoryType: RepositoryType;
	repositoryUrl: string;
	branch: string;
	commitHash: string;
}
