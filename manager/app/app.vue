<template>
	<div class="flex flex-col h-screen overflow-hidden">
		<!-- Navigation Bar -->
		<AppNavigationBar class="z-10" />

		<!-- Main Content -->
		<main class="flex-1 overflow-hidden">
			<NuxtPage />
		</main>

		<ToastContainer />
	</div>
</template>
