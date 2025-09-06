<template>
	<div class="flex flex-col items-center justify-center page">
		<div class="text-center">
			<h1 class="mb-4 text-6xl font-bold text-white">404</h1>
			<h2 class="mb-4 text-2xl font-semibold text-white">Page Not Found</h2>
			<p class="max-w-md mb-8 text-white/60">The page you're looking for doesn't exist or has been moved.</p>
			<div class="space-x-4">
				<button @click="$router.back()" class="btn btn-secondary">Go Back</button>
				<router-link to="/setup" class="btn btn-primary"> Go to Setup </router-link>
			</div>
		</div>
	</div>
</template>
