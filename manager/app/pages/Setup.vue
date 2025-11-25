<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Icon } from "@iconify/vue";

const { t } = useI18n();
const route = useRoute();

const {
	// Form inputs
	formRepositoryUrl,
	formRepositoryType,
	formBranchName,
	formProjectName,
	formServerBaseUrl,

	// Ref
	isOfflineMode,

	// UI state
	isCreatingProject,
	isProjectCreated,
	isServerUrlConfigured,
	projectCreationErrorMessage,
	projectsLoadedSuccessfully,
	isLoadingProjects,

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
	cycleThroughRepositoryTypes
} = useSetupPage();

// Cycle through repository types
const getNextRepositoryType = () => {
	const nextType = cycleThroughRepositoryTypes(formRepositoryType.value);
	formRepositoryType.value = nextType;
};

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
	[() => route.query.serverBaseUrl],
	([newServerBaseUrl]) => {
		const serverBaseUrlFromQuery = newServerBaseUrl as string | undefined;
		if (serverBaseUrlFromQuery && !isServerUrlConfigured.value) {
			submitServerBaseUrl(serverBaseUrlFromQuery);
		}
	},
	{ immediate: true }
);

// If the repository type is singleFile, provide the branch name as "main" by default
watch(
	() => formRepositoryType.value,
	(newType) => {
		if (newType === RepositoryType.singleFile) {
			formBranchName.value = "main";
		} else {
			formBranchName.value = "";
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
					<h1 class="text-4xl font-bold text-white mb-2">{{ t("setupPage.title") }}</h1>
					<p class="text-slate-300 text-lg">{{ t("setupPage.subtitle") }}</p>
				</div>
			</div>
		</div>
		<!-- Main Content -->
		<div class="mx-auto px-6 mt-8 max-w-7xl lg:flex-row space-y-6 pb-12">
			<!-- Error Message -->
			<div v-if="!projectsLoadedSuccessfully" class="flex status-message error gap">
				<div class="flex items-center gap-3">
					<div class="card-icon-sm">
						<Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-400" />
					</div>
					<p class="text-red-400">
						{{ t("setupPage.errorLoadingExistingProjects") }}
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
						:isLoadingProjects="isLoadingProjects"
						@navigateToExistingProject="navigateToExistingProject"
					/>
				</div>
				<!-- Setup Form -->
				<div v-if="isServerUrlConfigured" class="flex-1">
					<ProjectForm
						:errorMessage="projectCreationErrorMessage"
						:isCreatingProject="isCreatingProject"
						:isProjectCreated="isProjectCreated"
						v-model:formRepositoryUrl="formRepositoryUrl"
						v-model:formRepositoryType="formRepositoryType"
						v-model:formBranchName="formBranchName"
						v-model:formProjectName="formProjectName"
						@createProject="handleNewProjectCreation"
						@navigateToNewProject="navigateToNewProject"
						@cycleThroughRepositoryTypes="getNextRepositoryType"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
