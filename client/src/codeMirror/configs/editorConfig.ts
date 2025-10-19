import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, lineNumbers, keymap } from "@codemirror/view";
import type CommentDto from "../../types/dtos/CommentDto.ts";
import type CategoryDto from "../../types/dtos/CategoryDto.ts";
import { getLanguageExtension } from "../../utils/languageUtils.ts";
import { commentsDisplayExtension } from "../commentsExtension.ts";
import { commentFormExtension } from "../commentFormExtension.ts";
import { getLineNumbersConfig, type LineNumberConfig } from "./lineNumbersConfig.ts";
import { multilineCommentHighlightExtension, multilineCommentTheme } from "../others/multilineCommentHighlight.ts";
import { EditorState, type Extension } from "@codemirror/state";
import type { AppKeyboardShortcuts } from "../../types/domain/KeyboardShortcuts.ts";

/**
 * Creates the standard set of CodeMirror extensions for the code editor
 */
export function createEditorExtensions(
	// Props
	filePath: string | null,
	comments: CommentDto[] = [],
	isKeyboardMode: boolean,
	isCompactCommentModal: boolean,
	appKeyboardShortcuts: AppKeyboardShortcuts,
	categories: CategoryDto[] = [],
	// Callbacks
	onDeleteComment: (commentId: string) => Promise<void>,
	onEditComment: (commentId: string) => void,
	onCancelUpsertingComment: () => void,
	onUpsertComment: (content: string, categoryLabel: string, commentId: string | null) => Promise<void>,
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
		commentsDisplayExtension(currentFileComments, isCompactCommentModal, onDeleteComment, onEditComment),
		addCursorNavigationExtensions(isKeyboardMode),
		addCustomKeyboardShortcuts(filePath, onSingleLineComment, appKeyboardShortcuts),
		preventDefaultDragAndDrop(),
		commentFormExtension(categories, onUpsertComment, onCancelUpsertingComment, onDeleteComment),
	];

	return extensions;
}

// Make an extension to prevent the default drag and drop behavior
export function preventDefaultDragAndDrop(): Extension {
	return EditorView.domEventHandlers({
		dragover: (event) => {
			event.preventDefault();
			return false;
		},
		drop: (event) => {
			event.preventDefault();
			return false;
		},
	});
}

function addCustomKeyboardShortcuts(
	filePath: string | null,
	onSingleLineComment: (lineNumber: number, filePath: string) => void,
	appKeyboardShortcuts: AppKeyboardShortcuts
): Extension[] {
	// Custom keyboard shortcuts for keyboard mode
	return [
		keymap.of([
			{
				key: appKeyboardShortcuts.addComment.binding,
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

function addCursorNavigationExtensions(showCursor: boolean): Extension[] {
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

	return extensions;
}
