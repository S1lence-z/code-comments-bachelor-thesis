import { WidgetType } from "@codemirror/view";
import type CategoryDto from "../../types/dtos/CategoryDto.ts";

export default abstract class BaseCommentWidget extends WidgetType {
	protected handleDeleteComment: (commentId: string) => Promise<void>;
	protected handleEditComment: (commentId: string) => Promise<void>;
	protected content: string;
	protected commentId: string;
	protected category: CategoryDto;
	protected isCompact: boolean;

	constructor(
		content: string,
		commentId: string,
		category: CategoryDto[],
		isCompact: boolean,
		handleDeleteComment: (commentId: string) => Promise<void>,
		handleEditComment: (commentId: string) => Promise<void>
	) {
		super();
		this.content = content;
		this.commentId = commentId;
		this.category = category[0] || { id: 0, label: "Uncategorized" };
		this.isCompact = isCompact;
		this.handleDeleteComment = handleDeleteComment;
		this.handleEditComment = handleEditComment;
	}

	// Template method pattern
	toDOM(): HTMLDivElement {
		return this.isCompact ? this.createCompactModal() : this.createModal();
	}

	// Create and iconify web component element
	protected createIconElement(iconName: string, size: number = 20): HTMLElement {
		const iconElement = document.createElement("iconify-icon");
		iconElement.setAttribute("icon", iconName);
		iconElement.setAttribute("style", "vertical-align: middle;");
		iconElement.setAttribute("width", size.toString());
		iconElement.setAttribute("height", size.toString());
		return iconElement;
	}

	protected createModal(): HTMLDivElement {
		const wrap = document.createElement("div");
		wrap.className = `cm-comment-widget ${this.getWidgetTypeClass()}`;

		const tools = this.createCommentTools();
		const contentDiv = this.createContentDiv();

		wrap.appendChild(tools);
		wrap.appendChild(contentDiv);

		return wrap;
	}

	protected createCompactModal(): HTMLDivElement {
		const wrap = document.createElement("div");
		wrap.className = `cm-comment-widget compact ${this.getWidgetTypeClass()}`;

		const categoryLabel = this.createCategoryLabel(this.category);
		const contentDiv = this.createContentDiv();
		const editButton = this.createEditButton();
		const deleteButton = this.createDeleteButton();

		wrap.appendChild(categoryLabel);
		wrap.appendChild(contentDiv);
		wrap.appendChild(editButton);
		wrap.appendChild(deleteButton);

		return wrap;
	}

	protected createCommentTools(): HTMLDivElement {
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

		return tools;
	}

	protected createContentDiv(): HTMLDivElement {
		const contentDiv = document.createElement("div");
		contentDiv.className = "comment-content";
		contentDiv.textContent = this.content;
		return contentDiv;
	}

	protected createEditButton(): HTMLButtonElement {
		const editButton = document.createElement("button");
		editButton.classList.add("edit-button");

		const icon = this.createIconElement("mdi:pencil");
		editButton.appendChild(icon);

		editButton.onclick = async () => await this.handleEditComment(this.commentId);
		return editButton;
	}

	protected createDeleteButton(): HTMLButtonElement {
		const deleteButton = document.createElement("button");
		deleteButton.classList.add("delete-button");

		const icon = this.createIconElement("mdi:delete");
		deleteButton.appendChild(icon);

		deleteButton.onclick = async () => await this.handleDeleteComment(this.commentId);
		return deleteButton;
	}

	protected createCategoryLabel(category: CategoryDto): HTMLSpanElement {
		const label = document.createElement("span");
		label.className = "comment-category";
		label.textContent = category.label;
		return label;
	}

	protected abstract getWidgetTypeClass(): string;
}
