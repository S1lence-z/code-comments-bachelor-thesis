export function getFileName(path: string | null): string {
	if (!path) return "";
	return path.split("/").pop() || path;
}

export function getFileIcon(fileName?: string | null): string {
	if (!fileName) return "📄"; // Default icon
	const extension = fileName.split(".").pop()?.toLowerCase();
	switch (extension) {
		case "js":
			return "JS";
		case "ts":
			return "TS";
		case "vue":
			return "Vue";
		case "html":
			return "🌐";
		case "css":
			return "🎨";
		case "json":
			return "{ }";
		case "md":
			return "Ⓜ️";
		case "py":
			return "🐍";
		case "sql":
			return "💾";
		case "png":
		case "jpg":
		case "jpeg":
		case "gif":
		case "svg":
			return "🖼️";
		default:
			return "📄";
	}
}
