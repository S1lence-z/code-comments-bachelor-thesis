<script setup lang="ts">
import Button from "../../lib/Button.vue";
import InputArea from "../../lib/InputArea.vue";
import SlideoutPanel from "../../lib/SlideoutPanel.vue";
import { useI18n } from "vue-i18n";
import { computed, reactive, watch, ref, nextTick } from "vue";
import { useProjectDataStore } from "../../stores/projectDataStore";
import { storeToRefs } from "pinia";
import type RawCommentData from "../../types/domain/RawCommentData";
import { CommentType } from "../../types/dtos/CommentType";
import { getCommentLocationInfoByType } from "../../utils/commentUtils";
import { useErrorHandler } from "../../composables/useErrorHandler";

const { t } = useI18n();

interface FormProps {
	isVisible: boolean;
	filePath: string | null;
}

interface FormEmits {
	(event: "update:isVisible", value: boolean): void;
	(event: "submit", payload: RawCommentData): void;
	(event: "delete", commentId: string): void;
	(event: "close"): void;
}

const props = defineProps<FormProps>();
const emit = defineEmits<FormEmits>();

// Stores
const projectDataStore = useProjectDataStore();
const { comments } = storeToRefs(projectDataStore);
const errorHandler = useErrorHandler();

// InputArea ref
const inputAreaRef = ref<InstanceType<typeof InputArea> | null>(null);

const isFileComment = computed(() => {
	return props.filePath !== null;
});

const commentData = reactive<RawCommentData>({
	id: null,
	commentType: isFileComment.value ? CommentType.File : CommentType.Project,
	categoryId: "",
	filePath: props.filePath ?? "",
	content: "",
	startLineNumber: 0,
	endLineNumber: 0,
});

// Computed
const getTitle = computed(() => {
	return commentData.id ? t("commentForm.editComment") : t("commentForm.addComment");
});

const getSubtitle = computed(() => {
	return isFileComment.value
		? getCommentLocationInfoByType(CommentType.File)
		: getCommentLocationInfoByType(CommentType.Project);
});

const handleKeyboardEvent = (event: KeyboardEvent) => {
	if (event.ctrlKey && event.key === "Enter") {
		handleSubmit();
	} else if (event.key === "Escape") {
		handleClose();
	}
};

const handleSubmit = () => {
	if (!commentData.content.trim()) {
		errorHandler.showWarning(t("commentForm.contentRequired"));
		return;
	}
	emit("submit", commentData);
	handleClose();
};

const handleDelete = () => {
	if (!commentData.id) return;
	emit("delete", commentData.id);
	handleClose();
};

const handleClose = () => {
	emit("close");
	emit("update:isVisible", false);
};

watch(
	[() => props.isVisible, () => props.filePath],
	([visible, filePath]) => {
		if (!visible) return;

		// Reset form
		commentData.id = null;
		commentData.content = "";
		commentData.categoryId = "";
		commentData.commentType = filePath !== null ? CommentType.File : CommentType.Project;
		commentData.filePath = filePath ?? "";
		commentData.startLineNumber = 0;
		commentData.endLineNumber = 0;

		// Find existing comment
		const existingComment = comments.value.find((comment) => {
			if (filePath !== null) {
				return comment.type === CommentType.File && comment.location.filePath === filePath;
			} else {
				return comment.type === CommentType.Project;
			}
		});

		// Populate form with existing comment data
		if (existingComment) {
			commentData.id = existingComment.id;
			commentData.commentType = existingComment.type;
			commentData.categoryId = existingComment.category?.id ?? "";
			commentData.filePath = existingComment.location.filePath ?? "";
			commentData.content = existingComment.content;
			commentData.startLineNumber = existingComment.location.startLineNumber ?? 0;
			commentData.endLineNumber = existingComment.location.endLineNumber ?? 0;
		}

		// Focus the input after the DOM updates
		nextTick(() => {
			inputAreaRef.value?.focus();
		});
	},
	{ immediate: true }
);

watch(
	() => props.isVisible,
	(isVisible) => {
		if (isVisible) {
			window.addEventListener("keydown", handleKeyboardEvent);
		} else {
			window.removeEventListener("keydown", handleKeyboardEvent);
		}
	}
);
</script>

<template>
	<SlideoutPanel :title="getTitle" :subtitle="getSubtitle" v-model:isVisible="props.isVisible" class="w-110">
		<div class="flex flex-col space-y-4">
			<InputArea
				ref="inputAreaRef"
				:label="t('commentForm.commentLabel')"
				v-model="commentData.content"
				:placeholder="t('commentForm.commentPlaceholder')"
				:rows="4"
			/>

			<div class="flex justify-end space-x-2">
				<Button
					:label="commentData.id ? t('commentForm.edit') : t('commentForm.save')"
					type="button"
					button-size="medium"
					button-style="primary"
					@click="handleSubmit"
				/>
				<Button
					v-if="commentData.id"
					:label="t('commentForm.delete')"
					type="button"
					button-size="medium"
					button-style="danger"
					@click="handleDelete"
				/>
				<Button
					:label="t('commentForm.cancel')"
					type="button"
					button-size="medium"
					button-style="secondary"
					@click="handleClose"
				/>
			</div>
		</div>
	</SlideoutPanel>
</template>
