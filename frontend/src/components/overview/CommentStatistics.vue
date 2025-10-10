<script setup lang="ts">
import type CommentDto from "../../types/dtos/CommentDto";
import { CommentType } from "../../types/enums/CommentType";
import Card from "../../lib/Card.vue";
import { useCommentStatistics, type CommentStatisticsProps } from "../../composables/components/useCommentStatistics";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = withDefaults(defineProps<CommentStatisticsProps>(), {
	allComments: () => [] as CommentDto[],
	commentsGroupedByFile: () => ({} as Record<string, CommentDto[]>),
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
		<Card
			v-if="showTotalCommentsCard"
			:title="t('commentStatistics.totalTitle')"
			:subtitle="t('commentStatistics.totalSubtitle')"
			class="flex-1"
		>
			<h1 class="text-2xl text-white">{{ totalCommentCount }}</h1>
		</Card>
		<Card
			v-if="showFileCommentsCard"
			:title="t('commentStatistics.fileCommentsTitle')"
			:subtitle="t('commentStatistics.fileCommentsSubtitle')"
			class="flex-1"
		>
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.File] }}</h1>
		</Card>
		<Card
			v-if="showSinglelineCommentsCard"
			:title="t('commentStatistics.singlelineCommentsTitle')"
			:subtitle="t('commentStatistics.singlelineCommentsSubtitle')"
			class="flex-1"
		>
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.Singleline] }}</h1>
		</Card>
		<Card
			v-if="showMultilineCommentsCard"
			:title="t('commentStatistics.multilineCommentsTitle')"
			:subtitle="t('commentStatistics.multilineCommentsSubtitle')"
			class="flex-1"
		>
			<h1 class="text-2xl text-white">{{ commentTypeStats[CommentType.Multiline] }}</h1>
		</Card>
		<Card
			v-if="showCategoryDistributionCard"
			:title="t('commentStatistics.categoryDistributionTitle')"
			class="flex-1"
		>
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
</template>
