import type { BackendProvider } from "../../types/interfaces/backend-provider";
import type CommentDto from "../../../../base/app/types/dtos/comment-dto";
import type CategoryDto from "../../../../base/app/types/dtos/category-dto";

export class StandardBackendProvider implements BackendProvider {
	private baseUrl: string;
	private projectId: string;
	private authToken?: string;

	constructor(baseUrl: string, projectId: string, authToken?: string) {
		// Ensure no trailing slash for consistency
		this.baseUrl = baseUrl.replace(/\/$/, "");
		this.projectId = projectId;
		this.authToken = authToken;
	}

	setAuthToken(token: string) {
		this.authToken = token;
	}

	private getHeaders(): HeadersInit {
		const headers: any = { "Content-Type": "application/json" };
		if (this.authToken) {
			headers["Authorization"] = `Bearer ${this.authToken}`;
		}
		return headers;
	}

	private getProjectBaseUrl(): string {
		return `${this.baseUrl}/api/v1/project/${this.projectId}`;
	}

	async getComments(): Promise<CommentDto[]> {
		const response = await fetch(`${this.getProjectBaseUrl()}/comments`, {
			headers: this.getHeaders(),
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
		}
		return await response.json();
	}

	async addComment(comment: CommentDto): Promise<CommentDto> {
		const response = await fetch(`${this.getProjectBaseUrl()}/comments`, {
			method: "POST",
			headers: this.getHeaders(),
			body: JSON.stringify(comment),
		});
		if (!response.ok) {
			throw new Error(`Failed to add comment: ${response.status} ${response.statusText}`);
		}
		return await response.json();
	}

	async updateComment(commentId: string, comment: CommentDto): Promise<CommentDto> {
		const response = await fetch(`${this.getProjectBaseUrl()}/comments/${commentId}`, {
			method: "PUT",
			headers: this.getHeaders(),
			body: JSON.stringify(comment),
		});
		if (!response.ok) {
			throw new Error(`Failed to update comment: ${response.status} ${response.statusText}`);
		}
		return await response.json();
	}

	async deleteComment(commentId: string): Promise<void> {
		const response = await fetch(`${this.getProjectBaseUrl()}/comments/${commentId}`, {
			method: "DELETE",
			headers: this.getHeaders(),
		});
		if (!response.ok) {
			throw new Error(`Failed to delete comment: ${response.status} ${response.statusText}`);
		}
	}

	async replyToComment(parentCommentId: string, comment: CommentDto): Promise<CommentDto> {
		const response = await fetch(
			`${this.getProjectBaseUrl()}/comments/${parentCommentId}/reply`,
			{
				method: "POST",
				headers: this.getHeaders(),
				body: JSON.stringify(comment),
			}
		);
		if (!response.ok) {
			throw new Error(
				`Failed to reply to comment: ${response.status} ${response.statusText}`
			);
		}
		return await response.json();
	}

	async getCommentThread(rootCommentId: string): Promise<CommentDto[]> {
		const response = await fetch(
			`${this.getProjectBaseUrl()}/comments/${rootCommentId}/thread`,
			{
				headers: this.getHeaders(),
			}
		);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch comment thread: ${response.status} ${response.statusText}`
			);
		}
		return await response.json();
	}

	async getCategories(): Promise<CategoryDto[]> {
		const response = await fetch(`${this.baseUrl}/api/v1/category`, {
			headers: this.getHeaders(),
		});
		if (!response.ok) {
			throw new Error(
				`Failed to fetch categories: ${response.status} ${response.statusText}`
			);
		}
		return await response.json();
	}
}
