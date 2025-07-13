<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { fetchRepoTreeAPI } from "../services/githubService";
import { fetchComments, addComment, updateComment } from "../services/commentsService";
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
	<div class="w-full h-full overflow-auto font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
		<div class="flex flex-col h-full mx-auto">
			<div class="px-4 pt-8 text-center rounded-b-lg">
				<h1 class="text-3xl font-bold text-blue-300 md:text-2xl drop-shadow">Project Review</h1>
				<p class="text-lg text-gray-400">
					Add comments and feedback for the project structure, folders, and individual files
				</p>
			</div>
			<div class="flex flex-1 w-full gap-6 p-6">
				<!-- Project File Explorer -->
				<div class="flex-2">
					<ProjectReviewFileExplorer
						:localComments="localComments"
						:projectStructure="projectStructure"
						@saveFileComment="saveFileComment"
						@updateContainsChangedComments="(status) => (containsChangedComments = status)"
						@shownProjectStructure="(structure) => (shownProjectStructure = structure)"
					/>
				</div>

				<!-- Project Summary Components -->
				<div class="flex-1">
					<ProjectReviewSummary
						:localComments="localComments"
						:filteredProjectStructure="shownProjectStructure"
						:containsChangedComments="containsChangedComments"
						@saveProjectOverviewComment="saveProjectOverviewComment"
						@saveCommentsUsingApi="saveCommentsUsingApi"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
