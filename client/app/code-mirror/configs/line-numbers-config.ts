import type { EditorState } from "@codemirror/state";
import type CommentDto from "../../../../base/app/types/dtos/comment-dto";
import type { BlockInfo, EditorView } from "@codemirror/view";

/**
 * Configuration for CodeMirror line numbers, which are displayed in the gutter to the left of the editor.
 */
export interface LineNumberConfig {
	formatNumber?: (lineNo: number, state: EditorState) => string;
	domEventHandlers?: {
		[eventName: string]: (view: EditorView, line: BlockInfo, event: Event) => boolean;
	};
}

export const getLineNumbersConfig = (_comments: CommentDto[]): LineNumberConfig => {
	return {
		formatNumber: (lineNo: number, _state: EditorState) => {
			return lineNo.toString();
		},
	};
};
