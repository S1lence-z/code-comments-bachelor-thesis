import type { RepositoryType } from "./RepositoryType";

export default interface ProjectSetupRequest {
	serverBaseUrl: string;
	repositoryUrl: string;
	name: string;
	branch: string;
	commitHash?: string;
	repositoryType?: RepositoryType;
	token?: string;
}
