<script setup lang="ts">
import { watch } from "vue";
import { useSetupPage } from "../composables/pages/useSetupPage";
import InputField from "../lib/InputField.vue";
import Button from "../lib/Button.vue";
import Card from "../lib/Card.vue";
import Icon from "../lib/Icon.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const {
	// Form inputs
	formGithubRepoUrl,
	formBranchName,
	formProjectName,
	formServerBaseUrl,

	// UI state
	isCreatingProject,
	isProjectCreated,
	isServerUrlConfigured,
	errorMessage,

	// Data
	existingProjects,

	// Actions
	createProject,
	navigateToNewProject,
	navigateToExistingProject,
	loadExistingProjects,
	submitServerBaseUrl,
	useDefaultServerUrl,
} = useSetupPage();

// Watch the isServerBaseUrlSubmitted and reload existing projects when it changes
watch(
	() => isServerUrlConfigured.value,
	(newValue) => {
		if (newValue) {
			loadExistingProjects();
		}
	},
	{ immediate: true }
);

// Initialize formServerBaseUrl from the router query if available
watch(
	() => route.query.backendBaseUrl,
	(newValue) => {
		if (newValue) {
			isServerUrlConfigured.value = true;
		}
	},
	{ immediate: true }
);
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
			<!-- Server URL Setup Card -->
			<div v-if="!isServerUrlConfigured" class="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
				<Card
					class="flex-1"
					title="Comments Server URL"
					subtitle="Please enter your comments server URL"
					iconName="plus"
					iconGradient="emerald"
				>
					<div class="flex flex-row space-x-6 items-center">
						<p class="mb-4 text-slate-400 text-lg">
							Enter the URL of your backend server. If you haven't set up a backend server yet, you can
							use the default URL:
						</p>
						<Button
							class="mb-4"
							label="Use Default URL"
							type="button"
							buttonStyle="secondary"
							:onClick="useDefaultServerUrl"
						/>
					</div>
					<form @submit.prevent="submitServerBaseUrl" class="flex flex-col space-y-4">
						<InputField
							label="Comments Server URL"
							v-model="formServerBaseUrl"
							type="url"
							placeholder="http://localhost:3000"
							:required="true"
						/>
						<Button
							label="Save and Continue"
							type="submit"
							buttonStyle="primary"
							:disabled="!formServerBaseUrl || formServerBaseUrl.trim() === ''"
						/>
					</form>
				</Card>
			</div>

			<!-- Main Setup Cards -->
			<div v-else class="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
				<!-- Existing Projects List -->
				<div class="flex-0.5">
					<Card
						title="Existing Projects"
						subtitle="Continue working on your previous code reviews"
						iconName="archive"
						iconGradient="blue"
					>
						<!-- Empty State -->
						<div v-if="existingProjects.length === 0" class="empty-state">
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
							<div
								v-for="project in existingProjects"
								:key="project.id"
								class="card-item cursor-pointer"
								@click="navigateToExistingProject(project)"
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
						<div v-if="errorMessage || isProjectCreated" class="space-y-6 mb-6">
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
							<div v-if="isProjectCreated" class="status-message success flex flex-col gap-4">
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
									:onClick="navigateToNewProject"
								/>
							</div>
						</div>

						<!-- Setup Form -->
						<form @submit.prevent="createProject">
							<!-- GitHub Repository URL -->
							<InputField
								label="GitHub Repository URL"
								v-model="formGithubRepoUrl"
								type="url"
								placeholder="https://github.com/owner/repository"
								:required="true"
							/>
							<span class="flex flex-row mb-4 space-x-6">
								<!-- Branch Name -->
								<InputField
									label="Branch"
									v-model="formBranchName"
									type="text"
									placeholder="main"
									:required="true"
									class="flex-1"
								/>
								<!-- Project Name -->
								<InputField
									label="Project Name"
									v-model="formProjectName"
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
								:disabled="isCreatingProject"
							/>
						</form>
					</Card>
				</div>
			</div>
		</div>
	</div>
</template>
