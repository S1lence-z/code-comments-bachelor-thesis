import { repositoryProviderRegistry } from "./repository-provider-registry";

// Import all providers to register them
import "./providers/github-repository-provider";
import "./providers/single-file-repository-provider";

export const useRepositoryProviderFactory = () => {
	return {
		createProvider: (id: string) => repositoryProviderRegistry.getProvider(id),
		getAvailableProviders: () => repositoryProviderRegistry.getAllMetadata(),
	};
};
