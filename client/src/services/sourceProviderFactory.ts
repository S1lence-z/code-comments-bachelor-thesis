import type { ISourceProvider } from "../types/interfaces/ISourceProvider";
import { RepositoryType } from "../types/shared/RepositoryType";
import { GithubSourceProvider } from "./providers/GithubSourceProvider";
import { HttpApiSourceProvider } from "./providers/HttpApiSourceProvider";

export const useSourceProviderFactory = () => {
	const createProvider = (repositoryType: RepositoryType): ISourceProvider => {
		switch (repositoryType) {
			case RepositoryType.github:
				return new GithubSourceProvider();
			case RepositoryType.httpApi:
				return new HttpApiSourceProvider();
			default:
				throw new Error(`Unsupported repository type: ${repositoryType}`);
		}
	};

	return { createProvider };
};
