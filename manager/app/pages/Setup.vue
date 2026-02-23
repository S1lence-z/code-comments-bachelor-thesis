<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Icon } from "@iconify/vue";
import { useAuthStore } from "../../../base/app/stores/authStore";
import { RepositoryType } from "../../../base/app/types/repository-type";

const { t } = useI18n();
const route = useRoute();
const authStore = useAuthStore();
const offlineModeStore = useOfflineModeStore();

const {
	// Form inputs
	formRepositoryUrl,
	formRepositoryType,
	formBranchName,
	formProjectName,
	formServerBaseUrl,
	formServerPassword,

	// UI state
	isAuthorizing,
	isCreatingProject,
	isProjectCreated,
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
	setServerConfiguration,
	useDefaultServerUrl,
	cycleThroughRepositoryTypes,
	resetProjectForm,
	disconnectServer,
} = useSetupPage();

// Cycle through repository types
const setNextRepositoryType = () => {
	const nextType = cycleThroughRepositoryTypes(formRepositoryType.value);
	formRepositoryType.value = nextType;
};

// Watch the isServerBaseUrlSubmitted and reload existing projects when it changes
watch(
	() => offlineModeStore.isServerUrlConfigured,
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

		if (!serverBaseUrlFromQuery) return;

		// Restore the URL from query params
		formServerBaseUrl.value = serverBaseUrlFromQuery;

		if (!offlineModeStore.isServerUrlConfigured) {
			// Run full configuration flow
			const token = authStore.getAuthToken(serverBaseUrlFromQuery);
			if (token) {
				setServerConfiguration(serverBaseUrlFromQuery, token);
			} else {
				setServerConfiguration(serverBaseUrlFromQuery);
			}
		} else {
			loadExistingProjects();
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
	<div>
		<!-- Main Content -->
		<div class="mx-auto max-w-7xl px-6 mt-8 lg:flex-row space-y-6 pb-12">
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
			<!-- Server Status Bar -->
			<div
				v-if="offlineModeStore.isServerUrlConfigured && !offlineModeStore.isOfflineMode"
				class="flex flex-col gap-4 md:gap-0 md:flex-row items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3"
			>
				<div class="flex flex-col sm:flex-row items-center gap-2 text-slate-300">
					<Icon icon="mdi:server" class="w-5 h-5 text-emerald-400" />
					<span>{{ t("setupPage.connectedTo") }}</span>
					<span class="font-semibold text-white">{{ formServerBaseUrl }}</span>
				</div>
				<Button
					:label="t('setupPage.changeServer')"
					buttonStyle="secondary"
					buttonSize="small"
					type="button"
					@click="disconnectServer"
				/>
			</div>
			<!-- Setup Card -->
			<div class="flex flex-col gap-6 lg:flex-row">
				<!-- Server Form -->
				<ServerForm
					v-if="!offlineModeStore.isServerUrlConfigured"
					v-model:serverBaseUrl="formServerBaseUrl"
					v-model:serverPassword="formServerPassword"
					:isAuthorizing="isAuthorizing"
					@submitServerBaseUrl="setServerConfiguration"
					@useDefaultServerUrl="useDefaultServerUrl"
					@runInOfflineMode="offlineModeStore.startOfflineMode"
				/>
				<!-- Existing Projects List -->
				<div
					v-if="offlineModeStore.isServerUrlConfigured && !offlineModeStore.isOfflineMode"
					class="flex-0.5"
				>
					<ProjectList
						:existingProjects="existingProjects"
						:isLoadingProjects="isLoadingProjects"
						@navigateToExistingProject="navigateToExistingProject"
					/>
				</div>
				<!-- Setup Form -->
				<div v-if="offlineModeStore.isServerUrlConfigured" class="flex-1">
					<ProjectForm
						:isOfflineMode="offlineModeStore.isOfflineMode"
						:errorMessage="projectCreationErrorMessage"
						:isCreatingProject="isCreatingProject"
						:isProjectCreated="isProjectCreated"
						v-model:formRepositoryUrl="formRepositoryUrl"
						v-model:formRepositoryType="formRepositoryType"
						v-model:formBranchName="formBranchName"
						v-model:formProjectName="formProjectName"
						@createProject="handleNewProjectCreation"
						@navigateToNewProject="navigateToNewProject"
						@cycleThroughRepositoryTypes="setNextRepositoryType"
						@cancelOfflineModeSetup="offlineModeStore.cancelOfflineMode"
						@setupNewSession="resetProjectForm"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
