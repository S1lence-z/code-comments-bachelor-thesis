import { EditorView, ViewUpdate, WidgetType, BlockInfo, GutterMarker } from "@codemirror/view";
import { RangeSet } from "@codemirror/state";
import type ICommentDto from "../../types/dtos/ICommentDto";

export interface GutterConfig {
	class?: string;
	renderEmptyElements?: boolean;
	markers?: (view: EditorView) => RangeSet<GutterMarker> | readonly RangeSet<GutterMarker>[];
	lineMarker?: (view: EditorView, line: BlockInfo, otherMarkers: readonly GutterMarker[]) => GutterMarker | null;
	widgetMarker?: (view: EditorView, widget: WidgetType, block: BlockInfo) => GutterMarker | null;
	lineMarkerChange?: (update: ViewUpdate) => boolean;
	initialSpacer?: (view: EditorView) => GutterMarker;
	updateSpacer?: (spacer: GutterMarker, update: ViewUpdate) => GutterMarker;
	domEventHandlers?: {
		[event: string]: (view: EditorView, line: BlockInfo, event: Event) => boolean;
	};
}

export function createGutterConfig(_comments: ICommentDto[]): GutterConfig {
	return {};
}
