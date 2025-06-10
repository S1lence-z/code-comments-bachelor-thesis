<script setup lang="ts">
import { ref, provide } from 'vue';
import NavigationBar from './components/NavigationBar.vue';

const routingErrorMessage = ref<string>('');
const isKeyboardMode = ref(false);
provide('isKeyboardMode', isKeyboardMode);

const handleKeyboardModeToggle = (value: boolean) => {
	isKeyboardMode.value = value;
};
</script>

<template>
	<div id="app-root">
		<NavigationBar
			:isKeyboardMode="isKeyboardMode"
			@toggle-keyboard-mode="handleKeyboardModeToggle"
		/>
		<div v-if="routingErrorMessage" class="routing-error-message">
			{{ routingErrorMessage }}
		</div>
		<router-view />
	</div>
</template>

<style scoped>
#app-root {
	height: 100vh;
	width: 100vw;
	display: flex;
	flex-direction: column; /* Allows error message to stack on top of page content */
	background-color: #1e1e1e; /* Consistent background */
	color: #d4d4d4; /* Default text color */
	font-family: Arial, sans-serif;
	overflow: hidden; /* Prevents scrollbars from appearing */
}

.routing-error-message {
	background-color: #5c2222; /* Darker red for error background */
	border-bottom: 1px solid #8c3333; /* Slightly lighter border */
	color: #ffcccc; /* Light red text for contrast */
	padding: 12px 20px;
	text-align: center;
	font-size: 0.9rem;
	box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.loading-app-message {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	font-size: 1.2rem;
	color: #a0aec0; /* Lighter text for loading message */
}

/* Ensure global styles don't interfere too much, or define them here if needed */
:global(body) {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

:global(*, *::before, *::after) {
	box-sizing: inherit;
}
</style>
