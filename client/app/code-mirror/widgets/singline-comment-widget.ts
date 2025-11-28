import type CategoryDto from "../../../../base/app/types/dtos/category-dto";
import type CommentDto from "../../../../base/app/types/dtos/comment-dto";
import BaseCommentWidget from "./base-comment-widget";

/**
 * A CodeMirror widget that displays comments inline with the code
 */
export default class SingleLineCommentWidget extends BaseCommentWidget {
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
		return "";
	}
}
