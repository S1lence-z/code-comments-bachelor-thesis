<template>
	<div class="flex flex-col items-center justify-center page">
		<div class="text-center">
			<h1 class="mb-4 text-6xl font-bold text-gray-900">404</h1>
			<h2 class="mb-4 text-2xl font-semibold text-gray-700">Page Not Found</h2>
			<p class="max-w-md mb-8 text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
			<div class="space-x-4">
				<router-link to="/setup" class="btn-primary"> Go to Setup </router-link>
				<button @click="$router.back()" class="btn-secondary">Go Back</button>
			</div>
		</div>
	</div>
</template>
