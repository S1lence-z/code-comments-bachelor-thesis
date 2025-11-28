export function getFileName(path: string | null): string {
	if (!path) return "";
	return path.split("/").pop() || path;
}

export function getFileDirectory(path: string | null): string {
	if (!path) return "";
	return path.split("/").slice(0, -1).join("/") || "/";
}

export function getFileIcon(fileName: string | null): string {
	if (!fileName) return "📄"; // Default icon
	const extension = fileName.split(".").pop()?.toLowerCase();
	switch (extension) {
		case "js":
		case "jsx":
			return "JS";
		case "ts":
		case "tsx":
			return "TS";
		case "vue":
			return "V";
		case "html":
		case "htm":
			return "H";
		case "css":
		case "scss":
		case "sass":
		case "less":
			return "S";
		case "json":
			return "{ }";
		case "md":
		case "markdown":
			return "M";
		case "py":
			return "Py";
		case "sql":
			return "DB";
		case "png":
		case "jpg":
		case "jpeg":
		case "gif":
		case "svg":
		case "webp":
		case "ico":
			return "🖼️";
		case "pdf":
			return "📄";
		case "zip":
		case "rar":
		case "7z":
		case "tar":
		case "gz":
			return "📦";
		case "txt":
		case "log":
			return "📝";
		case "xml":
			return "⚙️";
		case "yml":
		case "yaml":
			return "Y";
		case "env":
			return "E";
		case "gitignore":
		case "git":
			return "G";
		case "lock":
			return "🔒";
		default:
			return "📄";
	}
}

export function getFileIconColor(fileName: string): string {
	const extension = fileName.split(".").pop()?.toLowerCase();
	switch (extension) {
		case "js":
		case "jsx":
			return "#f7df1e"; // JavaScript yellow
		case "ts":
		case "tsx":
			return "#3178c6"; // TypeScript blue
		case "vue":
			return "#4fc08d"; // Vue green
		case "html":
		case "htm":
			return "#e34c26"; // HTML orange
		case "css":
		case "scss":
		case "sass":
		case "less":
			return "#1572b6"; // CSS blue
		case "json":
			return "#ffd700"; // JSON gold
		case "md":
		case "markdown":
			return "#084c61"; // Markdown dark blue
		case "py":
			return "#3776ab"; // Python blue
		case "sql":
			return "#336791"; // SQL blue
		case "yml":
		case "yaml":
			return "#cb171e"; // YAML red
		case "xml":
			return "#0060ac"; // XML blue
		case "env":
			return "#ecd53f"; // Environment yellow
		case "git":
		case "gitignore":
			return "#f05032"; // Git red
		case "lock":
			return "#888888"; // Lock gray
		default:
			return "#cccccc"; // Default gray
	}
}
