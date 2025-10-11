import { defineStore } from "pinia";
import type { TreeNode } from "../types/github/githubTree";
import type CommentDto from "../types/dtos/CommentDto";
import type CategoryDto from "../types/dtos/CategoryDto";
import useGithubTreeService from "../services/githubTreeService";
import useCommentsService from "../services/commentsService";
import useCategoryService from "../services/categoryService";
import { useServerStatusStore } from "./serverStore";
import { CommentType } from "../types/enums/CommentType";
import { useFileContentStore } from "./fileContentStore";

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
		async loadProjectDataAsync(
			newRepositoryUrl: string,
			newRwApiUrl: string,
			newBranch: string,
			githubPat: string,
			serverBaseUrl: string
		) {
			const serverStore = useServerStatusStore();
			serverStore.startSyncing();

			const promises = [
				this.fetchRepositoryTree(newRepositoryUrl, newBranch, githubPat),
				this.fetchAllCommentsAsync(newRwApiUrl, newRepositoryUrl, newBranch, githubPat),
				this.fetchAllCategoriesAsync(serverBaseUrl),
			];
			await Promise.all(promises);
		},
		async fetchRepositoryTree(repositoryUrl: string, branch: string, githubPat: string) {
			const githubTreeService = useGithubTreeService();
			this.isLoadingRepository = true;
			try {
				if (!repositoryUrl || !repositoryUrl.trim()) {
					console.warn("Cannot fetch repository tree: repositoryUrl is empty or invalid");
					this.fileTreeData = [];
					return;
				}

				if (this.githubUrlForTree === repositoryUrl) {
					console.log("File tree already fetched, skipping API call.");
					return;
				}

				this.fileTreeData = await githubTreeService.getRepositoryTree(repositoryUrl, branch, githubPat);
				this.githubUrlForTree = repositoryUrl;
			} catch (error: any) {
				this.fileTreeData = [];
			} finally {
				this.isLoadingRepository = false;
			}
		},
		async fetchAllCommentsAsync(
			rwApiUrl: string,
			githubRepositoryUrl: string,
			githubBranch: string,
			githubPat?: string
		) {
			const serverStore = useServerStatusStore();
			const commentsService = useCommentsService();
			const fileContentStore = useFileContentStore();
			serverStore.startSyncing();
			this.isLoadingComments = true;
			try {
				if (!rwApiUrl || !rwApiUrl.trim()) {
					serverStore.setSyncError("Failed to fetch comments");
					console.warn("Cannot fetch comments: rwApiUrl is empty or invalid");
					this.comments = [];
					return;
				}

				const response = await commentsService.getComments(rwApiUrl);
				if (!response) {
					serverStore.setSyncError("No comments found in the response");
					console.warn("No comments found in the response");
					return;
				}
				// Load commented files content
				this.comments = response || [];
				await fileContentStore.loadCommentedFilesContent(
					this.allComments,
					githubRepositoryUrl,
					githubBranch,
					githubPat
				);
				serverStore.setSynced();
			} catch (error) {
				serverStore.setSyncError("Failed to fetch comments");
				this.comments = [];
			} finally {
				this.isLoadingComments = false;
			}
		},
		async fetchAllCategoriesAsync(serverBaseUrl: string) {
			const { getAllCategories } = useCategoryService();
			this.isLoadingCategories = true;
			try {
				if (!serverBaseUrl || !serverBaseUrl.trim()) {
					console.warn("Cannot fetch categories: serverBaseUrl is empty or invalid");
					return;
				}

				const fetchedCategories = await getAllCategories(serverBaseUrl);
				this.categories = fetchedCategories;
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
			const index = this.comments.findIndex((c: CommentDto) => c.id === commentId);
			if (index !== -1) {
				this.comments.splice(index, 1);
			}
		},
		// Methods for server synchronization
		async upsertCommentAsync(commentData: CommentDto, rwApiUrl: string): Promise<void> {
			const serverStore = useServerStatusStore();
			const commentsService = useCommentsService();

			try {
				this.isSavingComment = true;
				// Handle offline mode
				if (!rwApiUrl || !rwApiUrl.trim()) {
					// Generate a unique ID for new comments in offline mode
					if (!commentData.id) {
						commentData.id = `offline-${Date.now()}-${Math.random().toString(36)}`;
					}
					// Populate the category
					commentData.category =
						this.categories.find((cat) => cat.id === commentData.category?.id) || dummyCategoryDto;
					this.upsertCommentLocal(commentData);
					return;
				}

				// Online mode
				serverStore.startSyncing();

				// Update existing comment
				if (commentData.id) {
					const updatedComment = await commentsService.updateComment(rwApiUrl, commentData.id, commentData);
					if (!updatedComment.id) {
						throw new Error("Failed to update comment");
					}
					// Update local state with the updated comment
					this.upsertCommentLocal(updatedComment);
					serverStore.setSynced();
					return;
				}

				// Add new comment
				const newComment = await commentsService.addComment(rwApiUrl, commentData);
				if (!newComment.id) {
					throw new Error("Failed to add comment");
				}
				this.upsertCommentLocal({ ...newComment, id: newComment.id });
				serverStore.setSynced();
			} catch (error: any) {
				serverStore.setSyncError("Failed to upsert comment");
			} finally {
				this.isSavingComment = false;
			}
		},
		async deleteCommentAsync(commentId: string, rwApiUrl: string): Promise<void> {
			const serverStore = useServerStatusStore();
			const commentsService = useCommentsService();

			try {
				this.isSavingComment = true;
				// Handle offline mode
				if (!rwApiUrl || !rwApiUrl.trim()) {
					console.log("Operating in offline mode - deleting comment locally only");
					this.deleteCommentLocal(commentId);
					return;
				}

				// Online mode
				serverStore.startSyncing();
				await commentsService.deleteComment(rwApiUrl, commentId);
				this.deleteCommentLocal(commentId);
				serverStore.setSynced();
			} catch (error: any) {
				serverStore.setSyncError("Failed to delete comment");
			} finally {
				this.isSavingComment = false;
			}
		},
		// Other helper methods
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
