<script setup lang="ts">
interface CustomSelectProps {
	label: string;
	options: { value: string; label: string }[];
	modelValue: string;
}
const props = defineProps<CustomSelectProps>();

interface CustomSelectEmits {
	(event: "update:modelValue", value: string): void;
}
const emit = defineEmits<CustomSelectEmits>();
</script>

<template>
	<div class="flex flex-col space-y-1">
		<label class="text-sm text-gray-300">{{ props.label }}</label>
		<select
			class="w-full p-2 border border-gray-600 rounded-md bg-modern-black text-white focus:outline-none focus:ring-2 focus:ring-modern-blue"
			:value="props.modelValue"
			@change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
		>
			<option v-for="option in props.options" :key="option.value" :value="option.value">
				{{ option.label }}
			</option>
		</select>
	</div>
</template>
