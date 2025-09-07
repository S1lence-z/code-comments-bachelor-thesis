<script setup lang="ts">
import Card from "../../lib/Card.vue";
import InputField from "../../lib/InputField.vue";
import Button from "../../lib/Button.vue";

interface ServerFormProps {
	serverBaseUrl: string;
}
defineProps<ServerFormProps>();

const emit = defineEmits<{
	(event: "update:serverBaseUrl", value: string): void;
	(event: "useDefaultServerUrl"): void;
	(event: "submitServerBaseUrl"): void;
	(event: "runInOfflineMode"): void;
}>();
</script>

<template>
	<Card
		class="flex-1"
		title="Comments Server URL"
		subtitle="Configure the URL for your comments server"
		iconName="plus"
		iconGradient="emerald"
	>
		<!-- Server URL Input Form -->
		<div class="flex flex-col space-y-3 mb-4">
			<p class="text-slate-400 text-lg">
				Don't have your own server setup? Follow this
				<a
					href="https://github.com/S1lence-z/code-comments-bachelor-thesis"
					class="text-blue-500 underline"
					target="_blank"
					rel="noopener noreferrer"
					>setup guide</a
				>
				to run the server locally with Docker and then
				<span class="text-blue-500 underline cursor-pointer" @click="() => emit('useDefaultServerUrl')"
					>use its URL</span
				>.
			</p>
			<div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-300/30 rounded-lg p-4">
				<p class="text-purple-300 text-lg font-medium">
					✨ You can also run the application in offline mode! Added comments will be shown in real-time until
					you refresh the page. Perfect for quick prototyping and testing.
				</p>
			</div>
		</div>
		<form @submit.prevent="() => emit('submitServerBaseUrl')" class="flex flex-col space-y-4">
			<InputField
				label="🌐 Server URL"
				v-bind:modelValue="serverBaseUrl"
				@update:modelValue="(value: string) => emit('update:serverBaseUrl', value)"
				type="url"
				placeholder="http://localhost:3000"
				:required="true"
			/>
			<div class="flex flex-col space-y-2">
				<Button
					label="Save and Continue"
					type="submit"
					buttonStyle="primary"
					:disabled="!serverBaseUrl || serverBaseUrl.trim() === ''"
				/>
				<Button
					label="Run in Offline Mode"
					type="button"
					buttonStyle="secondary"
					:onClick="() => emit('runInOfflineMode')"
				/>
			</div>
		</form>
	</Card>
</template>
