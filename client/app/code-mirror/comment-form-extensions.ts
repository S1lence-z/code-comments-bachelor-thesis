import { RangeSetBuilder, StateField, StateEffect } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import CommentFormWidget from "./widgets/comment-form-widget";
import type CategoryDto from "../../../base/app/types/dtos/category-dto";
import { CommentType } from "../../../base/app/types/dtos/comment-type";

export interface CommentFormState {
	lineNumber: number;
	commentId: string | null;
	commentType: CommentType;
	initialContent: string;
	initialCategoryId: string;
	filePath: string;
	startLineNumber: number | null;
	endLineNumber: number | null;
}

// State effect to show the form
export const showCommentFormEffect = StateEffect.define<CommentFormState>();

// State effect to hide the form
export const hideCommentFormEffect = StateEffect.define<void>();

/**
 * Creates a CodeMirror extension for displaying the comment form inline
 */
export function commentFormExtension(
	categories: CategoryDto[],
	onSubmit: (content: string, categoryId: string, commentId: string | null) => void,
	onCancel: () => void,
	onDelete: (commentId: string) => void,
	onError: (message: string) => void
) {
	return StateField.define<DecorationSet>({
		create() {
			return Decoration.none;
		},
		update(decorations, tr) {
			// Map existing decorations through changes
			decorations = decorations.map(tr.changes);

			// Check for show form effect
			for (const effect of tr.effects) {
				if (effect.is(showCommentFormEffect)) {
					const formState = effect.value;
					const builder = new RangeSetBuilder<Decoration>();

					// Get the line position
					const line = tr.state.doc.line(formState.lineNumber);

					// Add the form widget
					builder.add(
						line.from,
						line.from,
						Decoration.widget({
							widget: new CommentFormWidget(
								formState.commentId,
								formState.commentType,
								formState.initialContent,
								formState.initialCategoryId,
								categories,
								formState.filePath,
								formState.startLineNumber,
								formState.endLineNumber,
								onSubmit,
								onCancel,
								onDelete,
								onError
							),
							side: -1,
							block: true,
						})
					);

					return builder.finish();
				}

				if (effect.is(hideCommentFormEffect)) {
					return Decoration.none;
				}
			}

			return decorations;
		},
		provide: (f) => EditorView.decorations.from(f),
	});
}
