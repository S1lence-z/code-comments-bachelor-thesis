import type CategoryDto from "../../types/dtos/CategoryDto.ts";
import BaseCommentWidget from "./baseCommentWidget.ts";

/**
 * A CodeMirror widget that displays comments inline with the code
 */
export default class SingleLineCommentWidget extends BaseCommentWidget {
	constructor(
		content: string,
		commentId: string,
		category: CategoryDto | null,
		isCompactCommentModal: boolean,
		deleteCommentAction: (commentId: string) => Promise<void>,
		editCommentAction: (commentId: string) => void
	) {
		super(content, commentId, category, isCompactCommentModal, deleteCommentAction, editCommentAction);
	}

	protected getWidgetTypeClass(): string {
		return "";
	}
}
