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

	toDOM() {
		const wrap = document.createElement("div");
		wrap.className = SingleLineCommentWidget.className;
		wrap.textContent = this.content;
		return wrap;
	}

	override ignoreEvent() {
		return false;
	}
}
