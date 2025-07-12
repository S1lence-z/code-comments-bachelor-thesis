<script setup lang="ts">
import { ref } from "vue";
import { createConfiguration } from "../api/commentsApi.ts";
import type ISetupProjectRequest from "../../../shared/api/ISetupProjectRequest.ts";
import InputField from "../lib/InputField.vue";
import Button from "../lib/Button.vue";

const githubRepoUrl = ref("");
const branchName = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const generatedReviewLink = ref("");
const allFetchedProjects = ref([
	{
		id: 1,
		name: "Sample Project",
		reviewLink: "https://example.com/review/1",
	},
	{
		id: 2,
		name: "Another Project",
		reviewLink: "https://example.com/review/2",
	},
]);

const createEditRepoUrl = (writeApiUrl: string, repoLandingPageUrl: string, branchName: string) => {
	const frontendBaseUrl = globalThis.location.origin;
	return `${frontendBaseUrl}/code-review/?repoUrl=${encodeURIComponent(
		repoLandingPageUrl || ""
	)}&commentsApiUrl=${encodeURIComponent(writeApiUrl || "")}&branch=${encodeURIComponent(branchName || "")}`;
};

const handleCreateConfiguration = async () => {
	isLoading.value = true;
	errorMessage.value = "";
	generatedReviewLink.value = "";
	try {
		const setupData: ISetupProjectRequest = {
			repoUrl: githubRepoUrl.value.trim(),
			branch: branchName.value.trim(),
		};

		const response = await createConfiguration(setupData);

		if (response.writeApiUrl && response.repository) {
			generatedReviewLink.value = createEditRepoUrl(
				response.writeApiUrl,
				response.repository.repoLandingPageUrl,
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
</script>

<template>
	<div class="page flex flex-row">
		<!-- Existing Projects List -->
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full h-full p-6 bg-black m-auto">
				<h2 class="mb-4 text-2xl font-semibold text-center text-white">Existing Code Reviews</h2>
				<p class="mb-6 text-base text-center text-white">Select an existing code review session to continue.</p>
				<div v-if="allFetchedProjects.length === 0" class="text-center text-gray-500">
					No existing code reviews found.
				</div>
				<ul class="space-y-4">
					<li
						v-for="project in allFetchedProjects"
						:key="project.id"
						class="p-4 bg-gray-700 rounded hover:bg-gray-600 transition-colors cursor-pointer"
					>
						<a :href="project.reviewLink" class="text-blue-400 hover:underline">
							{{ project.name }}
						</a>
					</li>
				</ul>
			</div>
		</div>
		<!-- Setup Form -->
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full h-full p-6 bg-gray-800 my-auto">
				<h2 class="text-2xl font-semibold text-center text-white">Setup New Code Review</h2>
				<p class="mb-6 text-base text-center text-white">
					Enter a public GitHub repository URL to start a new review session.
				</p>
				<form @submit.prevent="handleCreateConfiguration">
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
						placeholder="master"
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
				<!-- Error/Success Message -->
				<div class="mt-6">
					<div
						v-if="errorMessage"
						class="p-3 mt-6 text-center text-red-500 bg-red-100 border border-red-500 rounded"
					>
						{{ errorMessage }}
					</div>
					<div
						v-if="generatedReviewLink"
						class="p-4 mt-8 text-center bg-gray-900 border border-gray-700 rounded"
					>
						<p class="text-white text-lg">Review session created! Use this link:</p>
						<Button
							class="w-full mt-4"
							type="button"
							label="Open Review Session"
							buttonStyle="secondary"
							:onClick="navigateToReviewSession"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
