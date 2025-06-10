import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, lineNumbers, gutter } from "@codemirror/view";
import type ICommentDto from "../../../shared/dtos/ICommentDto.ts";
import { getLanguageExtension } from "../utils/languageUtils.ts";
import { commentsDisplayExtension } from "../codeMirror/commentsExtension.ts";
import { getLineNumbersConfig, type LineNumberConfig } from "./lineNumbersConfig.ts";
import { createGutterConfig, type GutterConfig } from "./gutterConfig.ts";
import {
	multilineCommentHighlightExtension,
	multilineCommentTheme,
} from "./multilineCommentHighlight.ts";

/**
 * Creates the standard set of CodeMirror extensions for the code editor
 */
export function createEditorExtensions(
	filePath: string | null,
	comments: ICommentDto[] = [],
	deleteCommentAction: (commentId: number) => Promise<void>,
	isKeyboardMode = false
) {
	const langExt = getLanguageExtension(filePath);
	const currentFileComments = comments || [];
	const lineNumbersConfig: LineNumberConfig = getLineNumbersConfig(currentFileComments);
	const guttersConfig: GutterConfig = createGutterConfig(currentFileComments);

	const extensions = [
		oneDark,
		lineNumbers(lineNumbersConfig),
		gutter(guttersConfig),
		multilineCommentHighlightExtension(currentFileComments),
		multilineCommentTheme,
		EditorView.lineWrapping,
		...(Array.isArray(langExt) ? langExt : [langExt]),
		EditorView.editable.of(false),
		commentsDisplayExtension(currentFileComments, deleteCommentAction),
	];

	// Add keyboard navigation specific extensions
	if (isKeyboardMode) {
		extensions.push(
			// Ensure the editor can receive focus for keyboard navigation
			EditorView.theme({
				"&.cm-focused": {
					outline: "2px solid #007acc",
					outlineOffset: "1px",
				},
				".cm-cursor": {
					borderLeftColor: "#007acc",
					borderLeftWidth: "2px",
				},
			})
		);
	}

	return extensions;
}
