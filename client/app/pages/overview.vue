<script setup lang="ts">
import { CommentType } from "../../../base/app/types/dtos/comment-type";
import { Icon } from "@iconify/vue";

const { t } = useI18n();

const {
	// Computed
	isLoadingComments,
	allComments,
	totalCommentCount,
	groupedCommentsByFile,
	// Local state
	selectedCommentTypeFilter,
	// Methods
	openFileInEditor,
	setCommentTypeFilter,
} = useOverviewPage();
</script>

<template>
	<div class="page">
		<!-- Header -->
		<div class="bg-white/5 backdrop-blur-sm border-b border-white/10">
			<div class="mx-auto px-6 py-8">
				<div class="text-center">
					<h1 class="text-4xl font-bold text-white mb-2">
						{{ t("overviewPage.title") }}
					</h1>
					<p class="text-slate-300 text-lg">{{ t("overviewPage.subtitle") }}</p>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="mx-auto mt-8 mb-8">
			<div class="max-w-7xl mx-auto space-y-8">
				<!-- Filtering Bar -->
				<div class="flex items-center gap-4">
					<label class="text-slate-300 font-semibold uppercase text-lg mr-6">{{
						t("overviewPage.filterByCommentType")
					}}</label>
					<!-- All Comment Types Options -->
					<div
						class="flex items-center backdrop-blur-sm rounded-lg border border-white/10 duration-200 hover:bg-white/10 text-lg uppercase px-4 py-2 cursor-pointer text-white"
						:class="{
							'bg-white/20': selectedCommentTypeFilter === null,
						}"
						@click="setCommentTypeFilter(null)"
					>
						All
					</div>
					<!-- Options by Comment Type -->
					<div
						v-for="commentType in Object.values(CommentType)"
						:key="commentType"
						class="flex items-center backdrop-blur-sm rounded-lg border border-white/10 duration-200 hover:bg-white/10 text-lg uppercase px-4 py-2 cursor-pointer"
						:class="{
							' text-blue-200': commentType === CommentType.Singleline,
							' text-green-200': commentType === CommentType.Multiline,
							' text-yellow-200': commentType === CommentType.File,
							' text-purple-200': commentType === CommentType.Project,
							'bg-white/20': selectedCommentTypeFilter === commentType,
						}"
						@click="setCommentTypeFilter(commentType)"
					>
						{{ commentType }}
					</div>
				</div>

				<!-- Statistics Cards -->
				<CommentStatistics
					:allComments="allComments"
					:commentTypeFilter="selectedCommentTypeFilter"
					:commentsGroupedByFile="groupedCommentsByFile"
				/>

				<!-- Loading State -->
				<div v-if="isLoadingComments" class="text-center mt-12">
					<div class="inline-flex items-center space-x-2">
						<div
							class="animate-spin rounded-full h-6 w-6 border-2 border-modern-blue border-t-transparent"
						></div>
						<span class="text-slate-300">{{ t("common.loading") }}</span>
					</div>
				</div>

				<!-- Empty State -->
				<div v-else-if="totalCommentCount === 0" class="text-center">
					<div class="empty-state">
						<div class="empty-state-icon">
							<Icon icon="mdi:archive" class="w-8 h-8 text-slate-400" />
						</div>
						<h3 class="text-xl font-semibold text-white mb-2">
							{{ t("overviewPage.noCommentsFound") }}
						</h3>
						<p class="text-slate-400 mb-4">
							{{ t("overviewPage.noCommentsFoundSubtext") }}
						</p>
					</div>
				</div>

				<!-- Comments by File -->
				<div v-else class="flex flex-col flex-1 space-y-6">
					<CommentBrowser
						:allCommentsByFile="groupedCommentsByFile"
						:commentTypeFilter="selectedCommentTypeFilter"
						@openFileInEditor="(filePath: string) => openFileInEditor(filePath)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
