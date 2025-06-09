import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, lineNumbers } from "@codemirror/view";
import { getLanguageExtension } from "../utils/languageUtils.ts";
import type ICommentDto from "../../../shared/dtos/ICommentDto.ts";
import { commentsDisplayExtension } from "../codeMirror/commentsExtension.ts";

/**
 * Creates the standard set of CodeMirror extensions for the code editor
 */
export function createEditorExtensions(filePath: string | null, comments: ICommentDto[] = []) {
	const langExt = getLanguageExtension(filePath);
	const currentFileComments = comments || [];

	return [
		oneDark,
		lineNumbers(),
		EditorView.lineWrapping,
		...(Array.isArray(langExt) ? langExt : [langExt]),
		EditorView.editable.of(false),
		commentsDisplayExtension(currentFileComments),
	];
}
