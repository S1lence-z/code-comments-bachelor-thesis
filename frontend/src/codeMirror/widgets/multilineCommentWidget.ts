import type CategoryDto from "../../types/dtos/CategoryDto";
import BaseCommentWidget from "./baseCommentWidget";

export default class MultilineCommentWidget extends BaseCommentWidget {
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

	protected getWidgetTypeClass(): string {
		return "multiline";
	}
}
