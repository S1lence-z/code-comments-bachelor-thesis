<script setup lang="ts">
import type { Ref } from "vue";
import { computed, ref, watch } from "vue";
import type ICommentDto from "../../../../shared/dtos/ICommentDto";
import SlideoutPanel from "../../lib/SlideoutPanel.vue";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { useProjectStore } from "../../stores/projectStore";
import { storeToRefs } from "pinia";
import type ICategoryDto from "../../../../shared/dtos/ICategoryDto";
import InputSelect from "../../lib/InputSelect.vue";
import InputArea from "../../lib/InputArea.vue";
import { CommentType } from "../../../../shared/enums/CommentType";

const repositoryStore = useRepositoryStore();
const projectStore = useProjectStore();

interface CommentFormPanelProps {
	isVisible: boolean;
	commentFilePath: string | null;
	startLineNumber: number | null;
	endLineNumber: number | null;
	commentId: number | null;
}

const props = withDefaults(defineProps<CommentFormPanelProps>(), {
	isVisible: false,
	commentId: 0,
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
	return props.commentId ? comments.value.find((comment) => comment.id === props.commentId) : null;
});

const isVisible = computed({
	get: () => props.isVisible,
	set: (value: boolean) => emit("update:isVisible", value),
});

const isSinglelineComment = computed(() => {
	return props.startLineNumber !== null && props.endLineNumber === null;
});

const isMultilineComment = computed(() => {
	return props.startLineNumber !== null && props.endLineNumber !== null;
});

const getSubtitle = computed(() => {
	if (!props.commentFilePath) return "";

	const lineInfo = isMultilineComment.value
		? `from line ${props.startLineNumber || 0} to ${props.endLineNumber}`
		: `on line ${props.startLineNumber || 0}`;

	return `File: ${props.commentFilePath} ${lineInfo}`;
});

// Form state
const commentCategory = ref(currentComment.value?.categories?.[0].label || "");
const commentText = ref(currentComment.value?.content || "");

watch(
	() => props.commentId,
	() => {
		if (currentComment.value) {
			commentText.value = currentComment.value.content || "";
			commentCategory.value = currentComment.value.categories?.[0].label || "";
		} else {
			commentText.value = "";
			commentCategory.value = "";
		}
	},
	{ immediate: true }
);

// Methods
const handleSubmit = async () => {
	if (!commentText.value.trim()) {
		alert("Comment cannot be empty.");
		return;
	}

	if (!commentCategory.value) {
		alert("Please select a category.");
		return;
	}

	const commentData: ICommentDto = {} as ICommentDto;

	if (isSinglelineComment.value) {
		commentData.id = props.commentId || 0;
		commentData.filePath = props.commentFilePath || "";
		commentData.lineNumber = props.startLineNumber || 0;
		commentData.content = commentText.value.trim();
		commentData.type = CommentType.Singleline;
		commentData.categories = allCategories.value.filter((cat) => cat.label === commentCategory.value);
	} else if (isMultilineComment.value) {
		commentData.id = props.commentId || 0;
		commentData.filePath = props.commentFilePath || "";
		commentData.startLineNumber = props.startLineNumber || 0;
		commentData.endLineNumber = props.endLineNumber || 0;
		commentData.content = commentText.value.trim();
		commentData.type = CommentType.Multiline;
		commentData.categories = allCategories.value.filter((cat) => cat.label === commentCategory.value);
	} else {
		alert("Invalid comment type. Please ensure you are adding a singleline or multiline comment.");
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
	commentText.value = "";
	commentCategory.value = "";
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
			v-model="commentCategory"
			label="Category"
			:options="allCategories.map((cat) => ({ value: cat.label, label: cat.label }))"
			placeholder="Select a category"
		/>

		<InputArea label="Comment" v-model="commentText" placeholder="Enter your comment..." :rows="4" />

		<div class="flex justify-end space-x-2">
			<button @click="closeModal" class="btn btn-secondary">Cancel</button>
			<button @click="handleSubmit" class="btn btn-primary">Save</button>
		</div>
	</SlideoutPanel>
</template>
