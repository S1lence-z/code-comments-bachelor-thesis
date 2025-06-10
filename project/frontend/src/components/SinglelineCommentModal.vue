<script setup lang="ts">
import { ref, watch } from 'vue';
import { inject, computed } from 'vue';
import type { Ref } from 'vue';
import type ICategoryDto from '../../../shared/dtos/ICategoryDto';

interface SinglelineCommentModalProps {
	visible: boolean;
	lineNumber: number | null;
	filePath: string | null;
	initialText?: string;
	initialCategory?: string;
}

const props = withDefaults(defineProps<SinglelineCommentModalProps>(), {
	initialText: '',
	initialCategory: '',
});

const emit = defineEmits(['submit', 'close']);

const currentCommentText = ref('');
const selectedCategory = ref<string | null>(null);
const allCategories = inject('allFetchedCategories') as Ref<ICategoryDto[]>;
const categories = computed(() => allCategories.value);

watch(() => props.initialText, (newVal) => {
	currentCommentText.value = newVal || '';
}, { immediate: true });

watch(() => props.initialCategory, (newVal) => {
	selectedCategory.value = newVal || allCategories.value[0]?.label || null;
}, { immediate: true });

// Watch for when categories become available
watch(() => allCategories.value, (newCategories) => {
	if (newCategories && newCategories.length > 0 && !selectedCategory.value) {
		selectedCategory.value = props.initialCategory || newCategories[0]?.label || null;
	}
}, { immediate: true });

watch(() => props.visible, (newVal) => {
	if (newVal) {
		currentCommentText.value = props.initialText || '';
	}
});

function handleSubmit() {
	if (!currentCommentText.value.trim()) {
		alert('Comment cannot be empty.');
		return;
	}

	if (allCategories.value.length === 0) {
		alert('No categories available. Please create a category first.');
		return;
	}

	if (!selectedCategory.value) {
		alert('Please select a category.');
		return;
	}

	const categoryObject = (allCategories.value.length > 0) ? allCategories.value.find((cat: ICategoryDto) => cat.label === selectedCategory.value) : null;

	if (!categoryObject) {
		alert('Selected category not found.');
		return;
	}

	emit('submit', currentCommentText.value, categoryObject);
}
</script>

<template>
	<div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
		<div class="modal-content">
			<h3 class="modal-title">Comment on Line {{ lineNumber }}</h3>

			<div class="form-group">
				<label class="form-label">Category</label>
				<select v-model="selectedCategory" class="category-select">
					<option
						v-for="category in categories"
						:key="category.id"
						:value="category.label"
					>
						{{ category.label }}
					</option>
				</select>
			</div>

			<div class="form-group">
				<label class="form-label">Comment</label>
				<textarea
					v-model="currentCommentText"
					placeholder="Enter your comment..."
					class="modal-textarea"
					rows="4"
				></textarea>
			</div>

			<div class="modal-actions">
				<button @click="handleSubmit" class="modal-button save">Save</button>
				<button @click="$emit('close')" class="modal-button cancel">Cancel</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.modal-content {
	background-color: #2d3748;
	color: #e2e8f0;
	padding: 25px;
	border-radius: 8px;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	width: 90%;
	max-width: 500px;
	display: flex;
	flex-direction: column;
}

.modal-title {
	margin-top: 0;
	margin-bottom: 20px;
	font-size: 1.25rem;
	color: #a0aec0;
}

.form-group {
	margin-bottom: 20px;
}

.form-label {
	display: block;
	margin-bottom: 8px;
	font-size: 0.9rem;
	color: #a0aec0;
	font-weight: 500;
}

.category-select {
	width: 100%;
	padding: 10px;
	border-radius: 4px;
	border: 1px solid #4a5568;
	background-color: #1a202c;
	color: #e2e8f0;
	font-size: 0.9rem;
	box-sizing: border-box;
	appearance: none;
	background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
	background-position: right 10px center;
	background-repeat: no-repeat;
	background-size: 16px;
	padding-right: 40px;
}

.category-select:focus {
	outline: none;
	border-color: #3182ce;
	box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.3);
}

.modal-textarea {
	width: 100%;
	padding: 10px;
	border-radius: 4px;
	border: 1px solid #4a5568;
	background-color: #1a202c;
	color: #e2e8f0;
	font-size: 0.9rem;
	resize: vertical;
	box-sizing: border-box;
}

.modal-textarea:focus {
	outline: none;
	border-color: #3182ce;
	box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.3);
}

.modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
}

.modal-button {
	padding: 10px 20px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-weight: bold;
	transition: background-color 0.2s ease;
}

.modal-button.save {
	background-color: #3182ce;
	color: white;
}

.modal-button.save:hover {
	background-color: #2b6cb0;
}

.modal-button.cancel {
	background-color: #4a5568;
	color: #e2e8f0;
}

.modal-button.cancel:hover {
	background-color: #2d3748;
}
</style>
