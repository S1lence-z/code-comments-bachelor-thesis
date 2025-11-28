<script setup lang="ts">
// Redirect from root to setup page
definePageMeta({
	middleware: defineNuxtRouteMiddleware(() => {
		return navigateTo("/review")
	})
})
</script>

<template>
	<div></div>
</template>
