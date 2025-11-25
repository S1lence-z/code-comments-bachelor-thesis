<script setup lang="ts">
import type { IconProps } from "@iconify/vue";
import { Icon } from "@iconify/vue";
import { ref } from "vue";

const props = defineProps<{
	label?: string;
	modelValue: string;
	type: string;
	secret?: boolean | false;
	placeholder?: string | "Default";
	required?: boolean | false;
	labelIcon?: IconProps["icon"];
}>();

defineEmits<{
	(event: "update:modelValue", value: string): void;
}>();

const showPassword = ref(false);
</script>

<template>
	<div class="space-y-2">
		<div v-if="props.labelIcon || props.label" class="flex items-center gap-2">
			<Icon v-if="props.labelIcon" :icon="props.labelIcon" class="text-gray-400 w-4 h-4" />
			<label :for="props.label" class="block font-bold text-gray-400">{{ props.label }}</label>
		</div>
		<div class="flex flex-row items-center relative">
			<input
				:type="props.secret ? (showPassword ? 'text' : 'password') : props.type"
				:id="props.label"
				:placeholder="props.placeholder"
				:required="props.required"
				:value="props.modelValue"
				@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
				class="box-border w-full p-3 text-base text-gray-200 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-400"
			/>
			<button
				v-if="props.secret && props.modelValue"
				@click="showPassword = !showPassword"
				type="button"
				class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
			>
				<Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
			</button>
		</div>
	</div>
</template>
