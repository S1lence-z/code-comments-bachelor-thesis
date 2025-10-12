<script setup lang="ts">
import { computed } from "vue";
interface InputSelectProps {
	modelValue: string;
	options: { value: string; label: string }[];
	label?: string;
	placeholder?: string;
}
const props = withDefaults(defineProps<InputSelectProps>(), {
	modelValue: "",
	placeholder: "Select an option",
});
const emit = defineEmits(["update:modelValue"]);

const modelValue = computed({
	get: () => props.modelValue,
	set: (value: string) => emit("update:modelValue", value),
});

function wasOptionSelected(): boolean {
	return props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== "";
}
</script>

<template>
	<label v-if="props.label" class="block mb-2 text-white font-medium">{{ props.label }}</label>
	<select
		v-model="modelValue"
		class="w-full text-white p-3 border border-gray-600 rounded-md bg-modern-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-modern-blue"
		:placeholder="props.placeholder"
	>
		<option v-if="!wasOptionSelected()" value="" disabled selected>
			{{ props.placeholder }}
		</option>
		<option v-for="option in props.options" :key="option.value" :value="option.value">
			{{ option.label }}
		</option>
	</select>
</template>
