import type CategoryDto from "../../types/dtos/CategoryDto";
import BaseCommentWidget from "./baseCommentWidget";

export default class MultilineCommentWidget extends BaseCommentWidget {
	protected static readonly className = "cm-multiline-comment-widget";

	constructor(
		content: string,
		commentId: string,
		category: CategoryDto[],
		isCompactCommentModal: boolean,
		deleteCommentAction: (commentId: string) => Promise<void>,
		editCommentAction: (commentId: string) => Promise<void>
	) {
		super(content, commentId, category, isCompactCommentModal, deleteCommentAction, editCommentAction);
	}

	protected getClassName(): string {
		return MultilineCommentWidget.className;
	}

	protected getCategoryColorClass(): string {
		return "comment-category-orange";
	}
}
