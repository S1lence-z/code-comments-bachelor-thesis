<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { type TreeNode } from "../types/githubApi";
import type ICommentDto from "../../../shared/dtos/ICommentDto";
import { CommentType } from "../../../shared/enums/CommentType";

const props = defineProps<{
	localComments: {
		projectOverviewComment: ICommentDto;
		fileComments: Record<string, ICommentDto>;
	};
	filteredProjectStructure: TreeNode[];
	containsChangedComments: boolean;
}>();

const emit = defineEmits<{
	(e: "saveProjectOverviewComment", comment: ICommentDto): void;
	(e: "saveCommentsUsingApi"): void;
}>();

const saveCommentsUsingApi = () => {
	emit("saveCommentsUsingApi");
};

const saveProjectOverviewComment = (content: string) => {
	const existingComment = props.localComments.projectOverviewComment;
	if (existingComment && existingComment.content === content) {
		return;
	}

	if (existingComment.id > 0) {
		// Update existing comment
		existingComment.content = content;
		emit("saveProjectOverviewComment", existingComment);
	} else {
		// Create new comment if it doesn't exist
		const newComment: ICommentDto = {
			id: 0,
			content: content,
			type: CommentType.Project,
			filePath: "<repo_path>",
		};
		emit("saveProjectOverviewComment", newComment);
	}
};
</script>

<template>
	<!-- Summary Section with Project Overview -->
	<div class="review-section summary-section">
		<!-- Project Overview -->
		<div class="project-overview-section">
			<div class="section-header">
				<h2>Project Overview</h2>
			</div>
			<div class="project-comment-card">
				<label for="projectComment" class="comment-label"> Overall Project Comments </label>
				<textarea
					id="projectComment"
					:value="props.localComments.projectOverviewComment.content"
					@input="saveProjectOverviewComment(($event.target as HTMLTextAreaElement).value)"
					placeholder="Add your overall thoughts about the project structure, architecture, or general feedback..."
					class="comment-textarea compact"
					rows="3"
				></textarea>
			</div>
		</div>

		<!-- Review Summary -->
		<div class="summary-stats-section">
			<div class="section-header">
				<h2>Review Summary</h2>
			</div>
			<div class="summary-cards">
				<div class="summary-card">
					<div class="summary-number">
						{{ Object.keys(localComments.fileComments).length }}
					</div>
					<div class="summary-label">Files/Folders with Comments</div>
				</div>
				<div class="summary-card">
					<div class="summary-number">
						{{ localComments.projectOverviewComment.content ? "1" : "0" }}
					</div>
					<div class="summary-label">Project Overview Comment</div>
				</div>
				<div class="summary-card">
					<div class="summary-number">{{ filteredProjectStructure.length }}</div>
					<div class="summary-label">Total Items in Structure</div>
				</div>
			</div>
			<button
				id="save-comments-button"
				@click="saveCommentsUsingApi"
				style="width: 100%"
				:disabled="!containsChangedComments"
			>
				Save Comments
			</button>
		</div>
	</div>
</template>

<style scoped>
.review-section {
	background: #2d3748;
	border-radius: 12px;
	padding: 1.5rem;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
	border: 1px solid #4a5568;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.section-header h2 {
	font-size: 1.25rem;
	font-weight: 600;
	color: #e2e8f0;
	margin: 0 0 1rem 0;
}

.summary-section {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.project-overview-section {
	flex-shrink: 0;
}

.project-comment-card {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.summary-stats-section {
	flex: 1;
}

.comment-label {
	display: block;
	font-weight: 500;
	color: #a0aec0;
	margin-bottom: 0.5rem;
	font-size: 0.9rem;
}

.comment-textarea {
	width: 100%;
	padding: 0.75rem;
	border: 1px solid #4a5568;
	border-radius: 8px;
	font-size: 0.9rem;
	font-family: inherit;
	resize: vertical;
	transition: border-color 0.2s;
	background-color: #1a202c;
	color: #e2e8f0;
}

.comment-textarea:focus {
	border-color: #3182ce;
	box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.3);
}

.comment-textarea.compact {
	height: 80px;
	resize: none;
}

.summary-cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 8px;
}

.summary-card {
	background: #1a202c;
	border: 1px solid #4a5568;
	border-radius: 8px;
	padding: 1.5rem;
	text-align: center;
}

.summary-number {
	font-size: 2rem;
	font-weight: 700;
	color: #63b3ed;
	margin-bottom: 0.5rem;
}

.summary-label {
	font-size: 0.9rem;
	font-weight: 500;
	color: #a0aec0;
}

.parent-button {
	background: #3182ce;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 0.25rem 0.5rem;
	font-size: 0.8rem;
	cursor: pointer;
	transition: background-color 0.2s;
}

.parent-button:hover {
	background: #2b6cb0;
}

#save-comments-button {
	background: #3182ce;
	color: white;
	border: none;
	border-radius: 8px;
	padding: 1.5rem 2rem;
	font-size: 1.2rem;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 0.2s;
	margin-top: 1rem;
	width: 100%;
	min-height: 60px;
}

#save-comments-button:hover {
	background: #2b6cb0;
}

#save-comments-button:disabled {
	background: #4a5568;
	cursor: not-allowed;
}

@media (max-width: 768px) {
	.summary-cards {
		grid-template-columns: 1fr;
	}
}
</style>
