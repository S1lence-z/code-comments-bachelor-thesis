<script setup lang="ts">
import { ref } from "vue";
import { createConfiguration } from "../api/commentsApi.ts";
import type ISetupProjectRequest from "../../../shared/api/ISetupProjectRequest.ts";

const githubRepoUrl = ref("");
const branchName = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const generatedReviewLink = ref("");

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
</script>

<template>
	<div class="flex items-center justify-center min-h-screen p-4 bg-gray-900 page">
		<div class="w-full max-w-xl p-8 text-gray-200 bg-gray-800 rounded-lg shadow-2xl">
			<h2 class="mt-0 mb-4 text-2xl font-semibold text-center text-gray-400">Setup New Code Review</h2>
			<p class="mb-6 text-base text-center text-gray-300">
				Enter a public GitHub repository URL to start a new review session.
			</p>
			<form @submit.prevent="handleCreateConfiguration">
				<!-- GitHub Repository URL -->
				<div class="mb-6">
					<label for="repoUrl" class="block mb-2 font-bold text-gray-400">GitHub Repository URL:</label>
					<input
						type="url"
						id="repoUrl"
						v-model="githubRepoUrl"
						placeholder="https://github.com/owner/repository"
						required
						class="box-border w-full p-3 text-base text-gray-200 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-400"
					/>
				</div>
				<!-- Branch Name -->
				<div class="mb-6">
					<label for="branchName" class="block mb-2 font-bold text-gray-400">Branch Name:</label>
					<input
						type="text"
						id="branchName"
						v-model="branchName"
						placeholder="master"
						required
						class="box-border w-full p-3 text-base text-gray-200 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-400"
					/>
				</div>
				<button
					class="w-full px-6 py-3 font-bold text-white transition-colors duration-200 bg-blue-600 rounded hover:bg-blue-700"
					type="submit"
					:disabled="isLoading"
				>
					{{ isLoading ? "Generating Link..." : "Generate Review Link" }}
				</button>
			</form>
			<div v-if="errorMessage" class="p-3 mt-6 text-center text-red-500 bg-red-100 border border-red-500 rounded">
				{{ errorMessage }}
			</div>
			<div v-if="generatedReviewLink" class="p-4 mt-8 text-center bg-gray-900 border border-gray-700 rounded">
				<p class="mb-2 text-gray-400">Review session created! Use this link:</p>
				<a
					:href="generatedReviewLink"
					target="_blank"
					class="font-bold text-blue-400 break-all hover:underline"
					>{{ generatedReviewLink }}</a
				>
			</div>
		</div>
	</div>
</template>
