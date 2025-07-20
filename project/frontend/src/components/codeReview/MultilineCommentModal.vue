<script setup lang="ts">
import { computed, type Ref } from "vue";
import type ICategoryDto from "../../../../shared/dtos/ICategoryDto";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { storeToRefs } from "pinia";
import Modal from "../../lib/Modal.vue";
import Card from "../../lib/Card.vue";
import InputSelect from "../../lib/InputSelect.vue";
import InputArea from "../../lib/InputArea.vue";

interface MultilineCommentModalProps {
	isVisible: boolean;
	startLineNumber: number | null;
	endLineNumber: number | null;
	filePath: string | null;
	commentText: string;
	commentCategory: string;
}

const props = withDefaults(defineProps<MultilineCommentModalProps>(), {
	commentText: "",
});

const emit = defineEmits(["submit", "update:isVisible", "update:commentText", "update:commentCategory"]);
const isVisible = computed({
	get: () => props.isVisible,
	set: (value: boolean) => emit("update:isVisible", value),
});
const commentText = computed({
	get: () => props.commentText,
	set: (value: string) => emit("update:commentText", value),
});
const selectedCommentCategory = computed({
	get: () => props.commentCategory,
	set: (value: string) => emit("update:commentCategory", value),
});
const { allCategories } = storeToRefs(useRepositoryStore()) as {
	allCategories: Ref<ICategoryDto[]>;
};

function handleSubmit() {
	if (!commentText.value.trim()) {
		alert("Comment cannot be empty.");
		return;
	}

	if (allCategories.value.length === 0) {
		alert("No categories available. Please create a category first.");
		return;
	}

	if (!selectedCommentCategory.value) {
		alert("Please select a category.");
		return;
	}

	const categoryObject =
		allCategories.value.length > 0
			? allCategories.value.find((cat: ICategoryDto) => cat.label === selectedCommentCategory.value)
			: null;

	if (!categoryObject) {
		alert("Selected category not found.");
		return;
	}

	emit("update:isVisible", false);
	emit("submit", commentText.value, categoryObject);
}

function closeModal() {
	emit("update:isVisible", false);
	commentText.value = "";
	emit("update:commentCategory", "");
}
</script>

<template>
	<Modal v-if="isVisible" @close="closeModal">
		<Card
			:title="'Comment from line ' + startLineNumber + ' to ' + endLineNumber"
			:subtitle="'Add a comment to file ' + props.filePath"
		>
			<div class="space-y-4">
				<InputSelect
					label="Category"
					v-model="selectedCommentCategory"
					:options="allCategories.map((cat) => ({ value: cat.label, label: cat.label }))"
					placeholder="Select a category"
				/>

				<InputArea label="Comment" v-model="commentText" placeholder="Enter your comment here..." :rows="6" />

				<div class="flex justify-end space-x-2">
					<button @click="closeModal" class="btn btn-secondary">Cancel</button>
					<button
						@click="handleSubmit"
						class="btn btn-primary"
						:disabled="!commentText || !selectedCommentCategory"
					>
						Save
					</button>
				</div>
			</div>
		</Card>
	</Modal>
</template>
