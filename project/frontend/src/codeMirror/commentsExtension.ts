import { EditorState } from "@codemirror/state";
import { RangeSetBuilder, StateField } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import { CommentWidget } from "./commentWidget.ts";
import type ICommentDto from "../../../shared/dtos/ICommentDto.ts";

/**
 * Builds decorations for displaying comments in the editor
 */
export function buildDecorations(
	state: EditorState,
	commentsToDisplay: Readonly<ICommentDto[]>
): DecorationSet {
	console.log("Building decorations for comments:", commentsToDisplay);
	const builder = new RangeSetBuilder<Decoration>();
	if (!commentsToDisplay || commentsToDisplay.length === 0) {
		return builder.finish();
	}

	for (const comment of commentsToDisplay) {
		if (comment.lineNumber > 0 && comment.lineNumber <= state.doc.lines) {
			const line = state.doc.line(comment.lineNumber);
			builder.add(
				line.from,
				line.from,
				Decoration.widget({
					widget: new CommentWidget(comment.content),
					side: -1, // Place widget before the line's actual content start
					block: true,
				})
			);
		}
	}
	return builder.finish();
}

/**
 * Creates a CodeMirror extension for displaying comments
 */
export function commentsDisplayExtension(currentComments: Readonly<ICommentDto[]>) {
	return StateField.define<DecorationSet>({
		create(state: EditorState) {
			return buildDecorations(state, currentComments);
		},
		update(value: DecorationSet, tr) {
			if (tr.docChanged) {
				return buildDecorations(tr.state, currentComments);
			}
			return value.map(tr.changes);
		},
		provide: (f) => EditorView.decorations.from(f),
	});
}
