<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Props {
	title?: string;
	subtitle?: string;
	iconName?: string;
	iconSize?: string;
	iconGradient?: "blue" | "green" | "emerald";
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	iconGradient: "blue",
	iconSize: "8",
});

const gradientClasses = {
	blue: "gradient-icon-blue",
	green: "gradient-icon-green",
	emerald: "gradient-icon-emerald",
};

const getIconName = (iconName: string) => {
	const iconMap: Record<string, string> = {
		plus: "mdi:plus",
		archive: "mdi:archive",
		code: "mdi:code-tags",
		folder: "mdi:folder",
		error: "mdi:alert-circle",
		success: "mdi:check-circle",
		empty: "mdi:inbox",
		externalLink: "mdi:external-link",
	};
	return iconMap[iconName] || "mdi:help-circle";
};
</script>

<template>
	<div class="card" :class="props.class">
		<!-- Header with icon and title -->
		<div v-if="title || iconName" class="card-header">
			<div v-if="iconName" class="card-icon" :class="gradientClasses[iconGradient]">
				<Icon :icon="getIconName(iconName)" :class="`w-${iconSize} h-${iconSize}`" />
			</div>
			<h2 v-if="title" class="card-title">{{ title }}</h2>
		</div>

		<!-- Subtitle -->
		<p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>

		<!-- Content slot -->
		<div class="card-content">
			<slot></slot>
		</div>
	</div>
</template>
