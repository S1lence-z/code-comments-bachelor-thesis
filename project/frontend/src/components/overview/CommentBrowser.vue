<script setup lang="ts">
import { onMounted, ref } from "vue";
import type ICommentDto from "../../../../shared/dtos/ICommentDto";
import { CommentType } from "../../../../shared/enums/CommentType";
import { useFileContentStore } from "../../stores/fileContentStore";
import Card from "../../lib/Card.vue";
import Button from "../../lib/Button.vue";
import Icon from "../../lib/Icon.vue";
import { useRouter } from "vue-router";

interface CommentBrowserProps {
	allComments: ICommentDto[];
	repositoryUrl: string;
	branch: string;
	commentsApiUrl: string;
	githubPersonalAccessToken: string;
	isLoadingComments: boolean;
	commentsByFile: Record<string, ICommentDto[]>;
	errorMessage?: string;
}
const props = withDefaults(defineProps<CommentBrowserProps>(), {
	allComments: () => [] as ICommentDto[],
});

// Router
const router = useRouter();

// Stores
const fileContentStore = useFileContentStore();

// Local state
// TODO: for expanded files use a pinia store or session storage to persist the state of opened files
const expandedFiles = ref<Set<string>>(new Set());
const showedLineOffset = ref(3);

// Helper functions
const getFileName = (filePath: string) => {
	return filePath.split("/").pop() || filePath;
};

const getFileDirectory = (filePath: string) => {
	const parts = filePath.split("/");
	return parts.slice(0, -1).join("/") || "/";
};

const toggleFileExpanded = (filePath: string) => {
	if (expandedFiles.value.has(filePath)) {
		expandedFiles.value.delete(filePath);
	} else {
		expandedFiles.value.add(filePath);
	}
};

const getCommentTypeLabel = (type: CommentType) => {
	switch (type) {
		case CommentType.Singleline:
			return "Line";
		case CommentType.Multiline:
			return "MultiLine";
		case CommentType.File:
			return "File";
		case CommentType.Project:
			return "Project";
		default:
			return "Unknown";
	}
};

const getCommentTypeIcon = (type: CommentType) => {
	switch (type) {
		case CommentType.Singleline:
			return "arrow";
		case CommentType.Multiline:
			return "code";
		case CommentType.File:
			return "closedFolder";
		case CommentType.Project:
			return "archive";
		default:
			return "code";
	}
};

const getLineRangeDisplay = (comment: ICommentDto) => {
	if (comment.type === CommentType.Singleline && comment.lineNumber) {
		return `Line ${comment.lineNumber}`;
	}
	if (comment.type === CommentType.Multiline && comment.startLineNumber && comment.endLineNumber) {
		return `Lines ${comment.startLineNumber}-${comment.endLineNumber}`;
	}
	if (comment.type === CommentType.File) {
		return "File comment";
	}
	if (comment.type === CommentType.Project) {
		return "Whole Project comment";
	}
	return "Unknown";
};

const getCodePreview = (filePath: string, comment: ICommentDto) => {
	if (!fileContentStore.isFileCached(filePath)) {
		return "Loading...";
	}

	const cachedFile = fileContentStore.fileContentCache.get(filePath);
	if (!cachedFile || !cachedFile.content) {
		return "Content not available";
	}

	const lines = cachedFile.content.split("\n");

	if (comment.type === CommentType.Singleline && comment.lineNumber) {
		const startLine = Math.max(0, comment.lineNumber - showedLineOffset.value);
		const endLine = Math.min(lines.length, comment.lineNumber + showedLineOffset.value);
		return lines.slice(startLine, endLine).join("\n");
	}

	if (comment.type === CommentType.Multiline && comment.startLineNumber && comment.endLineNumber) {
		const startLine = Math.max(0, comment.startLineNumber - showedLineOffset.value);
		const endLine = Math.min(lines.length, comment.endLineNumber + showedLineOffset.value);
		return lines.slice(startLine, endLine).join("\n");
	}

	return "No preview available";
};

const hasCodePreview = (comment: ICommentDto) => {
	switch (comment.type) {
		case CommentType.Singleline:
		case CommentType.Multiline:
			return true;
		case CommentType.File:
		case CommentType.Project:
		default:
			return false;
	}
};

const openFileInEditor = (filePath: string, comment: ICommentDto) => {
	const params = {
		repoUrl: props.repositoryUrl,
		commentsApiUrl: props.commentsApiUrl,
		branch: props.branch,
		file: filePath,
		...(comment.lineNumber ? { line: comment.lineNumber.toString() } : {}),
	};
	router.push({ path: "/review/code", query: params });
};

const loadAllFilePreviewContent = async () => {
	const filePaths = Object.keys(props.commentsByFile);
	for (const filePath of filePaths) {
		if (!fileContentStore.isFileCached(filePath)) {
			try {
				await fileContentStore.getFileContentAsync(
					filePath,
					props.repositoryUrl,
					props.branch,
					props.githubPersonalAccessToken
				);
			} catch (error) {
				console.error(`Failed to load content for ${filePath}:`, error);
			}
		}
	}
};

onMounted(async () => {
	await loadAllFilePreviewContent();
});
</script>

<template>
	<div v-for="(comments, filePath) in commentsByFile" :key="filePath" class="space-y-4">
		<Card>
			<!-- File Header -->
			<div class="flex items-center justify-between cursor-pointer" @click="toggleFileExpanded(filePath)">
				<div class="flex items-center gap-3">
					<div class="card-icon-sm">
						<Icon srcName="closedFolder" />
					</div>
					<div>
						<h3 class="text-xl font-semibold text-white">{{ getFileName(filePath) }}</h3>
						<p class="text-slate-400 text-sm">{{ getFileDirectory(filePath) }}</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
						{{ comments.length }} comment{{ comments.length === 1 ? "" : "s" }}
					</span>
				</div>
			</div>

			<!-- Comments List For the File -->
			<div v-if="expandedFiles.has(filePath)" class="space-y-4 mt-6">
				<!-- Comment Cards -->
				<div v-for="comment in comments" :key="comment.id" class="card-item">
					<div class="space-y-3">
						<!-- Comment Header -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="card-icon-sm">
									<Icon :srcName="getCommentTypeIcon(comment.type)" />
								</div>
								<div>
									<span class="text-white font-medium"
										>{{ getCommentTypeLabel(comment.type) }} Comment</span
									>
									<span class="text-slate-400 text-sm ml-2">{{ getLineRangeDisplay(comment) }}</span>
								</div>
							</div>
							<div v-if="comment.type !== CommentType.Project" class="flex items-center gap-2">
								<Button
									label="View in Editor"
									buttonStyle="primary"
									type="button"
									:onClick="() => openFileInEditor(filePath, comment)"
								/>
							</div>
						</div>

						<!-- Comment Content -->
						<div class="p-4">
							<!-- Categories -->
							<div
								v-if="comment.categories && comment.categories.length > 0"
								class="flex flex-wrap gap-2"
							>
								<span
									v-for="category in comment.categories"
									:key="category.id"
									class="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs"
								>
									{{ category.label }}
								</span>
							</div>
							<div class="mt-2 text-lg">
								<p class="text-slate-200 whitespace-pre-wrap">{{ comment.content }}</p>
							</div>
							<!-- Code Preview -->
							<div v-if="hasCodePreview(comment)" class="mt-4">
								<div class="bg-slate-900 rounded-lg p-4 border border-white/10">
									<pre
										class="text-slate-300 text-sm overflow-x-auto"
									><code>{{ getCodePreview(filePath, comment) }}</code></pre>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card>
	</div>
</template>
