import type { RepositoryType } from "../enums/RepositoryType";

export default interface ProjectSetupRequest {
	repositoryUrl: string;
	name: string;
	branch: string;
	commitHash?: string;
	repositoryType?: RepositoryType;
	token?: string;
}
