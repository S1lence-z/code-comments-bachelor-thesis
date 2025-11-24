import type { RepositoryType } from "./repository-type.ts";

export default interface ProjectSetupRequest {
	serverBaseUrl: string;
	repositoryUrl: string;
	name: string;
	branch: string;
	commitHash?: string;
	repositoryType?: RepositoryType;
	token?: string;
}
