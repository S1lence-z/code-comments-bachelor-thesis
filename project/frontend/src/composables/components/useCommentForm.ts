import { ref, computed, watch, type Ref } from "vue";
import { storeToRefs } from "pinia";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { useProjectStore } from "../../stores/projectStore";
import type ICommentDto from "../../types/interfaces/ICommentDto";
import type ICategoryDto from "../../types/interfaces/ICategoryDto";
import CommentDto from "../../types/dtos/CommentDto";
import { CommentType } from "../../types/enums/CommentType";

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
}

export function useCommentForm(props: CommentFormProps, emit: CommentFormEmits) {
	// Stores
	const repositoryStore = useRepositoryStore();
	const projectStore = useProjectStore();

	// Store refs
	const { allCategories, comments } = storeToRefs(repositoryStore) as {
		allCategories: Ref<ICategoryDto[]>;
		comments: Ref<ICommentDto[]>;
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

	const isEditMode = computed(() => !!props.commentId);

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

	const createCommentByType = (): ICommentDto | null => {
		const content = commentContent.value.trim();
		const categoryId = allCategories.value.find((cat) => cat.label === commentCategoryLabel.value)?.id || "";
		const commentId = props.commentId?.toString() || null;

		switch (props.commentType) {
			case CommentType.Singleline:
				return CommentDto.Singleline(
					props.commentFilePath || "",
					props.startLineNumber || 0,
					content,
					categoryId,
					commentId
				);
			case CommentType.Multiline:
				return CommentDto.Multiline(
					props.commentFilePath || "",
					props.startLineNumber || 0,
					props.endLineNumber || 0,
					content,
					categoryId,
					commentId
				);
			case CommentType.File:
				return CommentDto.File(props.commentFilePath || "", content, commentId);
			case CommentType.Project:
				return CommentDto.Project(props.commentFilePath || "", content, commentId);
			default:
				return null;
		}
	};

	const handleSubmit = async (): Promise<void> => {
		const validation = validateForm();
		if (!validation.isValid) {
			alert(validation.errorMessage);
			return;
		}

		const commentData = createCommentByType();
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
		isEditMode,
		showCategorySelect,
		availableCategories,

		// Methods
		handleSubmit,
		handleCancel,
		resetForm,
		syncFormWithComment,
		validateForm,
		createCommentByType,
	};
}
