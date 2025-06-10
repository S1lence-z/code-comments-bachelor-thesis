import type ICategoryDto from "../../../shared/dtos/ICategoryDto";
import BaseCommentWidget from "./baseCommentWidget";

export default class MultilineCommentWidget extends BaseCommentWidget {
	protected static readonly className = "cm-multiline-comment-widget";
	private content: string;
	private commentId: number;
	private category: ICategoryDto;

	constructor(
		content: string,
		commentId: number,
		category: ICategoryDto[],
		deleteCommentAction: (commentId: number) => Promise<void>
	) {
		super(deleteCommentAction);
		this.content = content;
		this.commentId = commentId;
		this.category = category[0] || { id: 0, label: "Uncategorized" };
	}

	toDOM() {
		const wrap = document.createElement("div");
		wrap.className = MultilineCommentWidget.className;

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
		deleteButton.onclick = async () => await this.handleDeleteComment(this.commentId);
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
