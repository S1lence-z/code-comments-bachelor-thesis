import { EditorView, ViewPlugin, ViewUpdate, Decoration, type DecorationSet } from "@codemirror/view";
import { Range } from "@codemirror/state";
import type ICommentDto from "../../../shared/dtos/ICommentDto.ts";

// Create decorations for line numbers and gutter markers
const multilineCommentLineNumberDeco = Decoration.line({
	class: "multiline-comment-line-number",
});

// Plugin to apply multiline comment highlighting
export function multilineCommentHighlightExtension(comments: ICommentDto[]) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = this.buildDecorations(view);
			}

			update(update: ViewUpdate) {
				// Rebuild decorations if the document changed or if we need to refresh
				if (update.docChanged || update.viewportChanged) {
					this.decorations = this.buildDecorations(update.view);
				}
			}

			buildDecorations(view: EditorView): DecorationSet {
				const decorations: Range<Decoration>[] = [];
				const doc = view.state.doc;

				comments.forEach((comment) => {
					for (let lineNum = comment.startLineNumber!; lineNum <= comment.endLineNumber!; lineNum++) {
						try {
							const line = doc.line(lineNum);
							// Add decoration for this line
							decorations.push(multilineCommentLineNumberDeco.range(line.from));
						} catch (e) {
							// Line might not exist, skip it
							console.warn(`Line ${lineNum} does not exist in document`);
						}
					}
				});

				// Sort decorations by position to avoid "Ranges must be added sorted" error
				decorations.sort((a, b) => a.from - b.from);
				return Decoration.set(decorations);
			}
		},
		{
			decorations: (v) => v.decorations,
		}
	);
}

// Theme extension for styling
export const multilineCommentTheme = EditorView.theme({
	".cm-line.multiline-comment-line-number": {
		"background-color": "#154066",
		color: "#154066",
	},
	".cm-gutterElement.multiline-comment-line-number": {
		"background-color": "#154066 !important",
		color: "#154066 !important",
		"border-radius": "2px",
	},
	".multiline-comment-gutter-line": {
		"background-color": "#154066",
	},
});
