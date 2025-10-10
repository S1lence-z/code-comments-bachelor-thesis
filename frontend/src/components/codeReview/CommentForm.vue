<script setup lang="ts">
import { useCommentForm } from "../../composables/components/useCommentForm";
import InputSelect from "../../lib/InputSelect.vue";
import InputArea from "../../lib/InputArea.vue";
import type { CommentFormProps, CommentFormEmits } from "../../composables/components/useCommentForm";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<CommentFormProps>();
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
			:label="t('commentForm.categoryLabel')"
			:options="availableCategories"
			:placeholder="t('commentForm.categoryPlaceholder')"
		/>

		<InputArea
			:label="t('commentForm.commentLabel')"
			v-model="commentContent"
			:placeholder="t('commentForm.commentPlaceholder')"
			:rows="4"
			@submit="handleSubmit"
		/>

		<div class="flex justify-end space-x-2">
			<button @click="handleCancel" class="btn btn-secondary">{{ t("commentForm.cancel") }}</button>
			<button v-if="showDeleteButton" @click="handleDelete" class="btn bg-red-500 text-white">
				{{ t("commentForm.delete") }}
			</button>
			<button @click="handleSubmit" class="btn btn-primary">{{ t("commentForm.save") }}</button>
		</div>
	</div>
</template>
