import { defineStore } from "pinia";
import type { TreeNode } from "../types/githubTree";
import type ICommentDto from "../../../shared/dtos/ICommentDto";
import type ICategoryDto from "../../../shared/dtos/ICategoryDto";
import { extractBaseUrl } from "../utils/urlUtils";
import { fetchRepoTreeAPI } from "../services/githubTreeService";
import { fetchComments, addComment, updateComment, deleteComment } from "../services/commentsService";
import { getAllCategories } from "../services/categoryService";
import { useServerStore } from "./serverStore";
import { CommentType } from "../../../shared/enums/CommentType";

export const useRepositoryStore = defineStore("repositoryStore", {
	state: () => ({
		fileTreeData: [] as TreeNode[],
		comments: [] as ICommentDto[],
		categories: [] as ICategoryDto[],
		// Loading states
		isLoadingRepository: false,
		isLoadingComments: false,
		isLoadingCategories: false,
	}),
	getters: {
		fileTree: (state) => state.fileTreeData,
		allComments: (state) => state.comments,
		allCategories: (state) => state.categories,
		// Get comments for a specific file
		getCommentsForFile: (state) => (filePath: string) => {
			return state.comments.filter((comment: ICommentDto) => comment.filePath === filePath) ?? [];
		},
		isTreeFetched: (state) => state.fileTreeData.length > 0,
		isCommentsFetched: (state) => state.comments.length > 0,
		isCategoriesFetched: (state) => state.categories.length > 0,
		isRepositorySetup: (state) =>
			!!state.fileTreeData.length && !!state.comments.length && !!state.categories.length,
		containsProjectComment: (state) => {
			return state.comments.some((comment) => comment.type === CommentType.Project);
		},
	},
	actions: {
		async initializeStoreAsync(repositoryUrl: string, writeApiUrl: string, branch: string, githubPat: string) {
			const serverStore = useServerStore();
			serverStore.startSyncing();

			const promises = [
				this.fetchRepositoryTree(repositoryUrl, branch, githubPat),
				this.fetchAllCommentsAsync(writeApiUrl).catch(() => {
					serverStore.setSyncError("Failed to fetch comments");
				}),
				this.fetchAllCategoriesAsync(writeApiUrl),
			];

			if (!this.isCommentsFetched || !this.isTreeFetched || !this.isCategoriesFetched) {
				await Promise.all(promises);
			}
		},
		async fetchRepositoryTree(repositoryUrl: string, branch: string, githubPat: string) {
			this.isLoadingRepository = true;
			try {
				if (this.isTreeFetched) {
					console.log("File tree already fetched, skipping API call.");
					return;
				}

				if (!repositoryUrl || !repositoryUrl.trim()) {
					console.warn("Cannot fetch repository tree: repositoryUrl is empty or invalid");
					this.fileTreeData = [];
					return;
				}

				this.fileTreeData = await fetchRepoTreeAPI(repositoryUrl, branch, githubPat);
			} catch (error: any) {
				this.fileTreeData = [];
				throw error;
			} finally {
				this.isLoadingRepository = false;
			}
		},
		async fetchAllCommentsAsync(writeApiUrl: string) {
			const serverStore = useServerStore();
			serverStore.startSyncing();
			this.isLoadingComments = true;
			try {
				if (!writeApiUrl || !writeApiUrl.trim()) {
					console.warn("Cannot fetch comments: writeApiUrl is empty or invalid");
					this.comments = [];
					return;
				}

				const response = await fetchComments(writeApiUrl);
				if (!response || !response.comments) {
					serverStore.setSyncError("No comments found in the response");
					console.warn("No comments found in the response");
					return;
				}
				this.comments = response.comments || [];
				serverStore.setSynced();
			} catch (error: any) {
				serverStore.setSyncError("Failed to fetch comments");
				this.comments = [];
				throw error;
			} finally {
				this.isLoadingComments = false;
			}
		},
		async fetchAllCategoriesAsync(writeApiUrl: string) {
			this.isLoadingCategories = true;
			try {
				if (this.isCategoriesFetched) {
					console.log("Categories already fetched, skipping API call.");
					return;
				}

				if (!writeApiUrl || !writeApiUrl.trim()) {
					console.warn("Cannot fetch categories: writeApiUrl is empty or invalid");
					this.categories = [];
					return;
				}

				const baseUrl = extractBaseUrl(writeApiUrl);
				if (!baseUrl) {
					console.warn("Cannot fetch categories: invalid writeApiUrl format");
					this.categories = [];
					return;
				}

				const response = await getAllCategories(baseUrl);
				this.categories = response;
			} catch (error: any) {
				console.error("Error fetching categories:", error);
				this.categories = [];
			} finally {
				this.isLoadingCategories = false;
			}
		},
		// Helper methods for local state management
		upsertCommentLocal(comment: ICommentDto) {
			const index = this.comments.findIndex((c: ICommentDto) => c.id === comment.id);
			if (index !== -1) {
				this.comments[index] = comment;
			} else {
				this.comments.push(comment);
			}
		},
		deleteCommentLocal(commentId: number) {
			const index = this.comments.findIndex((c: ICommentDto) => c.id === commentId);
			if (index !== -1) {
				this.comments.splice(index, 1);
			}
		},
		async upsertCommentAsync(commentData: ICommentDto, writeApiUrl: string): Promise<void> {
			const serverStore = useServerStore();
			try {
				serverStore.startSyncing();
				// Update existing comment
				if (commentData.id > 0) {
					const response = await updateComment(writeApiUrl, commentData.id, commentData);
					if (!response.success) {
						throw new Error("Failed to update comment");
					}
					// Update local state with the updated comment
					this.upsertCommentLocal(commentData);
					serverStore.setSynced();
					return;
				}
				// Add new comment
				const response = await addComment(writeApiUrl, commentData);
				if (!response.commentId) {
					throw new Error("Failed to add comment");
				}
				this.upsertCommentLocal({ ...commentData, id: response.commentId });
				serverStore.setSynced();
			} catch (error: any) {
				serverStore.setSyncError("Failed to upsert comment");
				throw error;
			}
		},
		async deleteCommentAsync(commentId: number, writeApiUrl: string): Promise<void> {
			const serverStore = useServerStore();
			try {
				serverStore.startSyncing();
				const response = await deleteComment(writeApiUrl, commentId);
				if (!response.success) {
					serverStore.setSyncError("Failed to delete comment");
					throw new Error("Failed to delete comment");
				}
				this.deleteCommentLocal(commentId);
				serverStore.setSynced();
			} catch (error: any) {
				serverStore.setSyncError("Failed to delete comment");
				throw error;
			}
		},
		fileContainsComments(filePath: string): boolean {
			return this.comments.some((comment: ICommentDto) => comment.filePath === filePath);
		},
	},
});
