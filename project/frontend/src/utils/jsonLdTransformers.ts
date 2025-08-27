import type ICommentDto from "../types/interfaces/ICommentDto";
import type ICategoryDto from "../types/interfaces/ICategoryDto";
import commentContext from "../jsonld/commentContext.json";
import categoryContext from "../jsonld/categoryContext.json";

export interface JsonLdOptions {
	baseUrl?: string;
}

// Transform comments to JSON-LD document
export function transformCommentsToJsonLd(
	comments: ICommentDto[],
	repositoryName: string,
	options: JsonLdOptions = {}
): any {
	const { baseUrl = "https://example.org" } = options;

	const jsonLdComments = comments.map((comment, index) => ({
		"@id": `${baseUrl}/comment/${comment.id || index}`,
		"@type": "CodeComment",
		id: comment.id,
		filePath: comment.location.filePath,
		content: comment.content,
		commentType: comment.type,
		...(comment.location.lineNumber && { lineNumber: comment.location.lineNumber }),
		...(comment.location.startLineNumber && { startLineNumber: comment.location.startLineNumber }),
		...(comment.location.endLineNumber && { endLineNumber: comment.location.endLineNumber }),
		...(comment.category && {
			"@id": `${baseUrl}/category/${comment.category.id}`,
			"@type": "Category",
			id: comment.category.id,
			label: comment.category.label,
			...(comment.category.description && { description: comment.category.description }),
		}),
	}));

	return {
		"@context": commentContext["@context"],
		"@id": `${baseUrl}/repository/${repositoryName}`,
		"@type": "CommentCollection",
		repository: repositoryName,
		totalComments: comments.length,
		comments: jsonLdComments,
	};
}

// Transform categories to JSON-LD document
export function transformCategoriesToJsonLd(categories: ICategoryDto[], options: JsonLdOptions = {}): any {
	const { baseUrl = "https://example.org" } = options;

	const jsonLdCategories = categories.map((category) => ({
		"@id": `${baseUrl}/category/${category.id}`,
		"@type": "Category",
		id: category.id,
		label: category.label,
		...(category.description && { description: category.description }),
	}));

	return {
		"@context": categoryContext["@context"],
		"@graph": jsonLdCategories,
	};
}
