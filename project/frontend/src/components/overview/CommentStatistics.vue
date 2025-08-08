<script setup lang="ts">
import type ICommentDto from "../../../../shared/dtos/ICommentDto";
import { CommentType } from "../../../../shared/enums/CommentType";
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

const totalComments = computed(() => props.allComments.length);
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
const totalCommentedFilesAndFolders = computed(() => {
	return Object.keys(props.commentsGroupedByFile).length;
});
const categoryCounts = computed(() => {
	const groupedCategories: Record<string, number> = {};
	props.allComments.forEach((comment) => {
		const categories = comment.categories || [];
		categories.forEach((category) => {
			if (!groupedCategories[category.label]) {
				groupedCategories[category.label] = 0;
			}
			groupedCategories[category.label]++;
		});
	});
	return groupedCategories;
});

const shouldShowTotalCard = () => {
	return props.commentTypeFilter === null || props.commentTypeFilter === CommentType.Project;
};
const shouldShowFileAndFoldersCard = () => {
	return (
		props.commentTypeFilter === null ||
		props.commentTypeFilter === CommentType.File ||
		props.commentTypeFilter === CommentType.Project
	);
};
const shouldShowSingleLineCard = () => {
	return (
		props.commentTypeFilter === null ||
		props.commentTypeFilter === CommentType.Singleline ||
		props.commentTypeFilter === CommentType.Project
	);
};
const shouldShowMultiLineCard = () => {
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
		shouldShowFileAndFoldersCard() ||
		shouldShowSingleLineCard() ||
		shouldShowMultiLineCard() ||
		shouldShowCategoryDistributionCard()
	);
};
</script>

<template>
	<div v-if="shouldShowCards()" class="flex space-x-8">
		<Card v-if="shouldShowTotalCard()" title="Total" subtitle="All comments in the codebase" class="flex-1">
			<h1 class="text-2xl text-white">{{ totalComments }}</h1>
		</Card>
		<Card
			v-if="shouldShowFileAndFoldersCard()"
			title="Files/Folders"
			subtitle="Commented files and folders"
			class="flex-1"
		>
			<h1 class="text-2xl text-white">{{ totalCommentedFilesAndFolders }}</h1>
		</Card>
		<Card
			v-if="shouldShowSingleLineCard()"
			title="Singleline"
			subtitle="Singleline comments in files"
			class="flex-1"
		>
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.Singleline] }}</h1>
		</Card>
		<Card v-if="shouldShowMultiLineCard()" title="Multiline" subtitle="Multiline comments in files" class="flex-1">
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.Multiline] }}</h1>
		</Card>
		<Card v-if="shouldShowCategoryDistributionCard()" title="Category Distribution" class="flex-1">
			<div v-for="(count, category) in categoryCounts" :key="category" class="flex items-center justify-between">
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
