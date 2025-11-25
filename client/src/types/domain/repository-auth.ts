import type { RepositoryType } from "../shared/repository-type";

export interface RepositoryAuthItem {
	repositoryType: RepositoryType;
	authToken: string;
}
