import { WidgetType } from "@codemirror/view";
import type ICategoryDto from "../../types/interfaces/ICategoryDto.ts";

export default abstract class BaseCommentWidget extends WidgetType {
	protected static readonly className: string;
	protected handleDeleteComment: (commentId: string) => Promise<void>;
	protected handleEditComment: (updatedComment: string) => Promise<void>;

	constructor(
		handleDeleteComment: (commentId: string) => Promise<void>,
		handleEditComment: (updatedComment: string) => Promise<void>
	) {
		super();
		this.handleDeleteComment = handleDeleteComment;
		this.handleEditComment = handleEditComment;
	}

	protected abstract createCategoryLabel(category: ICategoryDto): HTMLSpanElement;
	protected abstract createDeleteButton(): HTMLButtonElement;
	protected abstract createEditButton(): HTMLButtonElement;
}
