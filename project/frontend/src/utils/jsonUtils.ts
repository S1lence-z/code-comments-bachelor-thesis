import type ICommentDto from "../../../shared/dtos/ICommentDto";
import jsonldTemplate from "../json/jsonld-template.json";

export const downloadJSON = (data: any, filename: string) => {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

const convertCommentsToJsonLD = (comments: ICommentDto[], repositoryName: string) => {
	const jsonLD = {
		"@context": jsonldTemplate["@context"],
		"@id": `https://example.org/repository/${repositoryName}`,
		"@type": "SoftwareSourceCode",
		name: repositoryName,
		comment: comments.map((comment, index) => ({
			"@id": `https://example.org/repository/${repositoryName}/comment/${comment.id || index}`,
			"@type": "CodeComment",
			hasFilePath: comment.filePath,
			hasContent: comment.content,
			hasCommentType: comment.type,
			...(comment.lineNumber && { hasLineNumber: comment.lineNumber }),
			...(comment.startLineNumber && { hasStartLineNumber: comment.startLineNumber }),
			...(comment.endLineNumber && { hasEndLineNumber: comment.endLineNumber }),
			...(comment.categories &&
				comment.categories.length > 0 && {
					hasCategory: comment.categories.map((category, catIndex) => ({
						"@id": `https://example.org/repository/${repositoryName}/category/${category.id || catIndex}`,
						"@type": "Category",
						label: category.label,
						...(category.description && { description: category.description }),
					})),
				}),
		})),
	};

	return jsonLD;
};

export const downloadJSONLD = (comments: ICommentDto[], repositoryName: string, filename: string) => {
	const jsonLD = convertCommentsToJsonLD(comments, repositoryName);
	const blob = new Blob([JSON.stringify(jsonLD, null, 2)], {
		type: "application/ld+json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

export const parseJSON = <T>(jsonString: string | null): T | null => {
	if (jsonString === null) {
		console.error("JSON string is null");
		return null;
	}

	try {
		return JSON.parse(jsonString) as T;
	} catch (error) {
		console.error("Failed to parse JSON:", error);
		return null;
	}
};
