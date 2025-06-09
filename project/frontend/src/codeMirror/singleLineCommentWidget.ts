import { WidgetType } from "@codemirror/view";
import { inject } from "vue";

/**
 * A CodeMirror widget that displays comments inline with the code
 */
export default class SingleLineCommentWidget extends WidgetType {
	private static readonly className = "cm-singleline-comment-widget";
	private content: string;
	private commentId: number;
	private handleDelete: (commentId: number) => Promise<void>;

	constructor(content: string, commentId: number) {
		super();
		this.content = content;
		this.commentId = commentId;
		this.handleDelete = inject("deleteCommentAndReload") as (
			commentId: number
		) => Promise<void>;
	}

	toDOM() {
		const wrap = document.createElement("div");
		wrap.className = SingleLineCommentWidget.className;

		const tools = document.createElement("div");
		tools.className = "comment-tools";

		const deleteButton = this.createDeleteButton();
		tools.appendChild(deleteButton);

		const contentDiv = document.createElement("div");
		contentDiv.textContent = this.content;

		wrap.appendChild(tools);
		wrap.appendChild(contentDiv);

		return wrap;
	}

	private createDeleteButton(): HTMLButtonElement {
		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.onclick = async () => await this.handleDelete(this.commentId);
		return deleteButton;
	}

	override ignoreEvent() {
		return false;
	}
}
