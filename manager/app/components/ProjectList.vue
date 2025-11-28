<script setup lang="ts">
import type ProjectDto from "../../../base/app/types/dtos/project-dto";
import { useI18n } from "vue-i18n";
import { Icon } from "@iconify/vue";

const { t } = useI18n();

interface ProjectListProps {
	existingProjects: ProjectDto[];
	isLoadingProjects: boolean;
}

interface ProjectListEmits {
	(event: "navigateToExistingProject", project: ProjectDto): void;
}

const props = defineProps<ProjectListProps>();
const emit = defineEmits<ProjectListEmits>();
</script>

<template>
	<Card
		:title="t('projectList.title')"
		:subtitle="t('projectList.subtitle')"
		iconName="archive"
		iconGradient="blue"
		iconSize="6"
	>
		<!-- Loading State -->
		<div v-if="props.isLoadingProjects" class="flex justify-center items-center h-32">
			<Icon icon="mdi:loading" class="w-10 h-10 text-slate-400 animate-spin" />
		</div>
		<!-- Empty State -->
		<div v-else-if="props.existingProjects.length === 0" class="empty-state">
			<div class="empty-state-icon">
				<Icon icon="mdi:inbox" class="w-8 h-8 text-slate-400" />
			</div>
			<p class="text-slate-400">{{ t("projectList.noProjects") }}</p>
			<p class="text-slate-500 text-sm mt-2">{{ t("projectList.noProjectsSubtext") }}</p>
		</div>
		<!-- Existing Projects List -->
		<div v-else class="space-y-4">
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
						<h3
							class="text-white font-semibold group-hover:text-blue-300 transition-colors"
						>
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
