import { WidgetType } from "@codemirror/view";

export default class MultilineCommentWidget extends WidgetType {
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
		wrap.className = "cm-multiline-comment-widget";
        wrap.textContent = this.content;
        wrap.style.gridRowStart = this.startLineNumber.toString();
        wrap.style.gridRowEnd = (this.endLineNumber + 1).toString();
        return wrap;
	}

	override ignoreEvent() {
		return false;
	}
}
