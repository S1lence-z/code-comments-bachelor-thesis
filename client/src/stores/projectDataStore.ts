import { defineStore } from "pinia";
import type { TreeNode } from "../types/domain/TreeContent";
import type CommentDto from "../types/dtos/CommentDto";
import type CategoryDto from "../types/dtos/CategoryDto";
import { useSourceProviderFactory } from "../services/sourceProviderFactory";
import useCommentsService from "../services/commentsService";
import useCategoryService from "../services/categoryService";
import { useServerStatusStore } from "./serverStore";
import { CommentType } from "../types/dtos/CommentType";
import { useFileContentStore } from "./fileContentStore";
import { useSettingsStore } from "./settingsStore";
import { useProjectStore } from "./projectStore";
import { useErrorHandler } from "../composables/useErrorHandler";

// TODO: Dummy category to have at least one -> improve, add it also on the server side
const dummyCategoryDto: CategoryDto = {
	id: "dummy-id",
	label: "Uncategorized",
	description: "A default category for uncategorized comments",
};

export const useProjectDataStore = defineStore("projectDataStore", {
	state: () => ({
		// Data
		githubUrlForTree: "",
		fileTreeData: [] as TreeNode[],
		comments: [] as CommentDto[],
		categories: [dummyCategoryDto] as CategoryDto[],
		// Loading states
		isLoadingRepository: false,
		isLoadingComments: false,
		isLoadingCategories: false,
		isSavingComment: false,
	}),
	getters: {
		fileTree: (state) => state.fileTreeData,
		allComments: (state) => state.comments,
		allCategories: (state) => state.categories,
		getCommentsForFile: (state) => (filePath: string) => {
			return state.comments.filter((comment: CommentDto) => comment.location.filePath === filePath) ?? [];
		},
		containsProjectComment: (state) => {
			return state.comments.some((comment) => comment.type === CommentType.Project);
		},
		hasUnsavedChanges: (state) => {
			return state.isSavingComment;
		},
	},
	actions: {
		// Load project data from various sources
		async loadProjectDataAsync(
			newRepositoryUrl: string,
			newRwServerUrl: string,
			newBranch: string,
			authToken: string,
			serverBaseUrl: string
		) {
			const promises = [
				this.fetchRepositoryTree(newRepositoryUrl, newBranch, authToken),
				this.fetchAllCommentsAsync(newRwServerUrl, newRepositoryUrl, newBranch, authToken),
				this.fetchAllCategoriesAsync(serverBaseUrl),
			];
			await Promise.all(promises);
		},
		async fetchRepositoryTree(repositoryUrl: string, branch: string, authToken?: string) {
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

				if (this.githubUrlForTree === repositoryUrl) {
					return;
				}

				const provider = createProvider(projectStore.getRepositoryType);
				this.fileTreeData = await provider.getRepositoryTree(repositoryUrl, branch, authToken);
				this.githubUrlForTree = repositoryUrl;
			} catch (error) {
				handleError(error, {
					customMessage: "Failed to load repository tree.",
				});
				this.fileTreeData = [];
			} finally {
				this.isLoadingRepository = false;
			}
		},
		async fetchAllCommentsAsync(
			rwServerUrl: string,
			githubRepositoryUrl: string,
			githubBranch: string,
			authToken?: string
		) {
			const serverStore = useServerStatusStore();
			const commentsService = useCommentsService();
			const fileContentStore = useFileContentStore();
			const settingsStore = useSettingsStore();
			const { showWarning, handleError } = useErrorHandler();

			// In offline mode, do not fetch comments
			if (settingsStore.isOfflineMode) {
				this.comments = [];
				return;
			}

			try {
				serverStore.startSyncing();
				this.isLoadingComments = true;

				const response = await commentsService.getComments(rwServerUrl);
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
					authToken
				);
				serverStore.setSynced();
			} catch (error) {
				serverStore.setSyncError("Failed to fetch comments");
				handleError(error, {
					customMessage: "Failed to load comments.",
				});
				this.comments = [];
			} finally {
				this.isLoadingComments = false;
			}
		},
		async fetchAllCategoriesAsync(serverBaseUrl: string) {
			const categoryService = useCategoryService();
			const settingsStore = useSettingsStore();
			const { handleError } = useErrorHandler();

			// In offline mode, do not fetch categories
			if (settingsStore.isOfflineMode) {
				this.categories = [dummyCategoryDto];
				return;
			}

			try {
				this.isLoadingCategories = true;
				const fetchedCategories = await categoryService.getAllCategories(serverBaseUrl);
				this.categories = fetchedCategories;
			} catch (error) {
				handleError(error, {
					customMessage: "Failed to load categories. Using default.",
				});
				this.categories = [dummyCategoryDto];
			} finally {
				this.isLoadingCategories = false;
			}
		},
		// Methods for server synchronization
		async upsertCommentAsync(commentData: CommentDto, rwServerUrl: string): Promise<void> {
			const serverStore = useServerStatusStore();
			const commentsService = useCommentsService();
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

				// Online mode
				serverStore.startSyncing();

				// Update existing comment
				if (commentData.id) {
					const updatedComment = await commentsService.updateComment(
						rwServerUrl,
						commentData.id,
						commentData
					);
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
				const newComment = await commentsService.addComment(rwServerUrl, commentData);
				this.upsertCommentLocal({ ...newComment, id: newComment.id });
				serverStore.setSynced();
				showSuccess("Comment added successfully");
			} catch (error) {
				serverStore.setSyncError("Failed to upsert comment");
				handleError(error, {
					customMessage: "Failed to upsert comment.",
				});
				throw error;
			} finally {
				this.isSavingComment = false;
			}
		},
		async deleteCommentAsync(commentId: string, rwServerUrl: string): Promise<void> {
			const serverStore = useServerStatusStore();
			const commentsService = useCommentsService();
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

				// Online mode
				serverStore.startSyncing();
				await commentsService.deleteComment(rwServerUrl, commentId);
				this.deleteCommentLocal(commentId);
				serverStore.setSynced();
				showSuccess("Comment deleted successfully");
			} catch (error) {
				handleError(error, {
					customMessage: "Failed to delete comment.",
				});
				serverStore.setSyncError("Failed to delete comment");
				throw error;
			} finally {
				this.isSavingComment = false;
			}
		},
		async replyToCommentAsync(
			rwServerUrl: string,
			parentCommentId: string,
			commentData: CommentDto
		): Promise<void> {
			const serverStore = useServerStatusStore();
			const commentsService = useCommentsService();
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
				// Online mode
				serverStore.startSyncing();
				const newReply = await commentsService.replyComment(rwServerUrl, parentCommentId, commentData);
				this.replyCommentLocal(parentCommentId, newReply);
				serverStore.setSynced();
				showSuccess("Reply added successfully");
			} catch (error) {
				serverStore.setSyncError("Failed to add reply");
				handleError(error, {
					customMessage: "Failed to add reply.",
				});
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
