import type {
	RepositoryProviderRegistration,
	RepositoryProviderMetadta,
} from "../types/domain/repository-providers";
import type { RepositoryProvider } from "../types/interfaces/repository-provider";

class RepositoryProviderRegistry {
	private providers: Map<string, RepositoryProviderRegistration> = new Map();

	public register(registration: RepositoryProviderRegistration) {
		if (this.providers.has(registration.metadata.id)) {
			throw new Error(`Provider with id '${registration.metadata.id}' is already registered.`);
		}
		this.providers.set(registration.metadata.id, registration);
	}

	public getProvider(id: string): RepositoryProvider {
		const registration = this.providers.get(id);
		if (!registration) {
			throw new Error(`Provider with id '${id}' is not registered.`);
		}

		return registration.factory();
	}

	public getAllMetadata(): RepositoryProviderMetadta[] {
		return Array.from(this.providers.values()).map((reg) => reg.metadata);
	}

	public getMetadataById(id: string): RepositoryProviderMetadta | undefined {
		const registration = this.providers.get(id);
		return registration ? registration.metadata : undefined;
	}
}

export const repositoryProviderRegistry = new RepositoryProviderRegistry();
