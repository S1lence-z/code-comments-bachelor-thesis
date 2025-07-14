<script setup lang="ts">
import { ref, watch, type Ref } from "vue";
import { computed } from "vue";
import type ICategoryDto from "../../../shared/dtos/ICategoryDto";
import { useRepositoryStore } from "../stores/repositoryStore";
import { storeToRefs } from "pinia";
import Modal from "../lib/Modal.vue";

interface SinglelineCommentModalProps {
	visible: boolean;
	lineNumber: number | null;
	filePath: string | null;
	initialText?: string;
	initialCategory?: string;
}

const props = withDefaults(defineProps<SinglelineCommentModalProps>(), {
	initialText: "",
	initialCategory: "",
});

const emit = defineEmits(["submit", "close"]);

const currentCommentText = ref("");
const selectedCategory = ref<string | null>(null);
const { categories: allCategories } = storeToRefs(useRepositoryStore()) as {
	categories: Ref<ICategoryDto[]>;
};
const categories = computed(() => allCategories.value);

watch(
	() => props.initialText,
	(newVal) => {
		currentCommentText.value = newVal || "";
	},
	{ immediate: true }
);

watch(
	() => props.initialCategory,
	(newVal) => {
		selectedCategory.value = newVal || allCategories.value[0]?.label || null;
	},
	{ immediate: true }
);

// Watch for when categories become available
watch(
	() => allCategories.value,
	(newCategories) => {
		if (newCategories && newCategories.length > 0 && !selectedCategory.value) {
			selectedCategory.value = props.initialCategory || newCategories[0]?.label || null;
		}
	},
	{ immediate: true }
);

watch(
	() => props.visible,
	(newVal) => {
		if (newVal) {
			currentCommentText.value = props.initialText || "";
		}
	}
);

function handleSubmit() {
	if (!currentCommentText.value.trim()) {
		alert("Comment cannot be empty.");
		return;
	}

	if (allCategories.value.length === 0) {
		alert("No categories available. Please create a category first.");
		return;
	}

	if (!selectedCategory.value) {
		alert("Please select a category.");
		return;
	}

	const categoryObject =
		allCategories.value.length > 0
			? allCategories.value.find((cat: ICategoryDto) => cat.label === selectedCategory.value)
			: null;

	if (!categoryObject) {
		alert("Selected category not found.");
		return;
	}

	emit("submit", currentCommentText.value, categoryObject);
}
</script>

<template>
	<Modal v-if="visible" @close="$emit('close')">
		<h3 class="text-xl font-medium mb-5">Comment on Line {{ lineNumber }}</h3>

		<div class="mb-5">
			<label class="block mb-2 text-sm font-medium">Category</label>
			<select
				v-model="selectedCategory"
				class="w-full p-2.5 rounded border border-gray-600 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 appearance-none pr-10"
			>
				<option v-for="category in categories" :key="category.id" :value="category.label">
					{{ category.label }}
				</option>
			</select>
		</div>

		<div class="mb-5">
			<label class="block mb-2 text-smfont-medium">Comment</label>
			<textarea
				v-model="currentCommentText"
				placeholder="Enter your comment..."
				class="w-full p-2.5 rounded border border-gray-600 bg-gray-800 text-gray-200 text-sm resize-y focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30"
				rows="4"
			></textarea>
		</div>

		<div class="flex justify-end gap-2.5">
			<button @click="$emit('close')" class="btn btn-secondary">Cancel</button>
			<button @click="handleSubmit" class="btn btn-primary">Save</button>
		</div>
	</Modal>
</template>
