<script setup lang="ts">
import { watch } from "vue";
import { useSetupPage } from "../composables/pages/useSetupPage";
import { useRoute } from "vue-router";
import ServerForm from "../components/setup/ServerForm.vue";
import ProjectList from "../components/setup/ProjectList.vue";
import ProjectForm from "../components/setup/ProjectForm.vue";

const route = useRoute();

const {
	// Form inputs
	formGithubRepositoryUrl,
	formBranchName,
	formProjectName,
	formServerBaseUrl,

	// Computed
	isOfflineMode,

	// UI state
	isCreatingProject,
	isProjectCreated,
	isServerUrlConfigured,
	errorMessage,

	// Data
	existingProjects,

	// Actions
	handleNewProjectCreation,
	navigateToNewProject,
	navigateToExistingProject,
	loadExistingProjects,
	submitServerBaseUrl,
	useDefaultServerUrl,
	handleOfflineMode,
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
			<div class="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
				<ServerForm
					v-if="!isServerUrlConfigured"
					v-model:serverBaseUrl="formServerBaseUrl"
					@submitServerBaseUrl="submitServerBaseUrl"
					@useDefaultServerUrl="useDefaultServerUrl"
					@runInOfflineMode="handleOfflineMode"
				/>
				<!-- Existing Projects List -->
				<div v-if="isServerUrlConfigured && !isOfflineMode" class="flex-0.5">
					<ProjectList
						:existingProjects="existingProjects"
						@navigateToExistingProject="navigateToExistingProject"
					/>
				</div>
				<!-- Setup Form -->
				<div v-if="isServerUrlConfigured" class="flex-1">
					<ProjectForm
						:errorMessage="errorMessage"
						:isCreatingProject="isCreatingProject"
						:isProjectCreated="isProjectCreated"
						v-model:formGithubRepositoryUrl="formGithubRepositoryUrl"
						v-model:formBranchName="formBranchName"
						v-model:formProjectName="formProjectName"
						@createProject="handleNewProjectCreation"
						@navigateToNewProject="navigateToNewProject"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
