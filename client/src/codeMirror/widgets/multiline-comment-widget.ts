import type CategoryDto from "../../types/dtos/category-dto";
import type CommentDto from "../../types/dtos/comment-dto";
import BaseCommentWidget from "./base-comment-widget";

export default class MultilineCommentWidget extends BaseCommentWidget {
	constructor(
		content: string,
		commentId: string,
		category: CategoryDto | null,
		isCompactCommentModal: boolean,
		replies: CommentDto[],
		deleteCommentAction: (commentId: string) => void,
		editCommentAction: (commentId: string) => void,
		replyCommentAction: (commentId: string) => void
	) {
		super(
			content,
			commentId,
			category,
			isCompactCommentModal,
			replies,
			deleteCommentAction,
			editCommentAction,
			replyCommentAction
		);
	}

	protected getWidgetTypeClass(): string {
		return "multiline";
	}
}
