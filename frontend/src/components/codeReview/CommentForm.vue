<script setup lang="ts">
import { useCommentForm } from "../../composables/components/useCommentForm";
import InputSelect from "../../lib/InputSelect.vue";
import InputArea from "../../lib/InputArea.vue";
import type { CommentFormProps, CommentFormEmits } from "../../composables/components/useCommentForm";

const props = withDefaults(defineProps<CommentFormProps>(), {
	isVisible: false,
	commentId: null,
	commentFilePath: "",
});

const emit = defineEmits<CommentFormEmits>();

// Initialize the composable
const {
	// Form state
	commentContent,
	commentCategoryLabel,

	// Computed
	showCategorySelect,
	showDeleteButton,
	availableCategories,

	// Methods
	handleSubmit,
	handleCancel,
	handleDelete,
} = useCommentForm(props, emit);
</script>

<template>
	<!-- Comment Add/Edit Form Content -->
	<div class="flex flex-col space-y-4">
		<InputSelect
			v-if="showCategorySelect"
			v-model="commentCategoryLabel"
			label="Category"
			:options="availableCategories"
			placeholder="Select a category"
		/>

		<InputArea
			label="Comment"
			v-model="commentContent"
			placeholder="Enter your comment..."
			:rows="4"
			@submit="handleSubmit"
		/>

		<div class="flex justify-end space-x-2">
			<button @click="handleCancel" class="btn btn-secondary">Cancel</button>
			<button v-if="showDeleteButton" @click="handleDelete" class="btn bg-red-500 text-white">Delete</button>
			<button @click="handleSubmit" class="btn btn-primary">Save (Ctrl + Enter)</button>
		</div>
	</div>
</template>
