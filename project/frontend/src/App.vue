<script setup lang="ts">
import { ref, provide } from "vue";
import NavigationBar from "./lib/AppNavigationBar.vue";
import AppFooter from "./lib/AppFooter.vue";

const isKeyboardMode = ref(false);
provide("isKeyboardMode", isKeyboardMode);

const handleKeyboardModeToggle = (value: boolean) => {
	isKeyboardMode.value = value;
};
</script>

<template>
	<div class="flex flex-col h-screen overflow-hidden">
		<!-- Navigation Bar -->
		<NavigationBar :isKeyboardMode="isKeyboardMode" @toggle-keyboard-mode="handleKeyboardModeToggle" />
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
