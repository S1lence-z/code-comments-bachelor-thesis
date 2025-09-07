<script setup lang="ts">
import { defineProps } from "vue";
import type ProjectDto from "../../types/dtos/ProjectDto";
import Card from "../../lib/Card.vue";
import Icon from "../../lib/Icon.vue";

interface ProjectListProps {
	existingProjects: ProjectDto[];
}
const props = defineProps<ProjectListProps>();

const emit = defineEmits<{
	(event: "navigateToExistingProject", project: ProjectDto): void;
}>();
</script>

<template>
	<Card
		title="Existing Projects"
		subtitle="Continue working on your previous code reviews"
		iconName="archive"
		iconGradient="blue"
	>
		<!-- Empty State -->
		<div v-if="props.existingProjects.length === 0" class="empty-state">
			<div class="empty-state-icon">
				<svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			<div
				v-for="project in existingProjects"
				:key="project.id"
				class="card-item cursor-pointer"
				@click="emit('navigateToExistingProject', project)"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="card-icon-sm gradient-icon-green">
							<Icon srcName="code" />
						</div>
						<h3 class="text-white font-semibold group-hover:text-blue-300 transition-colors">
							{{ project.name.length !== 0 ? project.name : project.repository.repositoryUrl }}
						</h3>
					</div>
					<div class="card-icon-sm">
						<Icon srcName="externalLink" />
					</div>
				</div>
			</div>
		</div>
	</Card>
</template>
