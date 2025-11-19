<script setup lang="ts">
import type { IconProps } from "@iconify/vue";
import { Icon } from "@iconify/vue";

const props = defineProps<{
	label?: string;
	modelValue: string;
	type: string;
	placeholder?: string | "Default";
	required?: boolean | false;
	labelIcon?: IconProps["icon"];
}>();

defineEmits<{
	(event: "update:modelValue", value: string): void;
}>();
</script>

<template>
	<div class="space-y-2">
		<div v-if="props.labelIcon || props.label" class="flex items-center gap-2">
			<Icon v-if="props.labelIcon" :icon="props.labelIcon" class="text-gray-400 w-4 h-4" />
			<label
				:for="props.label"
				class="block font-bold text-gray-400"
				>{{ props.label }}</label
			>
		</div>
		<input
			:type="props.type"
			:id="props.label"
			:placeholder="props.placeholder"
			:required="props.required"
			:value="props.modelValue"
			@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
			class="box-border w-full p-3 text-base text-gray-200 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-400"
		/>
	</div>
</template>
