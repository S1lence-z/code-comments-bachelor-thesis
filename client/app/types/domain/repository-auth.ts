import type { RepositoryType } from "../../../../base/app/types/repository-type";

export interface RepositoryAuthItem {
	repositoryType: RepositoryType;
	authToken: string;
}
