import { EditorState } from "@codemirror/state";
import { RangeSetBuilder, StateField } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import type CommentDto from "../types/dtos/comment-dto.ts";
import { CommentType } from "../types/dtos/comment-type.ts";
import SinglelineCommentWidget from "./widgets/singline-comment-widget.ts";
import MultilineCommentWidget from "./widgets/multiline-comment-widget.ts";

/**
 * Builds decorations for displaying comments in the editor
 */
function buildDecorations(
	state: EditorState,
	commentsToDisplay: Readonly<CommentDto[]>,
	isCompactCommentModal: boolean,
	deleteCommentAction: (commentId: string) => void,
	editCommentAction: (commentId: string) => void,
	replyCommentAction: (commentId: string) => void
): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();

	if (!commentsToDisplay || commentsToDisplay.length === 0) {
		return builder.finish();
	}

	// Sort comments by their start position to ensure proper order
	const sortedComments = sortCommentsByPosition(commentsToDisplay);

	for (const comment of sortedComments) {
		switch (comment.type) {
			case CommentType.Singleline:
				addSingleLineCommentDecoration(
					comment,
					isCompactCommentModal,
					state,
					builder,
					deleteCommentAction,
					editCommentAction,
					replyCommentAction
				);
				break;
			case CommentType.Multiline:
				addMultiLineCommentDecoration(
					comment,
					isCompactCommentModal,
					state,
					builder,
					deleteCommentAction,
					editCommentAction,
					replyCommentAction
				);
				break;
		}
	}
	return builder.finish();
}

function sortCommentsByPosition(comments: Readonly<CommentDto[]>): CommentDto[] {
	return [...comments].sort((a, b) => {
		const aPos = a.type === CommentType.Singleline ? a.location.lineNumber : a.location.startLineNumber;
		const bPos = b.type === CommentType.Singleline ? b.location.lineNumber : b.location.startLineNumber;
		return aPos! - bPos!;
	});
}

function addMultiLineCommentDecoration(
	comment: CommentDto,
	isCompactCommentModal: boolean,
	state: EditorState,
	builder: RangeSetBuilder<Decoration>,
	deleteCommentAction: (commentId: string) => void,
	editCommentAction: (commentId: string) => void,
	replyCommentAction: (commentId: string) => void
): void {
	const startLine = state.doc.line(comment.location.startLineNumber!);
	builder.add(
		startLine.from,
		startLine.from,
		Decoration.widget({
			widget: new MultilineCommentWidget(
				comment.content,
				comment.id ?? "",
				comment.category ?? null,
				isCompactCommentModal,
				comment.replies ?? [],
				deleteCommentAction,
				editCommentAction,
				replyCommentAction
			),
			side: -1,
			block: true,
		})
	);
}

function addSingleLineCommentDecoration(
	comment: CommentDto,
	isCompactCommentModal: boolean,
	state: EditorState,
	builder: RangeSetBuilder<Decoration>,
	deleteCommentAction: (commentId: string) => void,
	editCommentAction: (commentId: string) => void,
	replyCommentAction: (commentId: string) => void
): void {
	if (comment.location.lineNumber! > 0 && comment.location.lineNumber! <= state.doc.lines) {
		const line = state.doc.line(comment.location.lineNumber!);
		builder.add(
			line.from,
			line.from,
			Decoration.widget({
				widget: new SinglelineCommentWidget(
					comment.content,
					comment.id ?? "",
					comment.category ?? null,
					isCompactCommentModal,
					comment.replies ?? [],
					deleteCommentAction,
					editCommentAction,
					replyCommentAction
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
	currentComments: Readonly<CommentDto[]>,
	isCompactCommentModal: boolean,
	deleteCommentAction: (commentId: string) => void,
	editCommentAction: (commentId: string) => void,
	replyCommentAction: (commentId: string) => void
) {
	return StateField.define<DecorationSet>({
		create(state: EditorState) {
			return buildDecorations(
				state,
				currentComments,
				isCompactCommentModal,
				deleteCommentAction,
				editCommentAction,
				replyCommentAction
			);
		},
		update(value: DecorationSet, tr) {
			if (tr.docChanged) {
				return buildDecorations(
					tr.state,
					currentComments,
					isCompactCommentModal,
					deleteCommentAction,
					editCommentAction,
					replyCommentAction
				);
			}
			return value.map(tr.changes);
		},
		provide: (f) => EditorView.decorations.from(f),
	});
}
