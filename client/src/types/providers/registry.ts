import type { SourceProvider } from "../interfaces/source-provider";

export interface ProviderMetadata {
	id: string;
	name: string;
	requiresAuth?: boolean;
}

export interface ProviderRegistration {
	metadata: ProviderMetadata;
	factory: () => SourceProvider;
}
