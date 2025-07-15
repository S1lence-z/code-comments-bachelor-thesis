<script setup lang="ts">
import Icon from "./Icon.vue";

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
	iconSize: "18px",
});

const gradientClasses = {
	blue: "gradient-icon-blue",
	green: "gradient-icon-green",
	emerald: "gradient-icon-emerald",
};
</script>

<template>
	<div class="card" :class="props.class">
		<!-- Header with icon and title -->
		<div v-if="title || iconName" class="card-header">
			<div v-if="iconName" class="card-icon" :class="gradientClasses[iconGradient]">
				<Icon :srcName="iconName" :size="iconSize" />
			</div>
			<h2 v-if="title" class="card-title">{{ title }}</h2>
		</div>

		<!-- Subtitle -->
		<p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>

		<!-- Content slot -->
		<slot></slot>
	</div>
</template>
