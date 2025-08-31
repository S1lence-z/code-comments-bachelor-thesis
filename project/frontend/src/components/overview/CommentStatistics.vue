<script setup lang="ts">
import type ICommentDto from "../../types/interfaces/ICommentDto";
import { CommentType } from "../../types/enums/CommentType";
import Card from "../../lib/Card.vue";
import { computed } from "vue";
import Icon from "../../lib/Icon.vue";

interface CommentStatisticsProps {
	allComments: ICommentDto[];
	commentTypeFilter: CommentType | null;
	commentsGroupedByFile: Record<string, ICommentDto[]>;
}

const props = withDefaults(defineProps<CommentStatisticsProps>(), {
	allComments: () => [] as ICommentDto[],
	commentsGroupedByFile: () => ({} as Record<string, ICommentDto[]>),
});

// Computed
const totalCommentCount = computed(() => props.allComments.length);

const commentTypeStats = computed(() => {
	const stats = {
		[CommentType.Singleline]: 0,
		[CommentType.Multiline]: 0,
		[CommentType.File]: 0,
		[CommentType.Project]: 0,
	};

	props.allComments.forEach((comment) => {
		stats[comment.type]++;
	});

	return stats;
});

const totalCategoryCounts = computed(() => {
	const groupedCategories: Record<string, number> = {};

	// Get counts for each category
	props.allComments.forEach((comment) => {
		const currentCommentCategory = comment.category || null;

		// If it exists, count it
		if (currentCommentCategory) {
			// Only continue if the comment type matches the filter or is null
			if (props.commentTypeFilter && comment.type !== props.commentTypeFilter) {
				return;
			}

			// Initialize if not already done, else increment
			if (!groupedCategories[currentCommentCategory.label]) {
				groupedCategories[currentCommentCategory.label] = 1;
			} else {
				groupedCategories[currentCommentCategory.label]++;
			}
		}
	});
	return groupedCategories;
});

// Card Visibility Logic
const shouldShowTotalCard = () => {
	return props.commentTypeFilter === null || props.commentTypeFilter === CommentType.Project;
};

const shouldShowFileCommentsCard = () => {
	return (
		props.commentTypeFilter === null ||
		props.commentTypeFilter === CommentType.File ||
		props.commentTypeFilter === CommentType.Project
	);
};

const shouldShowSinglelineCommentsCard = () => {
	return (
		props.commentTypeFilter === null ||
		props.commentTypeFilter === CommentType.Singleline ||
		props.commentTypeFilter === CommentType.Project
	);
};

const shouldShowMultilineCommentsCard = () => {
	return (
		props.commentTypeFilter === null ||
		props.commentTypeFilter === CommentType.Multiline ||
		props.commentTypeFilter === CommentType.Project
	);
};

const shouldShowCategoryDistributionCard = () => {
	return (
		props.commentTypeFilter === null ||
		props.commentTypeFilter === CommentType.Singleline ||
		props.commentTypeFilter === CommentType.Multiline
	);
};

const shouldShowCards = () => {
	return (
		shouldShowTotalCard() ||
		shouldShowFileCommentsCard() ||
		shouldShowSinglelineCommentsCard() ||
		shouldShowMultilineCommentsCard() ||
		shouldShowCategoryDistributionCard()
	);
};
</script>

<template>
	<div v-if="shouldShowCards()" class="flex space-x-8">
		<Card v-if="shouldShowTotalCard()" title="Total" subtitle="All comments in the codebase" class="flex-1">
			<h1 class="text-2xl text-white">{{ totalCommentCount }}</h1>
		</Card>
		<Card v-if="shouldShowFileCommentsCard()" title="File Comments" subtitle="Total file comments" class="flex-1">
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.File] }}</h1>
		</Card>
		<Card
			v-if="shouldShowSinglelineCommentsCard()"
			title="Singleline Comments"
			subtitle="Total singleline comments"
			class="flex-1"
		>
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.Singleline] }}</h1>
		</Card>
		<Card
			v-if="shouldShowMultilineCommentsCard()"
			title="Multiline Comments"
			subtitle="Total multiline comments"
			class="flex-1"
		>
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.Multiline] }}</h1>
		</Card>
		<Card v-if="shouldShowCategoryDistributionCard()" title="Category Distribution" class="flex-1">
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
