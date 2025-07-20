import { WidgetType } from "@codemirror/view";
import type ICategoryDto from "../../../../shared/dtos/ICategoryDto.ts";

export default abstract class BaseCommentWidget extends WidgetType {
	protected static readonly className: string;
	protected handleDeleteComment: (commentId: number) => Promise<void>;
	protected handleEditComment: (updatedComment: number) => Promise<void>;

	constructor(
		handleDeleteComment: (commentId: number) => Promise<void>,
		handleEditComment: (commentId: number) => Promise<void>
	) {
		super();
		this.handleDeleteComment = handleDeleteComment;
		this.handleEditComment = handleEditComment;
	}

	protected abstract createCategoryLabel(category: ICategoryDto): HTMLSpanElement;
	protected abstract createDeleteButton(): HTMLButtonElement;
	protected abstract createEditButton(): HTMLButtonElement;
}
