<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { fetchRepoTreeAPI } from "../api/githubApi";
import { fetchComments, addComment, updateComment } from "../api/commentsApi";
import { type TreeNode } from "../types/githubApi";
import type ICommentDto from "../../../shared/dtos/ICommentDto";
import type IGetCommentsResponse from "../../../shared/api/IGetCommentsResponse";
import { CommentType } from "../../../shared/enums/CommentType";
import ProjectReviewSummary from "../components/ProjectReviewSummary.vue";
import ProjectReviewFileExplorer from "../components/ProjectReviewFileExplorer.vue";

const projectStructure = ref<TreeNode[]>([]);
const shownProjectStructure = ref<TreeNode[]>([]);
const GITHUB_PAT = import.meta.env.VITE_GITHUB_PAT || "";
const repoUrl = ref<string>("");
const branchName = ref<string>("");
const apiUrl = ref<string>("");
const allComments = ref<ICommentDto[]>([]);
const containsChangedComments = ref<boolean>(false);

// Local comments state to hold comments for the current session
// TODO: use pinia to persist comments across sessions
const localComments = reactive({
	fileComments: {} as Record<string, ICommentDto>, // Key: path, Value: comment object
	projectOverviewComment: {} as ICommentDto,
});

onMounted(async () => {
	// Get the params from the url
	const urlParams = new URLSearchParams(window.location.search);

	// Extract repoUrl and branchName from the query parameters
	repoUrl.value = urlParams.get("repoUrl") || "";
	if (!repoUrl.value) {
		console.error("No repoUrl provided in the query parameters.");
		return;
	}

	// Default to 'main' if branchName is not provided
	branchName.value = urlParams.get("branch") || "";
	if (!branchName.value) {
		console.error("No branchName provided in the query parameters, defaulting to 'main'.");
		return;
	}

	// Extract commentsApiUrl from the query parameters
	apiUrl.value = urlParams.get("commentsApiUrl") || "";
	if (!apiUrl.value) {
		console.error("No commentsApiUrl provided in the query parameters.");
		return;
	}

	// Fetch all necessary data
	await loadRepoTree();
	await loadComments();
});

async function loadRepoTree() {
	if (!repoUrl.value || !branchName.value) {
		console.error("repoUrl or branchName is not set.");
		return;
	}

	try {
		const tree = await fetchRepoTreeAPI(
			decodeURIComponent(repoUrl.value),
			decodeURIComponent(branchName.value),
			GITHUB_PAT
		);
		projectStructure.value = tree;
	} catch (error) {
		console.error("Failed to fetch project structure:", error);
	}
}

async function loadComments() {
	if (!repoUrl.value || !branchName.value) {
		console.error("repoUrl or branchName is not set.");
		return;
	}

	try {
		const commentsResponse: IGetCommentsResponse = await fetchComments(apiUrl.value);
		allComments.value = commentsResponse.comments || [];

		// Initialize local comments from fetched data
		localComments.fileComments = {};
		allComments.value.forEach((comment: ICommentDto) => {
			if (comment.type === CommentType.File) {
				// Only add file comments to local state
				localComments.fileComments[comment.filePath] = comment;
			} else if (comment.type === CommentType.Project) {
				localComments.projectOverviewComment = comment;
			}
		});
	} catch (error) {
		allComments.value = [];
		console.error("Failed to fetch comments:", error);
	}
}

async function saveCommentsUsingApi() {
	try {
		if (!apiUrl.value || !repoUrl.value || !branchName.value) {
			console.error("API URL, repoUrl, or branchName is not set.");
			return;
		}

		// Prepare the comments from the local state
		const commentsToSave: ICommentDto[] = Object.entries(localComments.fileComments).map(
			([localFilePath, comment]) => {
				comment.filePath = localFilePath;
				return comment;
			}
		);
		// Add the project overview comment if it exists
		commentsToSave.push(localComments.projectOverviewComment);

		// Send comments to the API
		for (const comment of commentsToSave) {
			// Skip comments that do not have a filePath or content
			if (!comment.filePath || !comment.content) {
				console.warn("Skipping comment with missing filePath or content:", comment);
				continue;
			}
			// If the comment already has an id, update it
			if (comment.id > 0) {
				console.log(comment);
				const response = await updateComment(apiUrl.value, comment.id, comment);
				if (!response.success) {
					throw new Error(`Failed to update comment for ${comment.filePath}`);
				}
				continue;
			}
			// If the comment is new (id is 0), add it
			const response = await addComment(apiUrl.value, comment);
			if (!response.success) {
				throw new Error(`Failed to save comment for ${comment.filePath}`);
			}
		}

		console.log("Comments saved and updated successfully");
	} catch (error) {
		console.error("Error saving comments:", error);
	} finally {
		containsChangedComments.value = false;
	}
}

const saveFileComment = (path: string, comment: ICommentDto) => {
	containsChangedComments.value = true;
	if (!comment || comment.content.trim() === "") {
		containsChangedComments.value = false;
	} else {
		localComments.fileComments[path] = comment;
	}
};

const saveProjectOverviewComment = (comment: ICommentDto) => {
	containsChangedComments.value = true;
	if (comment.content.trim() === "") {
		containsChangedComments.value = false;
	} else {
		localComments.projectOverviewComment = comment;
	}
};

watch(
	() => localComments,
	() => {
		console.log(localComments);
	},
	{ deep: true }
);
</script>

<template>
	<div class="project-review-page">
		<div class="page-header">
			<h1>Project Review</h1>
			<p class="page-description">
				Add comments and feedback for the project structure, folders, and individual files
			</p>
		</div>
		<div class="review-content">
			<!-- Project File Explorer -->
			<ProjectReviewFileExplorer
				:localComments="localComments"
				:projectStructure="projectStructure"
				@saveFileComment="saveFileComment"
				@updateContainsChangedComments="(status) => (containsChangedComments = status)"
				@shownProjectStructure="(structure) => (shownProjectStructure = structure)"
			/>

			<!-- Project Summary Components -->
			<ProjectReviewSummary
				:localComments="localComments"
				:filteredProjectStructure="shownProjectStructure"
				:containsChangedComments="containsChangedComments"
				@saveProjectOverviewComment="saveProjectOverviewComment"
				@saveCommentsUsingApi="saveCommentsUsingApi"
			/>
		</div>
	</div>
</template>

<style scoped>
.project-review-page {
	height: 100vh;
	width: 100vw;
	padding: 1rem;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	background-color: #1a202c;
}

.page-header {
	text-align: center;
	margin-bottom: 1rem;
	flex-shrink: 0;
}

.page-header h1 {
	font-size: 2rem;
	font-weight: 600;
	color: #e2e8f0;
	margin-bottom: 0.25rem;
}

.page-description {
	font-size: 1rem;
	color: #a0aec0;
	margin: 0;
}

.review-content {
	display: grid;
	grid-template-columns: 3fr 1fr;
	gap: 1rem;
	flex: 1;
	min-height: 0;
}

@media (max-width: 768px) {
	.project-review-page {
		padding: 1rem;
	}

	.review-content {
		grid-template-columns: 1fr;
	}
	.page-header h1 {
		font-size: 1.5rem;
	}
}
</style>
