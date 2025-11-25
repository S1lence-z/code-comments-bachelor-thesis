import type { SourceProvider } from "../interfaces/source-provider";
import type { RepositoryType } from "../shared/repository-type";

export interface ProviderMetadata {
	id: RepositoryType;
	name: string;
	requiresAuth?: boolean;
}

export interface ProviderRegistration {
	metadata: ProviderMetadata;
	factory: () => SourceProvider;
}
