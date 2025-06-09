import { WidgetType } from "@codemirror/view";

/**
 * A CodeMirror widget that displays comments inline with the code
 */
export default class SingleLineCommentWidget extends WidgetType {
	content: string;

	constructor(content: string) {
		super();
		this.content = content;
	}

	toDOM() {
		const wrap = document.createElement("div");
		wrap.className = "cm-comment-widget";
		wrap.textContent = this.content;
		return wrap;
	}

	override ignoreEvent() {
		return false;
	}
}
