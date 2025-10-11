import { WidgetType } from "@codemirror/view";
import type CategoryDto from "../../types/dtos/CategoryDto.ts";
import { CommentType } from "../../types/enums/CommentType.ts";

export default class CommentFormWidget extends WidgetType {
	private commentId: string | null;
	private commentType: CommentType;
	private initialContent: string;
	private initialCategoryLabel: string;
	private categories: CategoryDto[];
	private filePath: string;
	private startLine: number | null;
	private endLine: number | null;
	private onSubmit: (content: string, categoryLabel: string, commentId: string | null) => Promise<void>;
	private onDelete: (commentId: string) => Promise<void>;
	private onCancel: () => void;
	private showCategorySelect: boolean;

	constructor(
		commentId: string | null,
		commentType: CommentType,
		initialContent: string,
		initialCategoryLabel: string,
		categories: CategoryDto[],
		filePath: string,
		startLine: number | null,
		endLine: number | null,
		onSubmit: (content: string, categoryLabel: string, commentId: string | null) => Promise<void>,
		onCancel: () => void,
		onDelete: (commentId: string) => Promise<void>
	) {
		super();
		this.commentId = commentId;
		this.commentType = commentType;
		this.initialContent = initialContent;
		this.initialCategoryLabel = initialCategoryLabel;
		this.categories = categories;
		this.filePath = filePath;
		this.startLine = startLine;
		this.endLine = endLine;
		this.onCancel = onCancel;
		this.onSubmit = onSubmit;
		this.onDelete = onDelete;
		this.showCategorySelect = commentType !== CommentType.Project && commentType !== CommentType.File;
	}

	toDOM(): HTMLDivElement {
		const wrap = document.createElement("div");
		wrap.className =
			"cm-comment-form-widget shadow-lg backdrop-blur-lg bg-[rgba(255,255,255,0.08)] text-slate-50 py-3.5 px-4 border border-[rgba(255,255,255,0.1)] rounded-xl flex flex-start gap-4 items-start w-3/4 max-w-3xl flex flex-start";

		// Form
		const formContainer = this.createForm();
		wrap.appendChild(formContainer);

		// Info
		const infoAndButtonsContainer = document.createElement("div");
		infoAndButtonsContainer.className = "flex flex-col gap-2";

		infoAndButtonsContainer.appendChild(this.createInfo());
		infoAndButtonsContainer.appendChild(this.createButtonGroup());
		wrap.appendChild(infoAndButtonsContainer);

		return wrap;
	}

	private createForm(): HTMLDivElement {
		const container = document.createElement("div");
		container.className = "cm-comment-form flex flex-col flex-1 gap-2";

		if (this.showCategorySelect) {
			container.appendChild(this.createCategorySelect());
		}
		container.appendChild(this.createContentTextarea());

		return container;
	}

	private createInfo(): HTMLDivElement {
		const container = document.createElement("div");
		container.className = "flex flex-col p-2 gap-1";

		// File name
		const fileName = this.filePath.split("/").pop() || this.filePath;
		const fileDiv = document.createElement("div");
		fileDiv.className = "font-bold text-gray-400 text-base";
		fileDiv.textContent = fileName;
		container.appendChild(fileDiv);

		// Line info
		const lineDiv = document.createElement("div");
		lineDiv.className = "text-gray-400 text-base";

		if (this.commentType === CommentType.Singleline && this.startLine) {
			lineDiv.textContent = `Line ${this.startLine}`;
		} else if (this.commentType === CommentType.Multiline && this.startLine && this.endLine) {
			lineDiv.textContent = `Lines ${this.startLine}-${this.endLine}`;
		} else if (this.commentType === CommentType.File) {
			lineDiv.textContent = "File comment";
		} else if (this.commentType === CommentType.Project) {
			lineDiv.textContent = "Project comment";
		}
		container.appendChild(lineDiv);

		return container;
	}

	private createCategorySelect(): HTMLDivElement {
		const group = document.createElement("div");

		const select = document.createElement("select");
		select.className =
			"comment-form-category-select w-full text-white p-3 border border-gray-600 rounded-md bg-modern-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-modern-blue";

		this.categories.forEach((cat) => {
			const option = document.createElement("option");
			option.value = cat.label;
			option.textContent = cat.label;
			option.selected = cat.label === this.initialCategoryLabel;
			select.appendChild(option);
		});

		group.appendChild(select);
		return group;
	}

	private createContentTextarea(): HTMLDivElement {
		const group = document.createElement("div");

		const textarea = document.createElement("textarea");
		textarea.className =
			"comment-form-content-textarea w-full text-white p-3 border border-gray-600 rounded-md bg-modern-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-modern-blue text-lg";
		textarea.value = this.initialContent;
		textarea.rows = 3;
		textarea.placeholder = "Enter your comment...";

		textarea.addEventListener("keydown", (e) => {
			if (e.ctrlKey && e.key === "Enter") {
				e.preventDefault();
				this.handleSubmit(group.closest(".cm-comment-form-widget") as HTMLElement);
			}
		});

		group.appendChild(textarea);
		return group;
	}

	private createButtonGroup(): HTMLDivElement {
		const group = document.createElement("div");
		group.className = "grid grid-cols-2 gap-2";

		group.appendChild(
			this.createButton(this.commentId ? "Update" : "Save", "primary", () => {
				this.handleSubmit(group.closest(".cm-comment-form-widget") as HTMLElement);
			})
		);

		group.appendChild(this.createButton("Cancel", "secondary", () => this.onCancel()));

		if (this.commentId) {
			group.appendChild(this.createButton("Delete", "danger", () => this.onDelete(this.commentId!)));
		}

		return group;
	}

	private createButton(
		text: string,
		variant: "primary" | "secondary" | "danger",
		onClick: () => void,
		size: "small" | "medium" | "large" = "medium"
	): HTMLButtonElement {
		const btn = document.createElement("button");
		btn.textContent = text;
		btn.className = `btn btn-${variant} btn-${size}`;
		btn.addEventListener("click", onClick);

		return btn;
	}

	private handleSubmit(formElement: HTMLElement): void {
		const textarea = formElement.querySelector(".comment-form-content-textarea") as HTMLTextAreaElement;
		const content = textarea?.value.trim() || "";

		let categoryLabel = this.initialCategoryLabel;
		if (this.showCategorySelect) {
			const select = formElement.querySelector(".comment-form-category-select") as HTMLSelectElement;
			categoryLabel = select?.value || "";

			if (!categoryLabel) {
				alert("Please select a category.");
				return;
			}
		}

		if (!content) {
			alert("Comment cannot be empty.");
			return;
		}

		this.onSubmit(content, categoryLabel, this.commentId);
	}

	// Override to prevent CodeMirror from considering this as editable
	ignoreEvent(): boolean {
		return true;
	}
}
