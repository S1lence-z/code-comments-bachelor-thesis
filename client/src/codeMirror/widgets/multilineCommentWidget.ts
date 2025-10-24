import type CategoryDto from "../../types/dtos/CategoryDto";
import type CommentDto from "../../types/dtos/CommentDto";
import BaseCommentWidget from "./baseCommentWidget";

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
