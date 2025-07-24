import type ICommentDto from "../../../shared/dtos/ICommentDto";
import type ICategoryDto from "../../../shared/dtos/ICategoryDto";
import { transformCommentsToJsonLd, transformCategoriesToJsonLd, type JsonLdOptions } from "./jsonLdTransformers";

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

export const downloadJSONLD = (comments: ICommentDto[], repositoryName: string, filename: string) => {
	const jsonLdOptions: JsonLdOptions = {
		baseUrl: "https://example.org",
	};

	const jsonLD = transformCommentsToJsonLd(comments, repositoryName, jsonLdOptions);

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

export const downloadCategoriesAsJSONLD = (categories: ICategoryDto[], filename: string) => {
	const jsonLdOptions: JsonLdOptions = {
		baseUrl: "https://example.org",
	};

	const jsonLD = transformCategoriesToJsonLd(categories, jsonLdOptions);

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
