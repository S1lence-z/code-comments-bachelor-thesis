import { computed } from "vue";
import type CommentDto from "../../types/dtos/CommentDto";
import { CommentType } from "../../types/enums/CommentType";

export interface CommentStatisticsProps {
	allComments: CommentDto[];
	commentTypeFilter: CommentType | null;
	commentsGroupedByFile: Record<string, CommentDto[]>;
}

export function useCommentStatistics(props: CommentStatisticsProps) {
	// Statistics calculations
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

	// Card visibility logic
	const showTotalCommentsCard = computed(() => {
		return props.commentTypeFilter === null || props.commentTypeFilter === CommentType.Project;
	});

	const showFileCommentsCard = computed(() => {
		return (
			props.commentTypeFilter === null ||
			props.commentTypeFilter === CommentType.File ||
			props.commentTypeFilter === CommentType.Project
		);
	});

	const showSinglelineCommentsCard = computed(() => {
		return (
			props.commentTypeFilter === null ||
			props.commentTypeFilter === CommentType.Singleline ||
			props.commentTypeFilter === CommentType.Project
		);
	});

	const showMultilineCommentsCard = computed(() => {
		return (
			props.commentTypeFilter === null ||
			props.commentTypeFilter === CommentType.Multiline ||
			props.commentTypeFilter === CommentType.Project
		);
	});

	const showCategoryDistributionCard = computed(() => {
		return (
			props.commentTypeFilter === null ||
			props.commentTypeFilter === CommentType.Singleline ||
			props.commentTypeFilter === CommentType.Multiline
		);
	});

	const showCards = computed(() => {
		return (
			showTotalCommentsCard.value ||
			showFileCommentsCard.value ||
			showSinglelineCommentsCard.value ||
			showMultilineCommentsCard.value ||
			showCategoryDistributionCard.value
		);
	});

	return {
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
	};
}
