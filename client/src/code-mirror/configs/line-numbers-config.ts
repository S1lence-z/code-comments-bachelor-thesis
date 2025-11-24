import type { EditorState } from "@codemirror/state";
import type CommentDto from "../../types/dtos/comment-dto";
import type { BlockInfo, EditorView } from "@codemirror/view";

export interface LineNumberConfig {
	formatNumber?: (lineNo: number, state: EditorState) => string;
	domEventHandlers?: {
		[eventName: string]: (view: EditorView, line: BlockInfo, event: Event) => boolean;
	};
}

export function getLineNumbersConfig(_comments: CommentDto[]): LineNumberConfig {
	return {
		formatNumber: (lineNo: number, _state: EditorState) => {
			return lineNo.toString();
		},
	};
}
