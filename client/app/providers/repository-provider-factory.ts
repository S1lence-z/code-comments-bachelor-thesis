import { repositoryProviderRegistry } from "./repository-provider-registry";

// Import all providers to register them
import "./repository/github-repository-provider";
import "./repository/single-file-repository-provider";

export const useRepositoryProviderFactory = () => {
	return {
		createProvider: (id: string) => repositoryProviderRegistry.getProvider(id),
		getAvailableProviders: () => repositoryProviderRegistry.getAllMetadata(),
	};
};
