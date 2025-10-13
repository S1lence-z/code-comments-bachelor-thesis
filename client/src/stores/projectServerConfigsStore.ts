import { defineStore } from "pinia";
import { projectServerConfigsKey } from "../core/keys";

export interface ProjectInfo {
	repositoryUrl: string;
	branch: string;
}

export interface ServerConfig {
	// TODO: use name to easily identify the projects from setup (probably gonna needto add projectName query param as well)
	name?: string;
	serverBaseUrl: string;
	rwServerUrl: string;
}

export const useProjectServerConfigsStore = defineStore("projectServerConfigsStore", {
	state: () => ({
		configs: new Map<ProjectInfo, ServerConfig[]>(),
	}),
	getters: {
		getConfigurations: (state) => state.configs,
		getConfigsForProject(state) {
			return (projectInfo: ProjectInfo): ServerConfig[] | undefined => {
				// Find matching project by comparing values
				for (const [key, value] of state.configs) {
					if (key.repositoryUrl === projectInfo.repositoryUrl && key.branch === projectInfo.branch) {
						return value;
					}
				}
				return undefined;
			};
		},
	},
	actions: {
		loadConfigs() {
			// Load from localStorage
			const storedConfigs = localStorage.getItem(projectServerConfigsKey.description!);
			if (storedConfigs) {
				try {
					const parsed: Array<{ key: { repositoryUrl: string; branch: string }; value: ServerConfig[] }> =
						JSON.parse(storedConfigs);

					// Clear existing configs
					this.configs.clear();

					// Reconstruct the Map with ProjectInfo instances
					parsed.forEach((item) => {
						const projectInfo = {
							repositoryUrl: item.key.repositoryUrl,
							branch: item.key.branch,
						};
						this.configs.set(projectInfo, item.value);
					});
				} catch (error) {
					console.error("Failed to parse project server configs:", error);
				}
			}
		},
		saveConfig(projectInfo: ProjectInfo, serverConfig: ServerConfig) {
			// Save only if serverBaseUrl and rwServerUrl are provided
			if (!serverConfig.serverBaseUrl || !serverConfig.rwServerUrl) {
				return;
			}

			// Find existing key that matches projectInfo
			let existingKey: ProjectInfo | undefined;
			for (const key of this.configs.keys()) {
				if (key.repositoryUrl === projectInfo.repositoryUrl && key.branch === projectInfo.branch) {
					existingKey = key;
					break;
				}
			}

			if (existingKey) {
				// Get existing configs array
				const existingConfigs = this.configs.get(existingKey) || [];

				// Check if this exact server config already exists (by serverBaseUrl)
				const configIndex = existingConfigs.findIndex(
					(config) => config.serverBaseUrl === serverConfig.serverBaseUrl
				);

				if (configIndex !== -1) {
					// Update existing config
					existingConfigs[configIndex] = serverConfig;
				} else {
					// Add new config
					existingConfigs.push(serverConfig);
				}

				this.configs.set(existingKey, existingConfigs);
			} else {
				// Create new entry for this project
				this.configs.set(projectInfo, [serverConfig]);
			}

			// Persist to localStorage
			this.persistConfigs();
		},
		persistConfigs() {
			try {
				// Convert Map to serializable array
				const serializable = Array.from(this.configs.entries()).map(([key, value]) => ({
					key: {
						repositoryUrl: key.repositoryUrl,
						branch: key.branch,
					},
					value: value,
				}));

				localStorage.setItem(projectServerConfigsKey.description!, JSON.stringify(serializable));
			} catch (error) {
				console.error("Failed to persist project server configs:", error);
			}
		},
	},
});
