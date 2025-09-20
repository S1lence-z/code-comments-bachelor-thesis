<script lang="ts" setup>
import InputField from "../../lib/InputField.vue";
import Button from "../../lib/Button.vue";
import Card from "../../lib/Card.vue";
import Icon from "../../lib/Icon.vue";

interface ProjectFormProps {
	formGithubRepositoryUrl: string;
	formBranchName: string;
	formProjectName: string;
	isCreatingProject: boolean;
	isProjectCreated: boolean;
	errorMessage: string | null;
}
const props = defineProps<ProjectFormProps>();

const emit = defineEmits<{
	(event: "update:formGithubRepositoryUrl", value: string): void;
	(event: "update:formBranchName", value: string): void;
	(event: "update:formProjectName", value: string): void;
	(event: "createProject"): void;
	(event: "navigateToNewProject"): void;
}>();
</script>

<template>
	<Card
		title="New Review Session"
		subtitle="Start a new code review by entering a GitHub repository URL"
		iconName="plus"
		iconGradient="emerald"
	>
		<!-- Messages -->
		<div v-if="props.errorMessage || props.isProjectCreated" class="space-y-6 mb-6">
			<!-- Error Message -->
			<div v-if="props.errorMessage" class="status-message error">
				<div class="flex items-center gap-3">
					<div class="card-icon-sm">
						<Icon srcName="error" />
					</div>
					<p class="text-red-400">{{ props.errorMessage }}</p>
				</div>
			</div>
			<!-- Success Message -->
			<div v-if="props.isProjectCreated" class="status-message success flex flex-col gap-4">
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
					:onClick="() => emit('navigateToNewProject')"
				/>
			</div>
		</div>

		<!-- Setup Form -->
		<form @submit.prevent="() => emit('createProject')">
			<!-- GitHub Repository URL -->
			<InputField
				label="GitHub Repository URL"
				v-bind:modelValue="formGithubRepositoryUrl"
				@update:modelValue="(value: string) => emit('update:formGithubRepositoryUrl', value)"
				type="url"
				placeholder="https://github.com/owner/repository"
				:required="true"
			/>
			<span class="flex flex-row mb-4 space-x-6">
				<!-- Branch Name -->
				<InputField
					label="Branch"
					v-bind:modelValue="formBranchName"
					@update:modelValue="(value: string) => emit('update:formBranchName', value)"
					type="text"
					placeholder="main"
					:required="true"
					class="flex-1"
				/>
				<!-- Project Name -->
				<InputField
					label="Project Name"
					v-bind:modelValue="formProjectName"
					@update:modelValue="(value: string) => emit('update:formProjectName', value)"
					type="text"
					placeholder="My Project"
					:required="true"
					class="flex-1"
				/>
			</span>
			<!-- Submit Button -->
			<Button
				class="w-full"
				label="Create Review Session"
				type="submit"
				buttonStyle="primary"
				:disabled="props.isCreatingProject"
			/>
		</form>
	</Card>
</template>
