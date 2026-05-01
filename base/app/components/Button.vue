<script setup lang="ts">
import { Icon } from "@iconify/vue";

type ButtonDisplay = "icon" | "label" | "both";

interface ButtonProps {
	label: string;
	buttonStyle: "primary" | "secondary" | "danger";
	buttonSize: "small" | "medium" | "large";
	disabled?: boolean;
	isLoading?: boolean;
	title?: string;
	ariaLabel?: string;
	iconName?: string;
	display?: ButtonDisplay;
}

interface ButtonEmits {
	(event: "click"): void;
}

const props = defineProps<ButtonProps>();
const emit = defineEmits<ButtonEmits>();

const resolvedTitle = computed(() => props.title ?? props.label);
const resolvedAriaLabel = computed(() => props.ariaLabel ?? props.title ?? props.label);

// Default: icon-only when iconName is supplied, label-only otherwise.
const resolvedDisplay = computed<ButtonDisplay>(() => props.display ?? (props.iconName ? "icon" : "label"));
const showIcon = computed(() => !!props.iconName && resolvedDisplay.value !== "label");
const showLabel = computed(() => resolvedDisplay.value !== "icon");
</script>

<template>
	<button
		class="btn"
		:class="`btn-${props.buttonStyle} btn-${props.buttonSize}`"
		:disabled="props.disabled || props.isLoading"
		:title="resolvedTitle"
		:aria-label="resolvedAriaLabel"
		@click="emit('click')"
	>
		<Icon v-if="props.isLoading" icon="mdi:loading" class="animate-spin w-5 h-5" />
		<template v-else>
			<span class="flex items-center gap-2 justify-center">
				<Icon v-if="showIcon" :icon="props.iconName!" class="w-5 h-5" />
				<span v-if="showLabel">{{ props.label }}</span>
			</span>
		</template>
	</button>
</template>
