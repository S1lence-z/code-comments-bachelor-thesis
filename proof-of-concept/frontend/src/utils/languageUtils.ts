// Language utility functions
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { vue } from "@codemirror/lang-vue";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import type { LanguageSupport } from "@codemirror/language";

export function getLanguageExtension(filePath: string | null): LanguageSupport | LanguageSupport[] {
	if (!filePath) return javascript(); // Default to JavaScript
	const extension = filePath.split(".").pop()?.toLowerCase();
	switch (extension) {
		case "js":
		case "ts":
		case "mjs":
		case "cjs":
			return javascript();
		case "html":
		case "htm":
			return html();
		case "css":
			return css();
		case "vue":
			return vue();
		case "json":
			return json();
		case "md":
			return markdown();
		case "py":
			return python();
		case "sql":
			return sql();
		default:
			return []; // Return empty array for unknown extensions
	}
}
