import type CategoryDto from "../../../../base/app/types/dtos/category-dto";
import type CommentDto from "../../../../base/app/types/dtos/comment-dto";
import BaseCommentWidget from "./base-comment-widget";

/**
 * Widget for displaying multiline comments inside CodeMirror. Extends the BaseCommentWidget.
 */
export default class MultilineCommentWidget extends BaseCommentWidget {
	constructor(
		content: string,
		commentId: string,
		category: CategoryDto | null,
		isCompactCommentModal: boolean,
		replies: CommentDto[],
		deleteCommentAction: (commentId: string) => void,
		editCommentAction: (commentId: string) => void,
		replyCommentAction: (commentId: string) => void,
	) {
		super(
			content,
			commentId,
			category,
			isCompactCommentModal,
			replies,
			deleteCommentAction,
			editCommentAction,
			replyCommentAction,
		);
	}

	protected getWidgetTypeClass(): string {
		return "multiline";
	}
}
