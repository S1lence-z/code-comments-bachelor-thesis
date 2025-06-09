import { WidgetType } from "@codemirror/view";

/**
 * A CodeMirror widget that displays comments inline with the code
 */
export default class SingleLineCommentWidget extends WidgetType {
	private static readonly className = "cm-singleline-comment-widget";
	content: string;

	constructor(content: string) {
		super();
		this.content = content;
	}

	private addTools(container: HTMLDivElement) {
		const tools = document.createElement("div");
		tools.className = "comment-tools";
		// Add any tools you want here, e.g., edit, delete buttons
		const editButton = document.createElement("button");
		editButton.textContent = "Edit";
		editButton.onclick = () => {
			console.log("Edit comment:", this.content);
			// Implement edit functionality
		};
		tools.appendChild(editButton);

		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.onclick = () => {
			console.log("Delete comment:", this.content);
			// Implement delete functionality
		};
		tools.appendChild(deleteButton);

		container.appendChild(tools);
	}

	toDOM() {
		const wrap = document.createElement("div");
		wrap.className = SingleLineCommentWidget.className;
		wrap.textContent = this.content;
		this.addTools(wrap);
		return wrap;
	}

	override ignoreEvent() {
		return false;
	}
}
