<script setup lang="ts">
import type ProjectDto from "../../types/dtos/ProjectDto";
import Card from "../../lib/Card.vue";

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
		iconSize="6"
	>
		<!-- Empty State -->
		<div v-if="props.existingProjects.length === 0" class="empty-state">
			<div class="empty-state-icon">
				<Icon icon="mdi:inbox" class="w-8 h-8 text-slate-400" />
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
							<Icon icon="mdi:code-tags" class="w-5 h-5" />
						</div>
						<h3 class="text-white font-semibold group-hover:text-blue-300 transition-colors">
							{{ project.name.length !== 0 ? project.name : project.repository.repositoryUrl }}
						</h3>
					</div>
					<div class="card-icon-sm">
						<Icon icon="mdi:external-link" class="w-5 h-5" />
					</div>
				</div>
			</div>
		</div>
	</Card>
</template>
