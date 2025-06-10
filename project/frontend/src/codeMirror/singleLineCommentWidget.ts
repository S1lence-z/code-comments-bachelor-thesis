import type ICategoryDto from "../../../shared/dtos/ICategoryDto.ts";
import BaseCommentWidget from "./baseCommentWidget.ts";

/**
 * A CodeMirror widget that displays comments inline with the code
 */
export default class SingleLineCommentWidget extends BaseCommentWidget {
	protected static readonly className = "cm-singleline-comment-widget";
	private content: string;
	private commentId: number;
	private readonly category: ICategoryDto;

	constructor(content: string, commentId: number, category: ICategoryDto[]) {
		super();
		this.content = content;
		this.commentId = commentId;
		this.category = category[0] || { id: 0, label: "Uncategorized" };
	}

	toDOM() {
		const wrap = document.createElement("div");
		wrap.className = SingleLineCommentWidget.className;

		const tools = document.createElement("div");
		tools.className = "comment-tools";

		// Create and append category label
		const categoryLabel = this.createCategoryLabel(this.category);
		tools.appendChild(categoryLabel);

		// Create and append delete button
		const deleteButton = this.createDeleteButton();
		tools.appendChild(deleteButton);

		// Create and append content div
		const contentDiv = document.createElement("div");
		contentDiv.textContent = this.content;

		wrap.appendChild(tools);
		wrap.appendChild(contentDiv);

		return wrap;
	}

	protected override createDeleteButton(): HTMLButtonElement {
		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.onclick = async () => await this.handleDelete(this.commentId);
		return deleteButton;
	}

	protected override createCategoryLabel(category: ICategoryDto): HTMLSpanElement {
		const label = document.createElement("span");
		label.className = "comment-category comment-category-pill";
		label.textContent = category.label;
		label.style.cssText = `
			display: flex;
			padding: 2px 8px;
			border-radius: 12px;
			background-color: #e0e7ff;
			color: #3730a3;
			font-size: 12px;
			font-weight: 500;
			border: 1px solid #c7d2fe;
		`;
		return label;
	}

	override ignoreEvent() {
		return false;
	}
}
