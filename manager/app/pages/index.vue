<script setup lang="ts">
// Redirect from root to setup page
definePageMeta({
	middleware: defineNuxtRouteMiddleware(() => {
		return navigateTo('/about')
	})
})
</script>

<template></template>
