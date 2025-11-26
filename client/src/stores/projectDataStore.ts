import { defineStore } from "pinia";
import type { TreeNode } from "../types/domain/tree-content";
import type CommentDto from "../types/dtos/comment-dto";
import type CategoryDto from "../types/dtos/category-dto";
import { useSourceProviderFactory } from "../services/providers/source-provider-factory";
import { StandardBackendProvider } from "../services/backend/standard-backend-provider";
import type { BackendProvider } from "../types/interfaces/backend-provider";
import { useServerStatusStore } from "./serverStore";
import { CommentType } from "../types/dtos/comment-type";
import { useFileContentStore } from "./fileContentStore";
import { useSettingsStore } from "./settingsStore";
import { useProjectStore } from "./projectStore";
import { useErrorHandler } from "../composables/useErrorHandler";

// Fallback category when server doesn't respond or returns empty
const FALLBACK_CATEGORY: CategoryDto = {
	id: "__fallback_uncategorized__",
	label: "Uncategorized",
	description: "Default category",
};

export const useProjectDataStore = defineStore("projectDataStore", {
	state: () => ({
		// Data
		currentTreeUrl: "",
		fileTreeData: [] as TreeNode[],
		comments: [] as CommentDto[],
		categories: [] as CategoryDto[],
		// Loading states
		isLoadingRepository: false,
		isLoadingComments: false,
		isLoadingCategories: false,
		isSavingComment: false,
		// Backend Provider
		backendProvider: null as BackendProvider | null,
	}),
	getters: {
		fileTree: (state) => state.fileTreeData,
		allComments: (state) => state.comments,
		allCategories: (state) => {
			// Always return at least one category (fallback if empty)
			return state.categories.length > 0 ? state.categories : [FALLBACK_CATEGORY];
		},
		getCommentsForFile: (state) => (filePath: string) => {
			return state.comments.filter((comment: CommentDto) => comment.location.filePath === filePath) ?? [];
		},
		containsProjectComment: (state) => {
			return state.comments.some((comment) => comment.type === CommentType.Project);
		},
		hasUnsavedChanges: (state) => {
			return state.isSavingComment;
		},
		getDefaultCategory: (state) => {
			return state.categories.length > 0 ? state.categories[0] : FALLBACK_CATEGORY;
		},
	},
	actions: {
		// Load project data from various sources
		async loadProjectDataAsync(
			newRepositoryUrl: string,
			newProjectId: string,
			newBranch: string,
			serverBaseUrl: string,
			repositoryAuthToken: string,
			serverAuthToken: string
		) {
			// Initialize Backend Provider
			this.backendProvider = new StandardBackendProvider(serverBaseUrl, newProjectId, serverAuthToken);

			const promises = [
				this.fetchRepositoryTree(newRepositoryUrl, newBranch, repositoryAuthToken),
				this.fetchAllCommentsAsync(newRepositoryUrl, newBranch, repositoryAuthToken),
				this.fetchAllCategoriesAsync(),
			];
			await Promise.all(promises);
		},
		async fetchRepositoryTree(repositoryUrl: string, branch: string, repositoryAuthToken?: string) {
			const projectStore = useProjectStore();
			const { createProvider } = useSourceProviderFactory();
			const { showWarning, handleError } = useErrorHandler();

			this.isLoadingRepository = true;
			try {
				if (!repositoryUrl || !repositoryUrl.trim()) {
					showWarning("Cannot fetch repository tree: repository is not set.");
					this.fileTreeData = [];
					return;
				}

				if (this.currentTreeUrl === repositoryUrl) {
					return;
				}

				const provider = createProvider(projectStore.getRepositoryType);
				this.fileTreeData = await provider.getRepositoryTree(repositoryUrl, branch, repositoryAuthToken);
				this.currentTreeUrl = repositoryUrl;
			} catch (error) {
				handleError(error);
				this.fileTreeData = [];
			} finally {
				this.isLoadingRepository = false;
			}
		},
		async fetchAllCommentsAsync(githubRepositoryUrl: string, githubBranch: string, repositoryAuthToken?: string) {
			const serverStore = useServerStatusStore();
			const fileContentStore = useFileContentStore();
			const settingsStore = useSettingsStore();
			const { showWarning, handleError } = useErrorHandler();

			// In offline mode, do not fetch comments
			if (settingsStore.isOfflineMode) {
				this.comments = [];
				return;
			}

			if (!this.backendProvider) {
				showWarning("Backend provider not initialized.");
				return;
			}

			try {
				serverStore.startSyncing();
				this.isLoadingComments = true;

				const response = await this.backendProvider.getComments();
				if (!response) {
					serverStore.setSyncError("No comments found on the server.");
					showWarning("No comments found on the server.");
					return;
				}

				// Load commented files content
				this.comments = response || [];
				await fileContentStore.loadCommentedFilesContent(
					this.allComments,
					githubRepositoryUrl,
					githubBranch,
					repositoryAuthToken
				);
				serverStore.setSynced();
			} catch (error) {
				serverStore.setSyncError("Failed to fetch comments");
				handleError(error);
				this.comments = [];
			} finally {
				this.isLoadingComments = false;
			}
		},
		async fetchAllCategoriesAsync() {
			const settingsStore = useSettingsStore();
			const { handleError } = useErrorHandler();

			// In offline mode, do not fetch categories
			if (settingsStore.isOfflineMode) {
				this.categories = [];
				return;
			}

			if (!this.backendProvider) {
				return;
			}

			try {
				this.isLoadingCategories = true;
				const fetchedCategories = await this.backendProvider.getCategories();
				this.categories = fetchedCategories;
			} catch (error) {
				handleError(error, {
					customMessage: "Failed to load categories. Using default.",
				});
				this.categories = [];
			} finally {
				this.isLoadingCategories = false;
			}
		},
		// Methods for server synchronization
		async upsertCommentAsync(commentData: CommentDto): Promise<void> {
			const serverStore = useServerStatusStore();
			const settingsStore = useSettingsStore();
			const { handleError, showSuccess } = useErrorHandler();

			try {
				this.isSavingComment = true;

				// Offline mode
				if (settingsStore.isOfflineMode) {
					// Generate a unique ID for new comments in offline mode
					if (!commentData.id) {
						commentData.id = `offline-${Date.now()}-${Math.random().toString(36)}`;
					}
					this.upsertCommentLocal(commentData);
					showSuccess(commentData.id ? "Comment updated successfully" : "Comment added successfully");
					return;
				}

				if (!this.backendProvider) {
					throw new Error("Backend provider not initialized.");
				}

				// Online mode
				serverStore.startSyncing();

				// Update existing comment
				if (commentData.id) {
					const updatedComment = await this.backendProvider.updateComment(commentData.id, commentData);
					if (!updatedComment.id) {
						throw new Error("Failed to update comment");
					}
					// Update local state with the updated comment
					this.upsertCommentLocal(updatedComment);
					serverStore.setSynced();
					showSuccess("Comment updated successfully");
					return;
				}

				// Add new comment
				const newComment = await this.backendProvider.addComment(commentData);
				this.upsertCommentLocal({ ...newComment, id: newComment.id });
				serverStore.setSynced();
				showSuccess("Comment added successfully");
			} catch (error) {
				serverStore.setSyncError("Failed to upsert comment");
				handleError(error);
				throw error;
			} finally {
				this.isSavingComment = false;
			}
		},
		async deleteCommentAsync(commentId: string): Promise<void> {
			const serverStore = useServerStatusStore();
			const settingsStore = useSettingsStore();
			const { handleError, showSuccess } = useErrorHandler();

			try {
				this.isSavingComment = true;

				// Offline mode
				if (settingsStore.isOfflineMode) {
					this.deleteCommentLocal(commentId);
					showSuccess("Comment deleted successfully");
					return;
				}

				if (!this.backendProvider) {
					throw new Error("Backend provider not initialized.");
				}

				// Online mode
				serverStore.startSyncing();
				await this.backendProvider.deleteComment(commentId);
				this.deleteCommentLocal(commentId);
				serverStore.setSynced();
				showSuccess("Comment deleted successfully");
			} catch (error) {
				handleError(error);
				serverStore.setSyncError("Failed to delete comment");
				throw error;
			} finally {
				this.isSavingComment = false;
			}
		},
		async replyToCommentAsync(parentCommentId: string, commentData: CommentDto): Promise<void> {
			const serverStore = useServerStatusStore();
			const settingsStore = useSettingsStore();
			const { handleError, showSuccess } = useErrorHandler();
			try {
				this.isSavingComment = true;
				// Offline mode
				if (settingsStore.isOfflineMode) {
					// Generate a unique ID for new replies in offline mode
					if (!commentData.id) {
						commentData.id = `offline-${Date.now()}-${Math.random().toString(36)}`;
					}
					this.replyCommentLocal(parentCommentId, commentData);
					showSuccess("Reply added successfully");
					return;
				}

				if (!this.backendProvider) {
					throw new Error("Backend provider not initialized.");
				}

				// Online mode
				serverStore.startSyncing();
				const newReply = await this.backendProvider.replyToComment(parentCommentId, commentData);
				this.replyCommentLocal(parentCommentId, newReply);
				serverStore.setSynced();
				showSuccess("Reply added successfully");
			} catch (error) {
				serverStore.setSyncError("Failed to add reply");
				handleError(error);
				throw error;
			} finally {
				this.isSavingComment = false;
			}
		},
		// Private helper methods for local state management
		upsertCommentLocal(comment: CommentDto) {
			const index = this.comments.findIndex((c: CommentDto) => c.id === comment.id);
			if (index !== -1) {
				this.comments[index] = comment;
			} else {
				this.comments.push(comment);
			}
		},
		deleteCommentLocal(commentId: string) {
			const index = this.comments.findIndex((c: CommentDto) => c.id === commentId);
			if (index !== -1) {
				this.comments.splice(index, 1);
				return; // If we deleted a root comment, we're done
			}

			// Delete from root comment's flat replies array
			for (let i = 0; i < this.comments.length; i++) {
				const comment = this.comments[i];
				if (!comment.replies || comment.replies.length === 0) continue;

				const replyIndex = comment.replies.findIndex((r: CommentDto) => r.id === commentId);
				if (replyIndex !== -1) {
					const newReplies = [...comment.replies];
					newReplies.splice(replyIndex, 1);
					// Update the comment with the modified replies array
					this.comments[i] = {
						...comment,
						replies: newReplies,
					};
					return;
				}
			}
		},
		replyCommentLocal(parentCommentId: string, reply: CommentDto) {
			// Helper function to find the root comment ID for a given parent
			const findRootCommentId = (commentId: string, comments: CommentDto[]): string | null => {
				for (const comment of comments) {
					if (comment.id === commentId) {
						// If this comment has a rootCommentId, return it; otherwise, it IS the root
						return comment.rootCommentId || comment.id;
					}
					if (comment.replies && comment.replies.length > 0) {
						const found = findRootCommentId(commentId, comment.replies);
						if (found) return found;
					}
				}
				return null;
			};

			// Find the root comment ID
			const rootCommentId = findRootCommentId(parentCommentId, this.comments);
			if (!rootCommentId) return;

			// Add the reply to the root comment's flat replies array
			for (let i = 0; i < this.comments.length; i++) {
				const comment = this.comments[i];
				if (comment.id === rootCommentId) {
					const newReplies = comment.replies ? [...comment.replies, reply] : [reply];
					// Update the root comment with the new reply
					this.comments[i] = {
						...comment,
						replies: newReplies,
					};
					return;
				}
			}
		},
		fileContainsComments(filePath: string): boolean {
			return this.comments.some((comment: CommentDto) => comment.location.filePath === filePath);
		},
		fileContainsFileComment(filePath: string): boolean {
			return this.comments.some(
				(comment: CommentDto) => comment.location.filePath === filePath && comment.type === CommentType.File
			);
		},
		expandAllFiles(toExpand: boolean): void {
			const expandItem = (node: TreeNode, expand: boolean) => {
				node.isExpanded = expand;
				if (node.children && node.children.length > 0) {
					node.children.forEach((child) => expandItem(child, expand));
				}
			};

			this.fileTreeData.forEach((node) => {
				expandItem(node, toExpand);
			});
		},
	},
});
