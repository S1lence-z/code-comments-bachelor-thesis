import { WidgetType } from "@codemirror/view";

export default class MultilineCommentWidget extends WidgetType {
	private static readonly className = "cm-multiline-comment-widget";
	content: string;
	startLineNumber: number;
	endLineNumber: number;

	constructor(content: string, startLineNumber: number, endLineNumber: number) {
		if (startLineNumber < 1 || endLineNumber < startLineNumber) {
			throw new Error("Invalid line numbers for multiline comment widget");
		}

		super();
		this.content = content;
		this.startLineNumber = startLineNumber;
		this.endLineNumber = endLineNumber;
	}

	toDOM() {
		const wrap = document.createElement("div");
		wrap.className = MultilineCommentWidget.className;
		wrap.textContent = this.content;
		return wrap;
	}

	override ignoreEvent() {
		return false;
	}
}
