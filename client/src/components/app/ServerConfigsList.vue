<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import Card from "../../lib/Card.vue";
import Button from "../../lib/Button.vue";
import type { ProjectInfo, ServerConfig } from "../../stores/projectServerConfigsStore";

const { t } = useI18n();

interface ServerConfigList {
	currentProject: ProjectInfo;
	projectConfigs: ServerConfig[] | undefined;
}

interface ServerConfigsListEmits {
	(event: "select", payload: ServerConfig): void;
	(event: "close"): void;
}

const props = defineProps<ServerConfigList>();
const emit = defineEmits<ServerConfigsListEmits>();

// Methods
const handleSelectServerConfig = (serverConfig: ServerConfig) => {
	emit("select", serverConfig);
	emit("close");
};

// Get the repository name from the URL
const getRepositoryName = (url: string) => {
	return url.split("/").pop() || url;
};

// Navigate to manager
const navigateToManager = () => {
	window.location.href = import.meta.env.VITE_MANAGER_URL;
};
</script>

<template>
	<Card
		class="w-[600px] max-w-full mx-auto"
		icon-name="archive"
		icon-gradient="blue"
		:title="t('serverConfigList.title')"
	>
		<div class="flex flex-col gap-6">
			<!-- Project Info Section -->
			<div class="bg-white/5 border border-white/10 rounded-lg p-4">
				<div class="flex items-center gap-2 mb-2">
					<Icon icon="mdi:source-repository" class="w-5 h-5 text-blue-400" />
					<span class="text-slate-300 font-semibold">{{
						getRepositoryName(props.currentProject.repositoryUrl)
					}}</span>
				</div>
				<div class="flex items-center gap-2">
					<Icon icon="mdi:source-branch" class="w-5 h-5 text-emerald-400" />
					<span class="text-slate-400 text-sm">{{ props.currentProject.branch }}</span>
				</div>
			</div>

			<!-- Empty State -->
			<div v-if="!props.projectConfigs || props.projectConfigs.length === 0" class="empty-state">
				<div class="empty-state-icon">
					<Icon icon="mdi:inbox" class="w-8 h-8 text-slate-400" />
				</div>
				<p class="text-slate-400 text-base">{{ t("serverConfigList.noConfigs") }}</p>
				<p class="text-slate-500 text-lg mt-4">{{ t("serverConfigList.createProject") }}</p>
				<Button
					:label="t('serverConfigList.goToSetup')"
					button-style="primary"
					button-size="large"
					class="mt-4"
					@click="navigateToManager"
				/>
			</div>

			<!-- Configurations List -->
			<div v-else class="flex flex-col gap-3">
				<h3 class="text-slate-300 font-semibold text-sm uppercase tracking-wide">
					{{ t("serverConfigList.availableConfigs") }}
				</h3>
				<ul class="max-h-80 overflow-y-auto space-y-2 pr-2 truncate">
					<li v-for="(config, index) in props.projectConfigs" :key="index">
						<div class="card-item cursor-pointer group" @click="handleSelectServerConfig(config)">
							<div class="flex items-start justify-between">
								<div class="flex-1 space-y-3">
									<!-- Config Name (if available) -->
									<div v-if="config.name" class="flex items-start gap-2">
										<Icon icon="mdi:tag" class="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
										<div class="flex-1">
											<p class="text-xs text-slate-400 mb-1">
												{{ t("serverConfigList.configName") }}
											</p>
											<p class="text-slate-300 font-semibold">{{ config.name }}</p>
										</div>
									</div>

									<!-- Server Base URL -->
									<div class="flex items-start gap-2">
										<Icon icon="mdi:server" class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
										<div class="flex-1 min-w-0">
											<p class="text-xs text-slate-400 mb-1">
												{{ t("serverConfigList.serverBaseUrl") }}
											</p>
											<p class="text-white font-medium">{{ config.serverBaseUrl }}</p>
										</div>
									</div>
								</div>

								<!-- Select Arrow Icon -->
								<Icon
									icon="mdi:chevron-right"
									class="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2"
								/>
							</div>
						</div>
					</li>
				</ul>
			</div>

			<!-- Close Button -->
			<div class="flex justify-end pt-4 border-t border-white/10">
				<Button
					:label="t('serverConfigList.cancel')"
					button-style="secondary"
					button-size="medium"
					@click="emit('close')"
				/>
			</div>
		</div>
	</Card>
</template>
