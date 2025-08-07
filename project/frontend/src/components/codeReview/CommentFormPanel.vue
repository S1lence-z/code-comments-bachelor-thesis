<script setup lang="ts">
import type { Ref } from "vue";
import type ICommentDto from "../../../../shared/dtos/ICommentDto";
import SlideoutPanel from "../../lib/SlideoutPanel.vue";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { storeToRefs } from "pinia";
import type ICategoryDto from "../../../../shared/dtos/ICategoryDto";

const repositoryStore = useRepositoryStore();

interface CommentFormPanelProps {
	isVisible: boolean;
	commentFilePath: string | null;
	commentId?: string;
	commentDto?: ICommentDto;
}

const props = withDefaults(defineProps<CommentFormPanelProps>(), {
	isVisible: false,
	commentId: undefined,
	commentDto: undefined,
	filePath: undefined,
});

const emit = defineEmits(["update:isVisible"]);

// Comment categories
const { allCategories } = storeToRefs(repositoryStore) as {
	allCategories: Ref<ICategoryDto[]>;
};
</script>

<template>
	<SlideoutPanel
		:title="(props.commentId ? 'Edit' : 'Add') + ' Comment'"
		subtitle="Please fill in the details below"
		class="comment-form-panel"
		v-model:isVisible="props.isVisible"
	>
		<!-- Comment Add/Edit Form Content -->
	</SlideoutPanel>
</template>
