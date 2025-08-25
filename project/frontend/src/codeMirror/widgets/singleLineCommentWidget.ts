import type ICategoryDto from "../../types/dtos/ICategoryDto.ts";
import BaseCommentWidget from "./baseCommentWidget.ts";

/**
 * A CodeMirror widget that displays comments inline with the code
 */
export default class SingleLineCommentWidget extends BaseCommentWidget {
	protected static readonly className = "cm-singleline-comment-widget";
	private content: string;
	private commentId: number;
	private readonly category: ICategoryDto;

	constructor(
		content: string,
		commentId: number,
		category: ICategoryDto[],
		deleteCommentAction: (commentId: number) => Promise<void>,
		editCommentAction: (commentId: number) => Promise<void>
	) {
		super(deleteCommentAction, editCommentAction);
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

		// Create and append edit button
		const editButton = this.createEditButton();
		tools.appendChild(editButton);

		// Create and append delete button
		const deleteButton = this.createDeleteButton();
		tools.appendChild(deleteButton);

		// Create and append content div
		const contentDiv = document.createElement("div");
		contentDiv.className = "comment-content";
		contentDiv.textContent = this.content;

		wrap.appendChild(tools);
		wrap.appendChild(contentDiv);

		return wrap;
	}

	protected override createEditButton(): HTMLButtonElement {
		const editButton = document.createElement("button");
		editButton.classList.add("edit-button");
		editButton.textContent = "Edit";
		editButton.onclick = async () => await this.handleEditComment(this.commentId);
		return editButton;
	}

	protected override createDeleteButton(): HTMLButtonElement {
		const deleteButton = document.createElement("button");
		deleteButton.classList.add("delete-button");
		deleteButton.textContent = "Delete";
		deleteButton.onclick = async () => await this.handleDeleteComment(this.commentId);
		return deleteButton;
	}

	protected override createCategoryLabel(category: ICategoryDto): HTMLSpanElement {
		const label = document.createElement("span");
		label.className = "comment-category comment-category-pill comment-category-blue";
		label.textContent = category.label;
		return label;
	}

	override ignoreEvent() {
		return false;
	}
}
