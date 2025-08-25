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
		filePath: comment.filePath,
		content: comment.content,
		commentType: comment.type,
		...(comment.lineNumber && { lineNumber: comment.lineNumber }),
		...(comment.startLineNumber && { startLineNumber: comment.startLineNumber }),
		...(comment.endLineNumber && { endLineNumber: comment.endLineNumber }),
		...(comment.categories &&
			comment.categories.length > 0 && {
				categories: comment.categories.map((cat) => ({
					"@id": `${baseUrl}/category/${cat.id}`,
					"@type": "Category",
					id: cat.id,
					label: cat.label,
					...(cat.description && { description: cat.description }),
				})),
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
