import { EditorState } from "@codemirror/state";
import { RangeSetBuilder, StateField } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import type ICommentDto from "../../../shared/dtos/ICommentDto.ts";
import { CommentType } from "../../../shared/enums/CommentType.ts";
import SinglelineCommentWidget from "./widgets/singleLineCommentWidget.ts";
import MultilineCommentWidget from "./widgets/multilineCommentWidget.ts";

/**
 * Builds decorations for displaying comments in the editor
 */
function buildDecorations(
	state: EditorState,
	commentsToDisplay: Readonly<ICommentDto[]>,
	deleteCommentAction: (commentId: number) => Promise<void>,
	editCommentAction: (commentId: number) => Promise<void>
): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();

	if (!commentsToDisplay || commentsToDisplay.length === 0) {
		return builder.finish();
	}

	// Sort comments by their start position to ensure proper order
	const sortedComments = sortCommentsByPosition(commentsToDisplay);

	for (const comment of sortedComments) {
		switch (comment.type) {
			case CommentType.SingleLine:
				addSingleLineCommentDecoration(comment, state, builder, deleteCommentAction, editCommentAction);
				break;
			case CommentType.MultiLine:
				addMultiLineCommentDecoration(comment, state, builder, deleteCommentAction, editCommentAction);
				break;
		}
	}
	return builder.finish();
}

function sortCommentsByPosition(comments: Readonly<ICommentDto[]>): ICommentDto[] {
	return [...comments].sort((a, b) => {
		const aPos = a.type === CommentType.SingleLine ? a.lineNumber : a.startLineNumber;
		const bPos = b.type === CommentType.SingleLine ? b.lineNumber : b.startLineNumber;
		return aPos! - bPos!;
	});
}

function addMultiLineCommentDecoration(
	comment: ICommentDto,
	state: EditorState,
	builder: RangeSetBuilder<Decoration>,
	deleteCommentAction: (commentId: number) => Promise<void>,
	editCommentAction: (commentId: number) => Promise<void>
): void {
	const startLine = state.doc.line(comment.startLineNumber!);
	builder.add(
		startLine.from,
		startLine.from,
		Decoration.widget({
			widget: new MultilineCommentWidget(
				comment.content,
				comment.id,
				comment.categories ? comment.categories : [],
				deleteCommentAction,
				editCommentAction
			),
			side: -1,
			block: true,
		})
	);
}

function addSingleLineCommentDecoration(
	comment: ICommentDto,
	state: EditorState,
	builder: RangeSetBuilder<Decoration>,
	deleteCommentAction: (commentId: number) => Promise<void>,
	editCommentAction: (commentId: number) => Promise<void>
): void {
	if (comment.lineNumber! > 0 && comment.lineNumber! <= state.doc.lines) {
		const line = state.doc.line(comment.lineNumber!);
		builder.add(
			line.from,
			line.from,
			Decoration.widget({
				widget: new SinglelineCommentWidget(
					comment.content,
					comment.id,
					comment.categories ? comment.categories : [],
					deleteCommentAction,
					editCommentAction
				),
				side: -1,
				block: true,
			})
		);
	}
}

/**
 * Creates a CodeMirror extension for displaying comments
 */
export function commentsDisplayExtension(
	currentComments: Readonly<ICommentDto[]>,
	deleteCommentAction: (commentId: number) => Promise<void>,
	editCommentAction: (commentId: number) => Promise<void>
) {
	return StateField.define<DecorationSet>({
		create(state: EditorState) {
			return buildDecorations(state, currentComments, deleteCommentAction, editCommentAction);
		},
		update(value: DecorationSet, tr) {
			if (tr.docChanged) {
				return buildDecorations(tr.state, currentComments, deleteCommentAction, editCommentAction);
			}
			return value.map(tr.changes);
		},
		provide: (f) => EditorView.decorations.from(f),
	});
}
