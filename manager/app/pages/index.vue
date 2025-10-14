<script setup lang="ts">
// Redirect from root to setup page
definePageMeta({
	middleware: defineNuxtRouteMiddleware(() => {
		return navigateTo('/setup')
	})
})
</script>

<template>
	<div></div>
</template>
