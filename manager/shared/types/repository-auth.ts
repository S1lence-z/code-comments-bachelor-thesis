import { RepositoryType } from "./repository-type";

export interface RepositoryAuthItem {
	repositoryType: RepositoryType;
	authToken: string;
}
