<template>
	<div class="home-page-container">
		<div class="form-container">
			<h2>Setup New Code Review</h2>
			<p>Enter a public GitHub repository URL to start a new review session.</p>
			<form @submit.prevent="handleCreateConfiguration">
				<div class="form-group">
					<label for="repoUrl">GitHub Repository URL:</label>
					<input
						type="url"
						id="repoUrl"
						v-model="githubRepoUrl"
						placeholder="https://github.com/owner/repository"
						required
					/>
				</div>
				<button type="submit" :disabled="isLoading">
					{{ isLoading ? 'Generating Link...' : 'Generate Review Link' }}
				</button>
			</form>
			<div v-if="errorMessage" class="error-message-home">{{ errorMessage }}</div>
			<div v-if="generatedReviewLink" class="generated-link-container">
				<p>Review session created! Use this link:</p>
				<a :href="generatedReviewLink" target="_blank">{{ generatedReviewLink }}</a>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createConfiguration } from '../api/commentsApi.ts'; // Adjust the import path as necessary

const githubRepoUrl = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const generatedReviewLink = ref('');

const createEditRepoUrl = (writeApiUrl: string, repoLandingPageUrl: string) => {
  const frontendBaseUrl = globalThis.location.origin;
  return `${frontendBaseUrl}/review/?repoUrl=${encodeURIComponent(repoLandingPageUrl)}&commentsApiUrl=${encodeURIComponent(writeApiUrl || "")}`;
};

const handleCreateConfiguration = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  generatedReviewLink.value = '';
  try {
    const response = await createConfiguration({
      repoUrl: githubRepoUrl.value.trim(),
    });

    if (response.writeApiUrl && response.repository) {
      generatedReviewLink.value = createEditRepoUrl(
        response.writeApiUrl,
        response.repository.repoLandingPageUrl
      );
    } else {
      throw new Error('Invalid response from server for configuration setup.');
    }
  } catch (error: any) {
    errorMessage.value = `Failed to create review session: ${error.message || 'Unknown error'}`;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.home-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #1a202c;
  padding: 1rem; /* Add some padding for smaller screens */
}

.form-container {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
}

h2 {
  color: #a0aec0;
  margin-top: 0;
  margin-bottom: 1rem;
  text-align: center;
}

p {
  color: #cbd5e0;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #a0aec0;
  font-weight: bold;
}

input[type="url"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #4a5568;
  border-radius: 4px;
  background-color: #1a202c;
  color: #e2e8f0;
  font-size: 1rem;
  box-sizing: border-box;
}

input[type="url"]:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.3);
}

button[type="submit"] {
  width: 100%;
  padding: 0.85rem;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #2b6cb0;
}

button[type="submit"]:disabled {
  background-color: #4a5568;
  cursor: not-allowed;
}

.error-message-home {
  margin-top: 1.5rem;
  color: #f56565;
  background-color: rgba(245, 101, 101, 0.1);
  border: 1px solid #f56565;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
}

.generated-link-container {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #1a202c;
  border: 1px solid #4a5568;
  border-radius: 4px;
  text-align: center;
}

.generated-link-container p {
  margin-bottom: 0.5rem;
  color: #a0aec0;
}

.generated-link-container a {
  color: #63b3ed;
  text-decoration: none;
  font-weight: bold;
  word-break: break-all;
}

.generated-link-container a:hover {
  text-decoration: underline;
}
</style>
