<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import HomePage from './pages/HomePage.vue';
import ReviewPage from './pages/ReviewPage.vue';
import NavigationBar from './components/NavigationBar.vue';

const pageToShow = ref<'HomePage' | 'ReviewPage' | 'Loading'>('Loading');
const reviewPageProps = ref<{
	repoUrl: string;
	commentsApiUrl: string;
	initialBranch: string;
} | null>(null);
const routingErrorMessage = ref<string>('');
const isKeyboardMode = ref(false);
provide('isKeyboardMode', isKeyboardMode);

onMounted(() => {
const params = new URLSearchParams(window.location.search);
const repoUrlParam = params.get('repoUrl');
const commentsApiUrlParam = params.get('commentsApiUrl');

if (repoUrlParam && commentsApiUrlParam) {
	let isValid = true;
	let tempErrorMessage = '';

	if (!repoUrlParam.startsWith('https://github.com/')) {
	tempErrorMessage = 'Invalid GitHub repo URL in query parameters. Must start with https://github.com/. ';
	isValid = false;
	}
	try {
	// Basic validation for commentsApiUrlParam - ensuring it's a valid URL structure.
	// More specific validation (e.g. checking if it's reachable) would be out of scope here.
	new URL(commentsApiUrlParam);
	} catch (e) {
		tempErrorMessage += 'Invalid commentsApiUrl in query parameters (must be a valid URL).';
		isValid = false;
	}

	if (isValid) {
		reviewPageProps.value = {
			repoUrl: repoUrlParam,
			commentsApiUrl: commentsApiUrlParam,
			// TODO: this is the problem as i do not know if it is master or main
			initialBranch: params.get('branch') || 'main',
		};
		pageToShow.value = 'ReviewPage';
	} else {
		routingErrorMessage.value = tempErrorMessage + ' Displaying Home Page instead.';
		pageToShow.value = 'HomePage';
	}
} else if (repoUrlParam || commentsApiUrlParam) {
	// Case where one is present but not the other
	routingErrorMessage.value = 'Both repoUrl and commentsApiUrl query parameters are required to directly access a review session. One is missing. Displaying Home Page.';
	pageToShow.value = 'HomePage';
} else {
	// Neither parameter is present, normal scenario for showing the HomePage
	pageToShow.value = 'HomePage';
}});

const handleKeyboardModeToggle = (value: boolean) => {
	isKeyboardMode.value = value;
};
</script>

<template>
	<div id="app-root">
		<NavigationBar
			:isKeyboardMode="isKeyboardMode"
			@toggle-keyboard-mode="handleKeyboardModeToggle"
		/>
		<div v-if="routingErrorMessage" class="routing-error-message">
			{{ routingErrorMessage }}
		</div>
		<HomePage v-if="pageToShow === 'HomePage'" />
		<ReviewPage
			v-else-if="pageToShow === 'ReviewPage' && reviewPageProps"
			:repoUrl="reviewPageProps.repoUrl"
			:writeApiUrl="reviewPageProps.commentsApiUrl"
			:initialBranch="reviewPageProps.initialBranch"
		/>
		<div v-else-if="pageToShow === 'Loading'" class="loading-app-message">
			Loading application...
		</div>
	</div>
</template>

<style scoped>
#app-root {
	height: 100vh;
	width: 100vw;
	display: flex;
	flex-direction: column; /* Allows error message to stack on top of page content */
	background-color: #1e1e1e; /* Consistent background */
	color: #d4d4d4; /* Default text color */
	font-family: Arial, sans-serif;
	overflow: hidden; /* Prevents scrollbars from appearing */
}

.routing-error-message {
	background-color: #5c2222; /* Darker red for error background */
	border-bottom: 1px solid #8c3333; /* Slightly lighter border */
	color: #ffcccc; /* Light red text for contrast */
	padding: 12px 20px;
	text-align: center;
	font-size: 0.9rem;
	box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.loading-app-message {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	font-size: 1.2rem;
	color: #a0aec0; /* Lighter text for loading message */
}

/* Ensure global styles don't interfere too much, or define them here if needed */
:global(body) {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

:global(*, *::before, *::after) {
	box-sizing: inherit;
}
</style>
