<template>
	<div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
		<div class="modal-content">
			<h3 class="modal-title">Comment on Line {{ lineNumber }}</h3>
			<textarea
				v-model="currentCommentText"
				placeholder="Enter your comment..."
				class="modal-textarea"
				rows="4"
			></textarea>
			<div class="modal-actions">
				<button @click="handleSubmit" class="modal-button save">Save</button>
				<button @click="$emit('close')" class="modal-button cancel">Cancel</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, withDefaults } from 'vue';

interface Props {
  visible: boolean;
  lineNumber: number | null;
  filePath: string | null;
  initialText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialText: ''
});

const emit = defineEmits(['submit', 'close']);

const currentCommentText = ref('');

watch(() => props.initialText, (newVal) => {
  currentCommentText.value = newVal || '';
}, { immediate: true });

watch(() => props.visible, (newVal) => {
  if (newVal) {
    currentCommentText.value = props.initialText || '';
  }
});

function handleSubmit() {
  emit('submit', currentCommentText.value);
}
</script>

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
  background-color: #2d3748; /* Darker background */
  color: #e2e8f0; /* Light text */
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
  margin-bottom: 15px;
  font-size: 1.25rem;
  color: #a0aec0; /* Lighter title color */
}

.modal-textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
  border: 1px solid #4a5568; /* Slightly lighter border */
  background-color: #1a202c; /* Very dark input background */
  color: #e2e8f0; /* Light text for input */
  font-size: 0.9rem;
  resize: vertical;
  box-sizing: border-box;
}

.modal-textarea:focus {
  outline: none;
  border-color: #3182ce; /* Blue border on focus */
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
  background-color: #3182ce; /* Blue save button */
  color: white;
}

.modal-button.save:hover {
  background-color: #2b6cb0;
}

.modal-button.cancel {
  background-color: #4a5568; /* Gray cancel button */
  color: #e2e8f0;
}

.modal-button.cancel:hover {
  background-color: #2d3748;
}
</style>
