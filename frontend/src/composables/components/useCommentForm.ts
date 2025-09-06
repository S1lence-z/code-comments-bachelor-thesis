import { ref, computed, watch, type Ref } from "vue";
import { storeToRefs } from "pinia";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { useProjectStore } from "../../stores/projectStore";
import type CommentDto from "../../types/dtos/CommentDto";
import type CategoryDto from "../../types/dtos/CategoryDto";
import { CommentType } from "../../types/enums/CommentType";
import { createCommentByType } from "../../utils/commentUtils";

export interface CommentFormProps {
	isVisible: boolean;
	commentFilePath: string | null;
	startLineNumber: number | null;
	endLineNumber: number | null;
	commentId: string | null;
	commentType: CommentType;
}

export interface CommentFormEmits {
	(event: "update:isVisible", value: boolean): void;
	(event: "deleteComment", commentId: string): void;
}

export function useCommentForm(props: CommentFormProps, emit: CommentFormEmits) {
	// Stores
	const repositoryStore = useRepositoryStore();
	const projectStore = useProjectStore();

	// Store refs
	const { allCategories, comments } = storeToRefs(repositoryStore) as {
		allCategories: Ref<CategoryDto[]>;
		comments: Ref<CommentDto[]>;
	};
	const { writeApiUrl } = storeToRefs(projectStore) as {
		writeApiUrl: Ref<string>;
	};

	// Form state
	const commentContent = ref("");
	const commentCategoryLabel = ref("");

	// Computed properties
	const currentComment = computed(() => {
		const existingComment = props.commentId
			? comments.value.find((comment) => comment.id === props.commentId?.toString())
			: null;
		return existingComment || null;
	});

	const showDeleteButton = computed(() => {
		return props.commentId !== null;
	});

	const showCategorySelect = computed(() => {
		return props.commentType !== CommentType.Project && props.commentType !== CommentType.File;
	});

	const availableCategories = computed(() => {
		return allCategories.value.map((cat) => ({ value: cat.label, label: cat.label }));
	});

	// Methods
	const resetForm = (): void => {
		commentContent.value = "";
		commentCategoryLabel.value = "";
	};

	const syncFormWithComment = (): void => {
		if (currentComment.value) {
			commentContent.value = currentComment.value.content || "";
			commentCategoryLabel.value = currentComment.value.category?.label || "";
		} else {
			resetForm();
		}
	};

	const validateForm = (): { isValid: boolean; errorMessage: string } => {
		if (!commentContent.value.trim()) {
			return { isValid: false, errorMessage: "Comment cannot be empty." };
		}

		if (!commentCategoryLabel.value && showCategorySelect.value) {
			return { isValid: false, errorMessage: "Please select a category." };
		}

		return { isValid: true, errorMessage: "" };
	};

	const handleSubmit = async (): Promise<void> => {
		const validation = validateForm();
		if (!validation.isValid) {
			alert(validation.errorMessage);
			return;
		}

		const commentData = createCommentByType(
			props.commentType,
			allCategories.value,
			commentCategoryLabel.value,
			props.commentId,
			commentContent.value,
			props.startLineNumber || 0,
			props.endLineNumber || 0,
			props.commentFilePath || ""
		);
		if (!commentData) {
			alert("Invalid comment type.");
			return;
		}

		try {
			await repositoryStore.upsertCommentAsync(commentData, writeApiUrl.value);
			emit("update:isVisible", false);
		} catch (error) {
			console.error("Failed to save comment:", error);
			alert("Failed to save comment. Please try again.");
		}
	};

	const handleCancel = (): void => {
		emit("update:isVisible", false);
	};

	const handleDelete = (): void => {
		if (props.commentId) {
			emit("deleteComment", props.commentId);
			emit("update:isVisible", false);
		}
	};

	// Watchers
	watch(
		() => props.commentId,
		() => {
			syncFormWithComment();
		},
		{ immediate: true }
	);

	return {
		// Store refs (if needed in template)
		allCategories,
		writeApiUrl,

		// Form state
		commentContent,
		commentCategoryLabel,

		// Computed
		currentComment,
		showDeleteButton,
		showCategorySelect,
		availableCategories,

		// Methods
		handleSubmit,
		handleCancel,
		handleDelete,
		resetForm,
		syncFormWithComment,
		validateForm,
		createCommentByType,
	};
}
