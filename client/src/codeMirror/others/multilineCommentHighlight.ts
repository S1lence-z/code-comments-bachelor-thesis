import { EditorView, ViewPlugin, ViewUpdate, Decoration, type DecorationSet } from "@codemirror/view";
import { Range } from "@codemirror/state";
import type CommentDto from "../../types/dtos/CommentDto";
import { useErrorHandler } from "../../composables/useErrorHandler";

// Create decorations for line numbers and gutter markers
const multilineCommentLineNumberDeco = Decoration.line({
	class: "multiline-comment-line-number",
});

// Plugin to apply multiline comment highlighting
export function multilineCommentHighlightExtension(comments: CommentDto[]) {
	const { showWarning } = useErrorHandler();

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
					for (
						let lineNum = comment.location.startLineNumber!;
						lineNum <= comment.location.endLineNumber!;
						lineNum++
					) {
						try {
							const line = doc.line(lineNum);
							// Add decoration for this line
							decorations.push(multilineCommentLineNumberDeco.range(line.from));
						} catch (e) {
							// Line might not exist, skip it
							showWarning(
								`Line ${lineNum} does not exist in document ${comment.location.filePath}. Skipping decoration.`
							);
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

// TODO: move this styling to a tailwind class
// Theme extension for styling
export const multilineCommentTheme = EditorView.theme({
	".cm-line.multiline-comment-line-number": {
		background: "rgba(154, 52, 18, 0.08)",
		"backdrop-filter": "blur(4px)",
		"-webkit-backdrop-filter": "blur(4px)",
		"border-left": "3px solid rgba(154, 52, 18)",
		"border-radius": "0 4px 4px 0",
		position: "relative",
	},
});
