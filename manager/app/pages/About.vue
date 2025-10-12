<script setup lang="ts">
useHead({
	title: 'About - Code Review Manager',
	meta: [
		{ name: 'description', content: 'About the Code Review Manager application' }
	]
});
</script>

<template>
	<div class="page">
		<!-- Header -->
		<div class="bg-white/5 backdrop-blur-sm border-b border-white/10">
			<div class="mx-auto px-6 py-8">
				<div class="text-center">
					<h1 class="text-4xl font-bold text-white mb-2">About</h1>
					<p class="text-slate-300 text-lg">Learn more about the Code Review Manager</p>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mx-auto px-6 mt-8 max-w-7xl pb-12"
		>
			<!-- What is this? -->
			<div class="card">
				<div class="card-header">
					<div class="card-icon gradient-icon-blue">
						<Icon name="mdi:information" class="w-6 h-6 text-white" />
					</div>
					<h2 class="card-title">What is Code Review Manager?</h2>
				</div>
				<div class="space-y-4 text-slate-300 text-lg">
					<p>
						Code Review Manager is a setup and project management tool for your code
						review workflow. It helps you configure your code review environment and
						manage your review projects efficiently.
					</p>
					<p>
						This application serves as the entry point to the code review system,
						allowing you to:
					</p>
					<ul class="list-disc list-inside space-y-2 ml-4">
						<li>Connect to your backend server</li>
						<li>Create new code review projects</li>
						<li>Access existing projects</li>
						<li>Work in offline mode when needed</li>
					</ul>
				</div>
			</div>

			<!-- Features -->
			<div class="card">
				<div class="card-header">
					<div class="card-icon gradient-icon-green">
						<Icon name="mdi:star" class="w-6 h-6 text-white" />
					</div>
					<h2 class="card-title">Features</h2>
				</div>
				<div class="space-y-4">
					<div class="flex items-start gap-4">
						<div class="card-icon-sm gradient-icon-blue">
							<Icon name="mdi:server" class="w-5 h-5 text-white" />
						</div>
						<div>
							<h3 class="text-white font-semibold text-lg">Server Configuration</h3>
							<p class="text-slate-300">
								Easily configure and connect to your backend server for synchronized
								code reviews.
							</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="card-icon-sm gradient-icon-emerald">
							<Icon name="mdi:github" class="w-5 h-5 text-white" />
						</div>
						<div>
							<h3 class="text-white font-semibold text-lg">GitHub Integration</h3>
							<p class="text-slate-300">
								Connect to your GitHub repositories and branches for seamless code
								review.
							</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="card-icon-sm gradient-icon-blue">
							<Icon name="mdi:cloud-off" class="w-5 h-5 text-white" />
						</div>
						<div>
							<h3 class="text-white font-semibold text-lg">Offline Mode</h3>
							<p class="text-slate-300">
								Work without a server connection when you need to review code
								locally.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Getting Started -->
			<div class="card">
				<div class="card-header">
					<div class="card-icon gradient-icon-blue">
						<Icon name="mdi:rocket-launch" class="w-6 h-6 text-white" />
					</div>
					<h2 class="card-title">Getting Started</h2>
				</div>
				<div class="space-y-4 text-slate-300 text-lg">
					<p>
						Ready to start reviewing code? Head over to the
						<NuxtLink
							to="/setup"
							class="text-blue-400 hover:text-blue-300 underline font-semibold"
						>
							Setup page
						</NuxtLink>
						to configure your first project.
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
