<script setup lang="ts">
import type { Ref } from "vue";
import { computed, ref, watch } from "vue";
import type ICommentDto from "../../types/interfaces/ICommentDto";
import CommentDto from "../../types/dtos/CommentDto";
import SlideoutPanel from "../../lib/SlideoutPanel.vue";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { useProjectStore } from "../../stores/projectStore";
import { storeToRefs } from "pinia";
import type ICategoryDto from "../../types/interfaces/ICategoryDto";
import InputSelect from "../../lib/InputSelect.vue";
import InputArea from "../../lib/InputArea.vue";
import { CommentType } from "../../types/enums/CommentType";

const repositoryStore = useRepositoryStore();
const projectStore = useProjectStore();

interface CommentFormPanelProps {
	isVisible: boolean;
	commentFilePath: string | null;
	startLineNumber: number | null;
	endLineNumber: number | null;
	commentId: string | null;
	commentType: CommentType;
}

const props = withDefaults(defineProps<CommentFormPanelProps>(), {
	isVisible: false,
	commentId: null,
	commentFilePath: "",
});

const emit = defineEmits(["update:isVisible"]);

// Store references
const { allCategories, comments } = storeToRefs(repositoryStore) as {
	allCategories: Ref<ICategoryDto[]>;
	comments: Ref<ICommentDto[]>;
};
const { writeApiUrl } = storeToRefs(projectStore) as {
	writeApiUrl: Ref<string>;
};

// Computed properties
const currentComment = computed(() => {
	const existingComment = props.commentId
		? comments.value.find((comment) => comment.id === props.commentId?.toString())
		: null;
	return existingComment || null;
});

const isVisible = computed({
	get: () => props.isVisible,
	set: (value: boolean) => emit("update:isVisible", value),
});

const getSubtitle = computed(() => {
	if (props.commentType === CommentType.Project) return "Project-wide comment";
	if (!props.commentFilePath) return "";

	let lineInfo = "";
	switch (props.commentType) {
		case CommentType.Multiline:
			lineInfo = `from line ${props.startLineNumber || 0} to ${props.endLineNumber}`;
			break;
		case CommentType.Singleline:
			lineInfo = `on line ${props.startLineNumber || 0}`;
			break;
		case CommentType.File:
			lineInfo = "File/Folder Comment";
			break;
		default:
			lineInfo = "";
	}

	return `File: ${props.commentFilePath} ${lineInfo}`;
});

// Form state
const commentCategoryLabel = ref(currentComment.value?.category?.label || "");
const commentContent = ref(currentComment.value?.content || "");

watch(
	() => props.commentId,
	() => {
		if (currentComment.value) {
			commentContent.value = currentComment.value.content || "";
			commentCategoryLabel.value = currentComment.value.category?.label || "";
		} else {
			commentContent.value = "";
			commentCategoryLabel.value = "";
		}
	},
	{ immediate: true }
);

// Methods
const handleSubmit = async () => {
	if (!commentContent.value.trim()) {
		alert("Comment cannot be empty.");
		return;
	}

	if (
		!commentCategoryLabel.value &&
		props.commentType !== CommentType.Project &&
		props.commentType !== CommentType.File
	) {
		alert("Please select a category.");
		return;
	}

	let commentData: ICommentDto | null = null;
	switch (props.commentType) {
		case CommentType.Singleline:
			commentData = CommentDto.Singleline(
				props.commentFilePath || "",
				props.startLineNumber || 0,
				commentContent.value.trim(),
				allCategories.value.find((cat) => cat.label === commentCategoryLabel.value)?.id || "",
				props.commentId?.toString() || null
			);
			break;
		case CommentType.Multiline:
			commentData = CommentDto.Multiline(
				props.commentFilePath || "",
				props.startLineNumber || 0,
				props.endLineNumber || 0,
				commentContent.value.trim(),
				allCategories.value.find((cat) => cat.label === commentCategoryLabel.value)?.id || "",
				props.commentId?.toString() || null
			);
			break;
		case CommentType.File:
			commentData = CommentDto.File(
				props.commentFilePath || "",
				commentContent.value.trim(),
				props.commentId?.toString() || null
			);
			break;
		case CommentType.Project:
			commentData = CommentDto.Project(
				props.commentFilePath || "",
				commentContent.value.trim(),
				props.commentId?.toString() || null
			);
			break;
		default:
			alert("Invalid comment type.");
			return;
	}

	try {
		await repositoryStore.upsertCommentAsync(commentData, writeApiUrl.value);
	} catch (error) {
		alert("Failed to save comment. Please try again.");
	} finally {
		closeModal();
	}
};

const closeModal = () => {
	emit("update:isVisible", false);
};
</script>

<template>
	<SlideoutPanel
		:title="(props.commentId ? 'Edit' : 'Add') + ' Comment'"
		:subtitle="getSubtitle"
		class="space-y-4"
		:isVisible="isVisible"
		@update:isVisible="closeModal"
	>
		<!-- Comment Add/Edit Form Content -->
		<InputSelect
			v-if="props.commentType !== CommentType.Project && props.commentType !== CommentType.File"
			v-model="commentCategoryLabel"
			label="Category"
			:options="allCategories.map((cat) => ({ value: cat.label, label: cat.label }))"
			placeholder="Select a category"
		/>

		<InputArea label="Comment" v-model="commentContent" placeholder="Enter your comment..." :rows="4" />

		<div class="flex justify-end space-x-2">
			<button @click="closeModal" class="btn btn-secondary">Cancel</button>
			<button @click="handleSubmit" class="btn btn-primary">Save</button>
		</div>
	</SlideoutPanel>
</template>
