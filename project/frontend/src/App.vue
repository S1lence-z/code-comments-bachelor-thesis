<script setup lang="ts">
import { ref, provide } from "vue";
import NavigationBar from "./components/app/AppNavigationBar.vue";
import AppFooter from "./components/app/AppFooter.vue";
import Modal from "./lib/Modal.vue";

// State to manage syncedState
const isServerSynced = ref(true);
provide("isServerSynced", isServerSynced);
</script>

<template>
	<div class="flex flex-col h-screen overflow-hidden">
		<!-- Navigation Bar -->
		<NavigationBar :isServerSynced="isServerSynced" />
		<!-- Main Content -->
		<main class="flex-1 overflow-hidden">
			<router-view />
		</main>
		<!-- Footer -->
		<AppFooter />
	</div>

	<!-- Global Testing Modal -->
	<Modal v-if="false">
		<p>Welcome to the Code Review App! Please set up your project to start reviewing code.</p>
		<button class="btn btn-primary" @click="$router.push('/setup')">Get Started</button>
	</Modal>
</template>
