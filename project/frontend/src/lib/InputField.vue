<script setup lang="ts">
const props = defineProps<{
	label: string;
	modelValue: string;
	type: string;
	placeholder?: string | "Default";
	required?: boolean | false;
}>();

defineEmits<{
	(event: "update:modelValue", value: string): void;
}>();
</script>

<template>
	<div class="mb-6">
		<label :for="props.label" class="block mb-2 font-bold text-gray-400">{{ props.label }}</label>
		<input
			:type="props.type"
			:id="props.label"
			:placeholder="props.placeholder"
			:required="props.required"
			:value="props.modelValue"
			@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
			class="box-border w-full p-3 text-base text-gray-200 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-400"
		/>
	</div>
</template>
