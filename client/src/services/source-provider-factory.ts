import { providerRegistry } from "./provider-registry";

// Import all providers to register them
import "./providers/github-source-provider";
import "./providers/single-file-source-provider";

export const useSourceProviderFactory = () => {
	return {
		createProvider: (id: string) => providerRegistry.getProvider(id),
		getAvailableProviders: () => providerRegistry.getAllMetadata(),
	};
};
