<script setup lang="ts">
import { onMounted } from "vue";
import { useSetupPage } from "../composables/pages/useSetupPage";
import InputField from "../lib/InputField.vue";
import Button from "../lib/Button.vue";
import Card from "../lib/Card.vue";
import Icon from "../lib/Icon.vue";

// Initialize the composable with backend URL
const backendBaseUrl = import.meta.env.VITE_API_BASE_URL;
const {
	// State
	githubRepoUrl,
	branchName,
	projectName,
	isLoading,
	errorMessage,
	generatedReviewLink,
	allExistingProjects,
	// Methods
	createCodeReviewUrlPath,
	handleCreateConfiguration,
	navigateToReviewSession,
	loadExistingProjects,
} = useSetupPage(backendBaseUrl);

// Lifecycle
onMounted(() => {
	loadExistingProjects();
});
</script>

<template>
	<div class="page">
		<!-- Header -->
		<div class="bg-white/5 backdrop-blur-sm border-b border-white/10">
			<div class="mx-auto px-6 py-8">
				<div class="text-center">
					<h1 class="text-4xl font-bold text-white mb-2">Code Comments Dashboard</h1>
					<p class="text-slate-300 text-lg">Manage your code review sessions</p>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="mx-auto px-6 mt-8">
			<div class="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
				<!-- Existing Projects List -->
				<div class="flex-0.5">
					<Card
						title="Existing Projects"
						subtitle="Continue working on your previous code reviews"
						iconName="archive"
						iconGradient="blue"
					>
						<!-- Empty State -->
						<div v-if="allExistingProjects.length === 0" class="empty-state">
							<div class="empty-state-icon">
								<svg
									class="w-8 h-8 text-slate-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<p class="text-slate-400">No existing projects found</p>
							<p class="text-slate-500 text-sm mt-2">Create your first review session to get started</p>
						</div>
						<!-- Existing Projects List -->
						<div class="space-y-4">
							<div v-for="project in allExistingProjects" :key="project.id" class="card-item">
								<a
									:href="
										createCodeReviewUrlPath(
											project.writeApiUrl,
											project.repository.repositoryUrl,
											project.repository.branch
										)
									"
									class="block"
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-3">
											<div class="card-icon-sm gradient-icon-green">
												<Icon srcName="code" />
											</div>
											<h3
												class="text-white font-semibold group-hover:text-blue-300 transition-colors"
											>
												{{
													project.name.length !== 0
														? project.name
														: project.repository.repositoryUrl
												}}
											</h3>
										</div>
										<div class="card-icon-sm">
											<Icon srcName="externalLink" />
										</div>
									</div>
								</a>
							</div>
						</div>
					</Card>
				</div>

				<!-- Setup Form -->
				<div class="flex-1">
					<Card
						title="New Review Session"
						subtitle="Start a new code review by entering a GitHub repository URL"
						iconName="plus"
						iconGradient="emerald"
					>
						<!-- Messages -->
						<div v-if="errorMessage || generatedReviewLink" class="space-y-6 mb-6">
							<!-- Error Message -->
							<div v-if="errorMessage" class="status-message error">
								<div class="flex items-center gap-3">
									<div class="card-icon-sm">
										<Icon srcName="error" />
									</div>
									<p class="text-red-400">{{ errorMessage }}</p>
								</div>
							</div>
							<!-- Success Message -->
							<div v-if="generatedReviewLink" class="status-message success flex flex-col gap-4">
								<div class="flex items-center gap-3">
									<div class="card-icon-sm">
										<Icon srcName="success" />
									</div>
									<p class="text-emerald-400 font-semibold">Review session created successfully!</p>
								</div>
								<Button
									class="w-full"
									type="button"
									label="Open Review Session"
									buttonStyle="secondary"
									:onClick="navigateToReviewSession"
								/>
							</div>
						</div>

						<!-- Setup Form -->
						<form @submit.prevent="handleCreateConfiguration" class="space-y-6">
							<!-- GitHub Repository URL -->
							<InputField
								label="GitHub Repository URL"
								v-model="githubRepoUrl"
								type="url"
								placeholder="https://github.com/owner/repository"
								:required="true"
							/>

							<span class="flex flex-row mb-4 space-x-6">
								<!-- Branch Name -->
								<InputField
									label="Branch"
									v-model="branchName"
									type="text"
									placeholder="main"
									:required="true"
									class="flex-1"
								/>

								<!-- Project Name -->
								<InputField
									label="Project Name"
									v-model="projectName"
									type="text"
									placeholder="My Project"
									:required="true"
									class="flex-1"
								/>
							</span>

							<!-- Submit Button -->
							<Button
								class="w-full"
								label="Create Review Session"
								type="submit"
								buttonStyle="primary"
								:disabled="isLoading"
							/>
						</form>
					</Card>
				</div>
			</div>
		</div>
	</div>
</template>
