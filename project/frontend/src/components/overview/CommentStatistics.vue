<script setup lang="ts">
import type ICommentDto from "../../types/interfaces/ICommentDto";
import { CommentType } from "../../types/enums/CommentType";
import Card from "../../lib/Card.vue";
import Icon from "../../lib/Icon.vue";
import { useCommentStatistics, type CommentStatisticsProps } from "../../composables/components/useCommentStatistics";

const props = withDefaults(defineProps<CommentStatisticsProps>(), {
	allComments: () => [] as ICommentDto[],
	commentsGroupedByFile: () => ({} as Record<string, ICommentDto[]>),
});

// Initialize the composable
const {
	// Statistics
	totalCommentCount,
	commentTypeStats,
	totalCategoryCounts,

	// Visibility
	showTotalCommentsCard,
	showFileCommentsCard,
	showSinglelineCommentsCard,
	showMultilineCommentsCard,
	showCategoryDistributionCard,
	showCards,
} = useCommentStatistics(props);
</script>

<template>
	<div v-if="showCards" class="flex space-x-8">
		<Card v-if="showTotalCommentsCard" title="Total" subtitle="All comments in the codebase" class="flex-1">
			<h1 class="text-2xl text-white">{{ totalCommentCount }}</h1>
		</Card>
		<Card v-if="showFileCommentsCard" title="File Comments" subtitle="Total file comments" class="flex-1">
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.File] }}</h1>
		</Card>
		<Card
			v-if="showSinglelineCommentsCard"
			title="Singleline Comments"
			subtitle="Total singleline comments"
			class="flex-1"
		>
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.Singleline] }}</h1>
		</Card>
		<Card
			v-if="showMultilineCommentsCard"
			title="Multiline Comments"
			subtitle="Total multiline comments"
			class="flex-1"
		>
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.Multiline] }}</h1>
		</Card>
		<Card v-if="showCategoryDistributionCard" title="Category Distribution" class="flex-1">
			<div
				v-for="(count, category) in totalCategoryCounts"
				:key="category"
				class="flex items-center justify-between"
			>
				<span class="text-white">{{ category }}</span>
				<span class="text-white">{{ count }}</span>
			</div>
		</Card>
	</div>
	<div v-else class="flex space-x-6 font-semibold text-lg status-message error text-white">
		<div class="card-icon-sm">
			<Icon srcName="error" />
		</div>
		<h1 class="flex items-center">No statistics available for the selected comment type.</h1>
	</div>
</template>
