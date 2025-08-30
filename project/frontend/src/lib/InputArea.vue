<script setup lang="ts">
import { computed } from "vue";

interface InputAreaProps {
	label?: string;
	placeholder?: string;
	modelValue?: string;
	rows?: number;
}
const props = withDefaults(defineProps<InputAreaProps>(), {
	modelValue: "",
	placeholder: "Type here...",
	rows: 4,
});
const emit = defineEmits(["update:modelValue", "submit"]);

const modelValue = computed({
	get: () => props.modelValue,
	set: (value: string) => emit("update:modelValue", value),
});

const handleKeydown = (event: KeyboardEvent) => {
	if (event.ctrlKey && event.key === "Enter") {
		event.preventDefault();
		emit("submit");
	}
};
</script>

<template>
	<label v-if="props.label" class="block mb-2 text-white font-medium">{{ props.label }}</label>
	<textarea
		v-model="modelValue"
		class="w-full text-white p-3 border border-gray-600 rounded-md bg-modern-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-modern-blue"
		:placeholder="props.placeholder"
		:rows="props.rows"
		@keydown="handleKeydown"
	></textarea>
</template>
