import { WidgetType } from "@codemirror/view";
import { deleteComment } from "../api/commentsApi";

/**
 * A CodeMirror widget that displays comments inline with the code
 */
export default class SingleLineCommentWidget extends WidgetType {
	private static readonly className = "cm-singleline-comment-widget";
	private content: string;
	private commentId: number;
	private writeApiUrl: string;

	constructor(content: string, commentId: number, writeApiUrl: string) {
		super();
		this.content = content;
		this.commentId = commentId;
		this.writeApiUrl = writeApiUrl;
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
		deleteButton.onclick = async () => {
			await deleteComment(this.writeApiUrl, this.commentId);
		};
		return deleteButton;
	}

	override ignoreEvent() {
		return false;
	}
}
