<script setup lang="ts">
import { CommentType } from "../../types/dtos/CommentType";
import Card from "../../lib/Card.vue";
import Button from "../../lib/Button.vue";
import { getFileName, getFileDirectory } from "../../utils/fileUtils";
import { getCommentTypeIcon, getCommentLocationInfo } from "../../utils/commentUtils";
import {
	useCommentBrowser,
	type CommentBrowserEmits,
	type CommentBrowserProps,
} from "../../composables/overview/useCommentBrowser";
import { useI18n } from "vue-i18n";
import { onMounted } from "vue";

const { t } = useI18n();

const props = defineProps<CommentBrowserProps>();
const emit = defineEmits<CommentBrowserEmits>();

// Initialize the composable
const {
	// State
	expandedFiles,

	// Computed
	projectComments,
	fileBasedComments,

	// Methods
	toggleFileExpanded,
	getCodePreview,
	hasCodePreview,
	handleOpenFileInEditor,
	loadOpenCardsState,
} = useCommentBrowser(props, emit);

// Load saved state when component mounts
onMounted(() => {
	loadOpenCardsState();
});
</script>

<template>
	<!-- Project Comments -->
	<div v-for="comment in projectComments" :key="comment.id ?? ''" class="">
		<Card>
			<!-- Comment Header -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="card-icon-sm">
						<Icon :icon="getCommentTypeIcon(comment.type)" class="w-8 h-8 text-blue-400" />
					</div>
					<div>
						<span class="text-white font-medium">{{ comment.type }} Comment</span>
						<span class="text-slate-400 text-sm ml-2">{{ getCommentLocationInfo(comment) }}</span>
					</div>
				</div>
			</div>
			<!-- Comment Content -->
			<div class="p-4 text-lg">
				<p class="text-slate-200 whitespace-pre-wrap">{{ comment.content }}</p>
			</div>
		</Card>
	</div>

	<!-- File-Based Comments -->
	<div v-for="(comments, filePath) in fileBasedComments" :key="filePath" class="space-y-4">
		<Card>
			<!-- File Header -->
			<div class="flex items-center justify-between cursor-pointer" @click="toggleFileExpanded(filePath)">
				<div class="flex items-center gap-3">
					<div class="card-icon-sm">
						<Icon icon="mdi:folder" class="w-8 h-8 text-amber-300" />
					</div>
					<div>
						<h3 class="text-xl font-semibold text-white">{{ getFileName(filePath) }}</h3>
						<p class="text-slate-400 text-sm">{{ getFileDirectory(filePath) }}</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
						{{ comments.length }}
						{{ comments.length === 1 ? t("commentBrowser.comment") : t("commentBrowser.comments") }}
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
									<Icon :icon="getCommentTypeIcon(comment.type)" class="w-8 h-8 text-blue-400" />
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
									:label="t('commentBrowser.viewInEditor')"
									buttonStyle="primary"
									buttonSize="medium"
									@click="handleOpenFileInEditor(filePath)"
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

	<!-- No Comments Available -->
	<div
		v-if="projectComments.length === 0 && Object.keys(fileBasedComments).length === 0"
		class="flex space-x-6 font-semibold text-lg status-message error text-white"
	>
		<div class="card-icon-sm">
			<Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-400" />
		</div>
		<h1 class="flex items-center">{{ t("commentBrowser.noStatsAvailable") }}</h1>
	</div>
</template>
