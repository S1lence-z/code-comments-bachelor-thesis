import { WidgetType } from "@codemirror/view";
import type ICategoryDto from "../../../shared/dtos/ICategoryDto";
import { inject } from "vue";

export default abstract class BaseCommentWidget extends WidgetType {
	protected static readonly className: string;
	protected handleDelete: (commentId: number) => Promise<void>;

	constructor() {
		super();
		this.handleDelete = inject("deleteCommentAndReload") as (
			commentId: number
		) => Promise<void>;
	}

	protected abstract createCategoryLabel(category: ICategoryDto): HTMLSpanElement;
	protected abstract createDeleteButton(): HTMLButtonElement;
}
