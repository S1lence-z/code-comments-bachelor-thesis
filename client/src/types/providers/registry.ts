import type { ISourceProvider } from "../interfaces/ISourceProvider";

export interface ProviderMetadata {
	id: string;
	name: string;
	requiresAuth?: boolean;
}

export interface ProviderRegistration {
	metadata: ProviderMetadata;
	factory: () => ISourceProvider;
}
