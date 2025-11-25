import type { BackendProvider } from "../../types/interfaces/backend-provider";
import { StandardBackendProvider } from "../backend/standard-backend-provider";

export const useBackendProviderFactory = () => {
	const createProvider = (
		type: string = "standard-rest",
		baseUrl: string,
		projectId: string,
		token?: string
	): BackendProvider => {
		switch (type) {
			case "standard-rest":
				return new StandardBackendProvider(baseUrl, projectId, token);
			// Future implementations can be added here
			default:
				throw new Error(`Unknown backend type: ${type}`);
		}
	};

	return { createProvider };
};
