import type { RepositoryProvider } from "../interfaces/repository-provider";
import type { RepositoryType } from "../shared/repository-type";

export interface RepositoryProviderMetadta {
	id: RepositoryType;
	name: string;
	requiresAuth?: boolean;
}

export interface RepositoryProviderRegistration {
	metadata: RepositoryProviderMetadta;
	factory: () => RepositoryProvider;
}
