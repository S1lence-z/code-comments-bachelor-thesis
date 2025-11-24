export enum FileDisplayType {
	Text = "text",
	Image = "image",
	PDF = "pdf",
	Binary = "binary",
}

export interface ProcessedFile {
	displayType: FileDisplayType;
	content: string | null;
	downloadUrl: string | null;
	previewUrl: string | null;
	fileName: string;
}
