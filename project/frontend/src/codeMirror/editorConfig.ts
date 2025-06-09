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
	writeApiUrl: string,
	isEditable = false
) {
	const langExt = getLanguageExtension(filePath);
	const currentFileComments = comments || [];
	const lineNumbersConfig: LineNumberConfig = getLineNumbersConfig(currentFileComments);
	const guttersConfig: GutterConfig = createGutterConfig(currentFileComments);
	return [
		oneDark,
		lineNumbers(lineNumbersConfig),
		gutter(guttersConfig),
		multilineCommentHighlightExtension(currentFileComments),
		multilineCommentTheme,
		EditorView.lineWrapping,
		...(Array.isArray(langExt) ? langExt : [langExt]),
		EditorView.editable.of(isEditable),
		commentsDisplayExtension(currentFileComments, writeApiUrl),
	];
}
