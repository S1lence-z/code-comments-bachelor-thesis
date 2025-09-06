import { defineStore } from "pinia";
import type { TreeNode } from "../types/github/githubTree";
import type CommentDto from "../types/dtos/CommentDto";
import type CategoryDto from "../types/dtos/CategoryDto";
import { fetchRepoTreeAPI } from "../services/githubTreeService";
import { fetchComments, addComment, updateComment, deleteComment } from "../services/commentsService";
import { getAllCategories } from "../services/categoryService";
import { useServerStore } from "./serverStore";
import { CommentType } from "../types/enums/CommentType";

// Dummy category to ensure at least one category exists
const dummyCategoryDto: CategoryDto = {
	id: "dummy-id",
	label: "Uncategorized",
	description: "A default category for uncategorized comments",
};

export const useRepositoryStore = defineStore("repositoryStore", {
	state: () => ({
		fileTreeData: [] as TreeNode[],
		comments: [] as CommentDto[],
		categories: [] as CategoryDto[],
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
			return state.comments.filter((comment: CommentDto) => comment.location.filePath === filePath) ?? [];
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
		async initializeStoreAsync(
			repositoryUrl: string,
			writeApiUrl: string,
			branch: string,
			githubPat: string,
			backendBaseUrl: string
		) {
			const serverStore = useServerStore();
			serverStore.startSyncing();

			const promises = [
				this.fetchRepositoryTree(repositoryUrl, branch, githubPat),
				this.fetchAllCommentsAsync(writeApiUrl).catch(() => {
					serverStore.setSyncError("Failed to fetch comments");
				}),
				this.fetchAllCategoriesAsync(backendBaseUrl),
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
				if (!response) {
					serverStore.setSyncError("No comments found in the response");
					console.warn("No comments found in the response");
					return;
				}
				this.comments = response || [];
				serverStore.setSynced();
			} catch (error: any) {
				serverStore.setSyncError("Failed to fetch comments");
				this.comments = [];
				throw error;
			} finally {
				this.isLoadingComments = false;
			}
		},
		async fetchAllCategoriesAsync(backendBaseUrl: string) {
			this.isLoadingCategories = true;
			try {
				if (this.isCategoriesFetched) {
					console.log("Categories already fetched, skipping API call.");
					return;
				}

				if (!backendBaseUrl || !backendBaseUrl.trim()) {
					console.warn("Cannot fetch categories: writeApiUrl is empty or invalid");
					this.categories = [];
					return;
				}

				const response = await getAllCategories(backendBaseUrl);
				this.categories = response || [dummyCategoryDto];
			} catch (error: any) {
				console.error("Error fetching categories:", error);
				this.categories = [dummyCategoryDto];
			} finally {
				this.isLoadingCategories = false;
			}
		},
		// Helper methods for local state management
		upsertCommentLocal(comment: CommentDto) {
			const index = this.comments.findIndex((c: CommentDto) => c.id === comment.id);
			if (index !== -1) {
				this.comments[index] = comment;
			} else {
				this.comments.push(comment);
			}
		},
		deleteCommentLocal(commentId: string) {
			console.log("Deleting comment with ID:", commentId);
			const index = this.comments.findIndex((c: CommentDto) => c.id === commentId);
			if (index !== -1) {
				this.comments.splice(index, 1);
			}
		},
		async upsertCommentAsync(commentData: CommentDto, writeApiUrl: string): Promise<void> {
			const serverStore = useServerStore();
			try {
				serverStore.startSyncing();
				// Update existing comment
				if (commentData.id) {
					const updatedComment = await updateComment(writeApiUrl, commentData.id, commentData);
					if (!updatedComment.id) {
						throw new Error("Failed to update comment");
					}
					// Update local state with the updated comment
					this.upsertCommentLocal(updatedComment);
					serverStore.setSynced();
					return;
				}
				// Add new comment
				const newComment = await addComment(writeApiUrl, commentData);
				if (!newComment.id) {
					throw new Error("Failed to add comment");
				}
				this.upsertCommentLocal({ ...newComment, id: newComment.id });
				serverStore.setSynced();
			} catch (error: any) {
				serverStore.setSyncError("Failed to upsert comment");
				throw error;
			}
		},
		async deleteCommentAsync(commentId: string, writeApiUrl: string): Promise<void> {
			const serverStore = useServerStore();
			try {
				serverStore.startSyncing();
				await deleteComment(writeApiUrl, commentId);
				this.deleteCommentLocal(commentId);
				serverStore.setSynced();
			} catch (error: any) {
				serverStore.setSyncError("Failed to delete comment");
				throw error;
			}
		},
		fileContainsComments(filePath: string): boolean {
			return this.comments.some((comment: CommentDto) => comment.location.filePath === filePath);
		},
	},
});
