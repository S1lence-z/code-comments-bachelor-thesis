<script setup lang="ts">
import { watch } from "vue";
import { useSetupPage } from "../composables/pages/useSetupPage";
import ServerForm from "../components/setup/ServerForm.vue";
import ProjectList from "../components/setup/ProjectList.vue";
import ProjectForm from "../components/setup/ProjectForm.vue";
import { useQueryParams } from "../composables/core/useQueryParams";

const { params } = useQueryParams();

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
	projectCreationErrorMessage,
	projectsLoadedSuccessfully,

	// Data
	existingProjects,

	// Actions
	handleNewProjectCreation,
	navigateToNewProject,
	navigateToExistingProject,
	loadExistingProjects,
	submitServerBaseUrl,
	useDefaultServerUrl,
	setOfflineMode,
	handleOfflineModeSwitch,
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
	[() => params.value.serverBaseUrl, () => isOfflineMode.value],
	([newServerBaseUrl, newOfflineMode]) => {
		handleOfflineModeSwitch(newServerBaseUrl, newOfflineMode);
	},
	{ immediate: true, deep: true }
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
		<div class="mx-auto px-6 mt-8 max-w-7xl lg:flex-row space-y-6">
			<!-- Error Message -->
			<div v-if="!projectsLoadedSuccessfully" class="flex status-message error gap">
				<div class="flex items-center gap-3">
					<div class="card-icon-sm">
						<Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-400" />
					</div>
					<p class="text-red-400">
						There was an error loading existing projects from the selected server. Please, check the server
						URL or switch to offline mode in settings.
					</p>
				</div>
			</div>
			<!-- Setup Card -->
			<div class="flex flex-col gap-6 lg:flex-row">
				<!-- Server Form -->
				<ServerForm
					v-if="!isServerUrlConfigured"
					v-model:serverBaseUrl="formServerBaseUrl"
					@submitServerBaseUrl="submitServerBaseUrl"
					@useDefaultServerUrl="useDefaultServerUrl"
					@runInOfflineMode="setOfflineMode"
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
						:errorMessage="projectCreationErrorMessage"
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
