import type { BackendProvider } from "../../types/interfaces/backend-provider";
import type { AuthResponseDto, LoginRequestDto } from "../../../../base/app/types/authentication";
import type ProjectDto from "../../../../base/app/types/dtos/project-dto";
import type ProjectSetupRequest from "../../../../base/app/types/project-setup-request";

/**
 * Standard backend provider that communicates with the .NET server via REST API.
 */
export class StandardBackendProvider implements BackendProvider {
	private baseUrl: string;
	private authToken?: string;

	constructor(baseUrl: string, authToken?: string) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
		this.authToken = authToken;
	}

	setAuthToken(token: string) {
		this.authToken = token;
	}

	private getHeaders(): HeadersInit {
		const headers: Record<string, string> = { "Content-Type": "application/json" };
		if (this.authToken) {
			headers["Authorization"] = `Bearer ${this.authToken}`;
		}
		return headers;
	}

	async login(password: string): Promise<AuthResponseDto> {
		const requestBody: LoginRequestDto = { password };
		const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		});
		if (!response.ok) {
			throw new Error(`Failed to authenticate: ${response.status} ${response.statusText}`);
		}
		return await response.json();
	}

	async getProjects(): Promise<ProjectDto[]> {
		const response = await fetch(`${this.baseUrl}/api/v1/project`, {
			headers: this.getHeaders(),
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
		}
		return await response.json();
	}

	async createProject(request: ProjectSetupRequest): Promise<ProjectDto> {
		const response = await fetch(`${this.baseUrl}/api/v1/project`, {
			method: "POST",
			headers: this.getHeaders(),
			body: JSON.stringify(request),
		});
		if (!response.ok) {
			throw new Error(`Failed to create project: ${response.status} ${response.statusText}`);
		}
		return await response.json();
	}
}
