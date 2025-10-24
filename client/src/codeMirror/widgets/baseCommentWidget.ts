// TODO: Implement depth-based indentation for replies visualization

import { WidgetType } from "@codemirror/view";
import type CategoryDto from "../../types/dtos/CategoryDto.ts";
import type CommentDto from "../../types/dtos/CommentDto.ts";

export default abstract class BaseCommentWidget extends WidgetType {
	protected handleDeleteComment: (commentId: string) => void;
	protected handleEditComment: (commentId: string) => void;
	protected handleReplyComment: (commentId: string) => void;
	protected content: string;
	protected commentId: string;
	protected category: CategoryDto;
	protected isCompact: boolean;
	protected replies: CommentDto[];

	constructor(
		content: string,
		commentId: string,
		category: CategoryDto | null,
		isCompact: boolean,
		replies: CommentDto[],
		handleDeleteComment: (commentId: string) => void,
		handleEditComment: (commentId: string) => void,
		handleReplyComment: (commentId: string) => void
	) {
		super();
		this.content = content;
		this.commentId = commentId;
		this.category = category ?? { id: "", label: "Uncategorized", description: "Uncategorized Comment" };
		this.isCompact = isCompact;
		this.replies = replies;
		this.handleDeleteComment = handleDeleteComment;
		this.handleEditComment = handleEditComment;
		this.handleReplyComment = handleReplyComment;
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

		// Add replies if they exist
		if (this.replies && this.replies.length > 0) {
			const repliesContainer = this.createRepliesContainer();
			wrap.appendChild(repliesContainer);
		}

		return wrap;
	}

	protected createCompactModal(): HTMLDivElement {
		const wrap = document.createElement("div");
		wrap.className = `cm-comment-widget compact ${this.getWidgetTypeClass()}`;

		const header = document.createElement("div");
		header.className = "compact-header";

		const categoryLabel = this.createCategoryLabel(this.category);
		const contentDiv = this.createContentDiv();
		const replyButton = this.createReplyButton();
		const editButton = this.createEditButton();
		const deleteButton = this.createDeleteButton();

		header.appendChild(categoryLabel);
		header.appendChild(contentDiv);
		header.appendChild(replyButton);
		header.appendChild(editButton);
		header.appendChild(deleteButton);

		wrap.appendChild(header);

		// Add replies if they exist - same for both compact and non-compact
		if (this.replies && this.replies.length > 0) {
			const repliesContainer = this.createRepliesContainer();
			wrap.appendChild(repliesContainer);
		}

		return wrap;
	}

	protected createCommentTools(): HTMLDivElement {
		const tools = document.createElement("div");
		tools.className = "comment-tools";

		// Create and append category label
		const categoryLabel = this.createCategoryLabel(this.category);
		tools.appendChild(categoryLabel);

		// Create and append reply button if handler is provided
		const replyButton = this.createReplyButton();
		tools.appendChild(replyButton);

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

		editButton.onclick = () => this.handleEditComment(this.commentId);
		return editButton;
	}

	protected createDeleteButton(): HTMLButtonElement {
		const deleteButton = document.createElement("button");
		deleteButton.classList.add("delete-button");

		const icon = this.createIconElement("mdi:delete");
		deleteButton.appendChild(icon);

		deleteButton.onclick = () => this.handleDeleteComment(this.commentId);
		return deleteButton;
	}

	protected createReplyButton(): HTMLButtonElement {
		const replyButton = document.createElement("button");
		replyButton.classList.add("reply-button");
		const icon = this.createIconElement("mdi:reply");
		replyButton.appendChild(icon);
		replyButton.onclick = () => this.handleReplyComment(this.commentId);
		return replyButton;
	}

	protected createCategoryLabel(category: CategoryDto): HTMLSpanElement {
		const label = document.createElement("span");
		label.className = "comment-category";
		label.textContent = category.label;
		return label;
	}

	protected createRepliesContainer(): HTMLDivElement {
		const container = document.createElement("div");
		container.className = "comment-replies-container";

		// Replies should already be sorted by the server
		for (const reply of this.replies) {
			const replyElement = this.createReplyElement(reply);
			container.appendChild(replyElement);
		}

		return container;
	}

	protected createReplyElement(reply: CommentDto): HTMLDivElement {
		const replyDiv = document.createElement("div");
		replyDiv.className = "comment-reply";

		// Single line layout: category, content, and actions all in one row
		const replyLine = document.createElement("div");
		replyLine.className = "comment-reply-line";

		// Category label
		if (reply.category) {
			const categoryLabel = this.createCategoryLabel(reply.category);
			categoryLabel.className = "comment-category reply-category";
			replyLine.appendChild(categoryLabel);
		}

		// Reply content
		const replyContent = document.createElement("div");
		replyContent.className = "comment-reply-content";
		replyContent.textContent = reply.content;
		replyLine.appendChild(replyContent);

		// Reply actions
		const replyActions = document.createElement("div");
		replyActions.className = "comment-reply-actions";

		const replyButton = this.createReplyButton();
		replyButton.classList.add("small");
		const deleteButton = this.createDeleteButton();
		deleteButton.classList.add("small");

		// Update button handlers to use the reply's ID
		replyButton.onclick = () => this.handleReplyComment(reply.id!);
		deleteButton.onclick = () => this.handleDeleteComment(reply.id!);

		replyActions.appendChild(replyButton);
		replyActions.appendChild(deleteButton);

		replyLine.appendChild(replyActions);

		replyDiv.appendChild(replyLine);

		return replyDiv;
	}

	protected abstract getWidgetTypeClass(): string;
}
