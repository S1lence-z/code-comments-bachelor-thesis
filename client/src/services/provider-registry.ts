import type { ProviderRegistration, ProviderMetadata } from "../types/providers/registry";
import type { ISourceProvider } from "../types/interfaces/ISourceProvider";

class ProviderRegistry {
	private providers: Map<string, ProviderRegistration> = new Map();

	public register(registration: ProviderRegistration) {
		if (this.providers.has(registration.metadata.id)) {
			throw new Error(`Provider with id '${registration.metadata.id}' is already registered.`);
		}
		this.providers.set(registration.metadata.id, registration);
	}

	public getProvider(id: string): ISourceProvider {
		const registration = this.providers.get(id);
		if (!registration) {
			throw new Error(`Provider with id '${id}' is not registered.`);
		}

		return registration.factory();
	}

	public getAllMetadata(): ProviderMetadata[] {
		return Array.from(this.providers.values()).map((reg) => reg.metadata);
	}

	public getMetadataById(id: string): ProviderMetadata | undefined {
		const registration = this.providers.get(id);
		return registration ? registration.metadata : undefined;
	}
}

export const providerRegistry = new ProviderRegistry();
