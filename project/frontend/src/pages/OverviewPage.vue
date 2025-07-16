<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRepositoryStore } from "../stores/repositoryStore";
import { storeToRefs } from "pinia";
import Button from "../lib/Button.vue";
import Icon from "../lib/Icon.vue";
import type ICommentDto from "../../../shared/dtos/ICommentDto";
import { CommentType } from "../../../shared/enums/CommentType";
import CommentStatistics from "../components/overview/CommentStatistics.vue";
import CommentBrowser from "../components/overview/CommentBrowser.vue";
import { useRouter } from "vue-router";

// Router
const router = useRouter();

// Stores
const repositoryStore = useRepositoryStore();

// Store refs
const { allComments, repositoryUrl, branch, githubPersonalAccessToken, isLoadingComments, errorMessage } =
	storeToRefs(repositoryStore);

// Filtering state
const selectedCommentTypeFilter = ref<CommentType | null>(null);

// Computed properties
const filteredComments = computed(() => {
	if (!selectedCommentTypeFilter.value) {
		return allComments.value;
	}
	return allComments.value.filter((comment) => comment.type === selectedCommentTypeFilter.value);
});

const totalComments = computed(() => allComments.value.length);

const commentsByFile = computed(() => {
	const grouped: Record<string, ICommentDto[]> = {};

	filteredComments.value.forEach((comment) => {
		if (!grouped[comment.filePath]) {
			grouped[comment.filePath] = [];
		}
		grouped[comment.filePath].push(comment);
	});

	// Sort comments within each file by line number
	Object.keys(grouped).forEach((filePath) => {
		grouped[filePath].sort((a, b) => {
			if (a.lineNumber && b.lineNumber) {
				return a.lineNumber - b.lineNumber;
			}
			if (a.startLineNumber && b.startLineNumber) {
				return a.startLineNumber - b.startLineNumber;
			}
			return 0;
		});
	});

	return grouped;
});

const navigateToCodeReview = () => {
	router.push({
		path: "/review/code",
		query: router.currentRoute.value.query,
	});
};

onMounted(async () => {
	try {
		await repositoryStore.initializeData();
	} catch (error) {
		console.error("Failed to initialize repository data:", error);
	}
});
</script>

<template>
	<div class="page">
		<!-- Header -->
		<div class="bg-white/5 backdrop-blur-sm border-b border-white/10">
			<div class="mx-auto px-6 py-8">
				<div class="text-center">
					<h1 class="text-4xl font-bold text-white mb-2">Comments Overview</h1>
					<p class="text-slate-300 text-lg">Review all comments across your codebase</p>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="mx-auto mt-12 mb-8">
			<div class="max-w-7xl mx-auto space-y-8">
				<!-- Filtering Bar -->
				<div class="flex items-center gap-4">
					<label class="text-slate-300 font-semibold uppercase text-lg mr-6">Filter By Comment Type:</label>
					<div
						class="flex items-center backdrop-blur-sm rounded-lg border border-white/10 duration-200 hover:bg-white/10 text-lg uppercase px-4 py-2 cursor-pointer text-white"
						:class="{
							'bg-white/20': selectedCommentTypeFilter === null,
						}"
						@click="selectedCommentTypeFilter = null"
					>
						All
					</div>
					<div
						v-for="commentType in Object.values(CommentType)"
						:key="commentType"
						class="flex items-center backdrop-blur-sm rounded-lg border border-white/10 duration-200 hover:bg-white/10 text-lg uppercase px-4 py-2 cursor-pointer"
						:class="{
							' text-blue-200': commentType === CommentType.SingleLine,
							' text-green-200': commentType === CommentType.MultiLine,
							' text-yellow-200': commentType === CommentType.File,
							' text-purple-200': commentType === CommentType.Project,
							'bg-white/20': selectedCommentTypeFilter === commentType,
						}"
						@click="selectedCommentTypeFilter = selectedCommentTypeFilter = commentType"
					>
						{{ commentType }}
					</div>
				</div>

				<!-- Statistics Cards -->
				<CommentStatistics
					:allComments="filteredComments"
					:commentTypeFilter="selectedCommentTypeFilter"
					:commentsGroupedByFile="commentsByFile"
				/>

				<!-- Loading State -->
				<div v-if="isLoadingComments" class="text-center mt-12">
					<div class="inline-flex items-center space-x-2">
						<div
							class="animate-spin rounded-full h-6 w-6 border-2 border-modern-blue border-t-transparent"
						></div>
						<span class="text-slate-300">Loading comments...</span>
					</div>
				</div>

				<!-- Error State -->
				<div v-else-if="errorMessage && !isLoadingComments" class="status-message error">
					<div class="flex items-center gap-3">
						<p class="text-red-400">{{ errorMessage }}</p>
					</div>
				</div>

				<!-- Empty State -->
				<div v-else-if="totalComments === 0" class="text-center mt-16">
					<div class="empty-state">
						<div class="empty-state-icon">
							<Icon srcName="archive" size="32px" />
						</div>
						<h3 class="text-xl font-semibold text-white mb-2">No Comments Found</h3>
						<p class="text-slate-400 mb-4">Start adding comments to your code review session</p>
						<Button
							label="Go to Code Review"
							buttonStyle="primary"
							type="button"
							:onClick="navigateToCodeReview"
						/>
					</div>
				</div>

				<!-- Comments by File -->
				<div v-else class="flex flex-col flex-1 space-y-6">
					<CommentBrowser
						:allComments="filteredComments"
						:repositoryUrl="repositoryUrl"
						:branch="branch"
						:commentsApiUrl="repositoryStore.commentsApiUrl"
						:githubPersonalAccessToken="githubPersonalAccessToken"
						:isLoadingComments="isLoadingComments"
						:errorMessage="errorMessage"
						:commentsByFile="commentsByFile"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
