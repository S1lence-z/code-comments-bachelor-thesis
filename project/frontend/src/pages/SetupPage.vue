<script setup lang="ts">
import { onMounted, ref } from "vue";
import { setupProject, listProjects } from "../services/projectService.ts";
import type IProjectSetupRequest from "../types/interfaces/ISetupProjectRequest.ts";
import InputField from "../lib/InputField.vue";
import Button from "../lib/Button.vue";
import Card from "../lib/Card.vue";
import Icon from "../lib/Icon.vue";
import type IProjectDto from "../types/interfaces/IProjectDto.ts";

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL;
const githubRepoUrl = ref("");
const branchName = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const generatedReviewLink = ref("");
const allExistingProjects = ref<IProjectDto[]>([]);

const createEditProjectUrl = (writeApiUrl: string, repoLandingPageUrl: string, branchName: string) => {
	const frontendBaseUrl = globalThis.location.origin;
	return `${frontendBaseUrl}/review/code/?repoUrl=${encodeURIComponent(
		repoLandingPageUrl || ""
	)}&commentsApiUrl=${encodeURIComponent(writeApiUrl || "")}&branch=${encodeURIComponent(branchName || "")}`;
};

const handleCreateConfiguration = async () => {
	isLoading.value = true;
	errorMessage.value = "";
	generatedReviewLink.value = "";
	try {
		const setupData: IProjectSetupRequest = {
			repositoryUrl: githubRepoUrl.value.trim(),
			branch: branchName.value.trim(),
		};

		const response = await setupProject(setupData, backendBaseUrl);

		if (response.writeApiUrl && response.repository) {
			generatedReviewLink.value = createEditProjectUrl(
				response.writeApiUrl,
				response.repository.repositoryUrl,
				response.repository.branch
			);
		} else {
			throw new Error("Invalid response from server for configuration setup.");
		}
	} catch (error: any) {
		errorMessage.value = `Failed to create review session: ${error.message || "Unknown error"}`;
	} finally {
		isLoading.value = false;
	}
};

const navigateToReviewSession = () => {
	if (generatedReviewLink.value) {
		window.open(generatedReviewLink.value, "_blank");
	}
};

onMounted(async () => {
	allExistingProjects.value = await listProjects(backendBaseUrl);
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
		<div class="mx-auto px-6 mt-12">
			<div class="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
				<!-- Existing Projects List -->
				<div class="flex-1 space-y-6">
					<Card
						title="Existing Projects"
						subtitle="Continue working on your previous code reviews"
						iconName="archive"
						iconGradient="blue"
						>ˇ
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
										createEditProjectUrl(
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
				<div class="flex-1 space-y-6">
					<Card
						title="New Review Session"
						subtitle="Start a new code review by entering a GitHub repository URL"
						iconName="plus"
						iconGradient="emerald"
					>
						<form @submit.prevent="handleCreateConfiguration" class="space-y-6">
							<!-- GitHub Repository URL -->
							<InputField
								label="GitHub Repository URL"
								v-model="githubRepoUrl"
								type="url"
								placeholder="https://github.com/owner/repository"
								:required="true"
							/>

							<!-- Branch Name -->
							<InputField
								label="Branch Name"
								v-model="branchName"
								type="text"
								placeholder="main"
								:required="true"
							/>

							<!-- Submit Button -->
							<Button
								class="w-full"
								label="Create Review Session"
								type="submit"
								buttonStyle="primary"
								:disabled="isLoading"
							/>
						</form>

						<!-- Messages -->
						<div class="mt-8 space-y-4">
							<div v-if="errorMessage" class="status-message error">
								<div class="flex items-center gap-3">
									<div class="card-icon-sm">
										<Icon srcName="error" />
									</div>
									<p class="text-red-400">{{ errorMessage }}</p>
								</div>
							</div>

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
					</Card>
				</div>
			</div>
		</div>
	</div>
</template>
