<script setup lang="ts">
import { ref, provide } from "vue";
import NavigationBar from "./components/app/AppNavigationBar.vue";
import AppFooter from "./components/app/AppFooter.vue";

// State to manage keyboard mode
const isKeyboardMode = ref(false);
provide("isKeyboardMode", isKeyboardMode);

// State to manage syncedState
const isServerSynced = ref(true);
provide("isServerSynced", isServerSynced);

// Function to handle keyboard mode toggle
const handleKeyboardModeToggle = (value: boolean) => {
	isKeyboardMode.value = value;
};
</script>

<template>
	<div class="flex flex-col h-screen overflow-hidden">
		<!-- Navigation Bar -->
		<NavigationBar
			:isKeyboardMode="isKeyboardMode"
			@update:isKeyboardMode="handleKeyboardModeToggle"
			:isServerSynced="isServerSynced"
		/>
		<!-- Main Content -->
		<main class="flex-1 overflow-hidden">
			<router-view />
		</main>
		<!-- Footer -->
		<AppFooter />
	</div>

	<!-- Global Testing Modal -->
	<div v-if="false" class="modal">
		<div class="modal-content">
			<p>Welcome to the Code Review App! Please set up your project to start reviewing code.</p>
			<button class="btn-primary" @click="$router.push('/setup')">Get Started</button>
		</div>
	</div>
</template>
