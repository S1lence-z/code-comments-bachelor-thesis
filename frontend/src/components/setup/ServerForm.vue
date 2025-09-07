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
}>();
</script>

<template>
	<Card
		class="flex-1"
		title="Comments Server URL"
		subtitle="Please enter your comments server URL"
		iconName="plus"
		iconGradient="emerald"
	>
		<div class="flex flex-row space-x-6 items-center">
			<p class="mb-4 text-slate-400 text-lg">
				Enter the URL of your backend server. If you haven't set up a backend server yet, you can use the
				default URL:
			</p>
			<Button
				class="mb-4"
				label="Use Default URL"
				type="button"
				buttonStyle="secondary"
				:onClick="() => emit('useDefaultServerUrl')"
			/>
		</div>
		<form @submit.prevent="() => emit('submitServerBaseUrl')" class="flex flex-col space-y-4">
			<InputField
				label="Comments Server URL"
				v-bind:modelValue="serverBaseUrl"
				@update:modelValue="(value: string) => emit('update:serverBaseUrl', value)"
				type="url"
				placeholder="http://localhost:3000"
				:required="true"
			/>
			<Button
				label="Save and Continue"
				type="submit"
				buttonStyle="primary"
				:disabled="!serverBaseUrl || serverBaseUrl.trim() === ''"
			/>
		</form>
	</Card>
</template>
