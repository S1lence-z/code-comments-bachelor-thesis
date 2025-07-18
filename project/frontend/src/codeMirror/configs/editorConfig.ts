import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, lineNumbers, keymap } from "@codemirror/view";
import type ICommentDto from "../../../../shared/dtos/ICommentDto.ts";
import { getLanguageExtension } from "../../utils/languageUtils.ts";
import { commentsDisplayExtension } from "../commentsExtension.ts";
import { getLineNumbersConfig, type LineNumberConfig } from "./lineNumbersConfig.ts";
import { multilineCommentHighlightExtension, multilineCommentTheme } from "../others/multilineCommentHighlight.ts";
import { EditorState, type Extension } from "@codemirror/state";

/**
 * Creates the standard set of CodeMirror extensions for the code editor
 */
export function createEditorExtensions(
	filePath: string | null,
	comments: ICommentDto[] = [],
	deleteCommentAction: (commentId: number) => Promise<void>,
	isKeyboardMode: boolean,
	onSingleLineComment: (lineNumber: number, filePath: string) => void
) {
	const langExt = getLanguageExtension(filePath);
	const currentFileComments = comments || [];
	const lineNumbersConfig: LineNumberConfig = getLineNumbersConfig(currentFileComments);

	const extensions = [
		oneDark,
		lineNumbers(lineNumbersConfig),
		multilineCommentHighlightExtension(currentFileComments),
		multilineCommentTheme,
		EditorView.lineWrapping,
		...(Array.isArray(langExt) ? langExt : [langExt]),
		commentsDisplayExtension(currentFileComments, deleteCommentAction),
		addCursorNavigationExtensions(isKeyboardMode, filePath, onSingleLineComment),
	];

	return extensions;
}

function addCustomKeyboardShortcuts(
	filePath: string | null,
	onSingleLineComment: (lineNumber: number, filePath: string) => void
): Extension[] {
	// Custom keyboard shortcuts for keyboard mode
	return [
		keymap.of([
			{
				key: "Ctrl-c",
				preventDefault: true,
				run: (view) => {
					const selection = view.state.selection.main;
					if (selection.empty) {
						const lineNumber = view.state.doc.lineAt(selection.head).number;
						if (filePath) {
							onSingleLineComment(lineNumber, filePath);
						}
					}
					return true;
				},
			},
		]),
	];
}

function addCursorNavigationExtensions(
	showCursor: boolean,
	filePath: string | null,
	onSingleLineComment: (lineNumber: number, filePath: string) => void
): Extension[] {
	const extensions: Extension[] = [];
	if (!showCursor) {
		extensions.push(EditorView.editable.of(showCursor));
		return extensions;
	}

	// Block all document changes but allow cursor movement and selection
	extensions.push(
		EditorState.transactionFilter.of((tr) => {
			return tr.docChanged ? [] : tr;
		}),
		// Visual styling for keyboard mode
		EditorView.theme({
			"&.cm-focused": {
				outline: "2px solid #007acc",
				outlineOffset: "1px",
			},
			".cm-cursor": {
				borderLeftColor: "#007acc",
				borderLeftWidth: "4px",
				animation: "blink 1s step-end infinite",
			},
			"&": {
				cursor: "text",
			},
		}),
		// Ensure the editor can receive focus
		EditorView.contentAttributes.of({
			tabindex: "0",
		})
	);

	// Add custom keyboard shortcuts for single line comments
	extensions.push(...addCustomKeyboardShortcuts(filePath, onSingleLineComment));

	return extensions;
}
