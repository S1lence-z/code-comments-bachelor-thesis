export interface TabData {
	filePath: string;
	panelId: number;
	isPreview?: boolean;
}

export interface PanelData {
	id: number;
	openTabs: TabData[];
	activeTab: TabData | null;
	size: number;
}

export interface Workspace {
	repositoryUrl: string;
	repositoryBranch: string;
	panels: PanelData[];
}

export interface DraggedTabData extends TabData {
	fromPanelId: number;
}
