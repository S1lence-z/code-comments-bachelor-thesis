<script setup lang="ts">
interface InputAreaProps {
	label?: string;
	placeholder?: string;
	modelValue?: string;
	rows?: number;
	submitBinding?: string;
	submitMatcher?: (event: KeyboardEvent, binding: string) => boolean;
}
const props = withDefaults(defineProps<InputAreaProps>(), {
	modelValue: "",
	placeholder: "Type here...",
	rows: 4,
});
const emit = defineEmits(["update:modelValue", "submit"]);

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const modelValue = computed({
	get: () => props.modelValue,
	set: (value: string) => emit("update:modelValue", value),
});

const handleKeydown = (event: KeyboardEvent) => {
	if (
		props.submitBinding &&
		props.submitMatcher &&
		props.submitMatcher(event, props.submitBinding)
	) {
		event.preventDefault();
		emit("submit");
	}
};

const focus = () => {
	textareaRef.value?.focus();
};

defineExpose({ focus });
</script>

<template>
	<label v-if="props.label" class="block mb-2 text-white font-medium">{{ props.label }}</label>
	<textarea
		ref="textareaRef"
		v-model="modelValue"
		class="w-full text-white p-3 border border-gray-600 rounded-md bg-modern-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-modern-blue"
		:placeholder="props.placeholder"
		:rows="props.rows"
		spellcheck="true"
		@keydown="handleKeydown"
	></textarea>
</template>
