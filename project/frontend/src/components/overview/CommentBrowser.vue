<script setup lang="ts">
import { computed, ref } from "vue";
import type ICommentDto from "../../types/interfaces/ICommentDto";
import { CommentType } from "../../types/enums/CommentType";
import { useFileContentStore } from "../../stores/fileContentStore";
import Card from "../../lib/Card.vue";
import Button from "../../lib/Button.vue";
import Icon from "../../lib/Icon.vue";
import { getFileName, getFileDirectory } from "../../utils/fileUtils";
import { getCommentTypeIcon, getCommentLocationInfo } from "../../utils/commentUtils";

interface CommentBrowserProps {
	allCommentsByFile: Record<string, ICommentDto[]>;
	commentTypeFilter: CommentType | null;
}

const props = withDefaults(defineProps<CommentBrowserProps>(), {
	allCommentsByFile: () => ({} as Record<string, ICommentDto[]>),
	commentTypeFilter: null,
});

const emit = defineEmits(["openFileInEditor"]);

// Stores
const fileContentStore = useFileContentStore();

// Local state
const expandedFiles = ref<Set<string>>(new Set());
const showedLineOffset = ref(3);

// Computed
const filteredComments = computed(() => {
	if (!props.commentTypeFilter) {
		return props.allCommentsByFile;
	}
	// Filter comments by the selected comment type
	const tempFilteredComments = Object.fromEntries(
		Object.entries(props.allCommentsByFile).map(([filePath, comments]) => [
			filePath,
			comments.filter((comment) => comment.type === props.commentTypeFilter),
		])
	);
	// Remove files with no comments after filtering
	return Object.fromEntries(Object.entries(tempFilteredComments).filter(([, comments]) => comments.length > 0));
});

// Helper functions
const toggleFileExpanded = (filePath: string) => {
	if (expandedFiles.value.has(filePath)) {
		expandedFiles.value.delete(filePath);
	} else {
		expandedFiles.value.add(filePath);
	}
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

	if (comment.type === CommentType.Singleline && comment.location.lineNumber) {
		const startLine = Math.max(0, comment.location.lineNumber - showedLineOffset.value);
		const endLine = Math.min(lines.length, comment.location.lineNumber + showedLineOffset.value);
		return lines.slice(startLine, endLine).join("\n");
	}

	if (comment.type === CommentType.Multiline && comment.location.startLineNumber && comment.location.endLineNumber) {
		const startLine = Math.max(0, comment.location.startLineNumber - showedLineOffset.value);
		const endLine = Math.min(lines.length, comment.location.endLineNumber + showedLineOffset.value);
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
</script>

<template>
	<div v-for="(comments, filePath) in filteredComments" :key="filePath" class="space-y-4">
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
				<div v-for="comment in comments" :key="comment.id ?? ''" class="card-item">
					<div class="space-y-3">
						<!-- Comment Header -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="card-icon-sm">
									<Icon :srcName="getCommentTypeIcon(comment.type)" />
								</div>
								<div>
									<span class="text-white font-medium">{{ comment.type }} Comment</span>
									<span class="text-slate-400 text-sm ml-2">{{
										getCommentLocationInfo(comment)
									}}</span>
								</div>
							</div>
							<div v-if="comment.type !== CommentType.Project" class="flex items-center gap-2">
								<Button
									label="View in Editor"
									buttonStyle="primary"
									type="button"
									:onClick="() => emit('openFileInEditor', filePath)"
								/>
							</div>
						</div>

						<!-- Comment Content -->
						<div class="p-4">
							<!-- Categories -->
							<div v-if="comment.category" class="flex flex-wrap gap-2">
								<span class="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
									{{ comment.category.label }}
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
