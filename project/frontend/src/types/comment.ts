export interface Comment {
	filePath: string; // Added to match backend and for filtering
	lineNumber: number;
	text: string;
	// Optional: Add author, timestamp, tags, etc.
	tags?: string[];
}
