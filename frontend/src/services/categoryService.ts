import type CategoryDto from "../types/dtos/CategoryDto";

export async function getAllCategories(backendBaseUrl: string): Promise<CategoryDto[]> {
	try {
		const response = await fetch(`${backendBaseUrl}/api/v1/category`);
		if (!response.ok) {
			throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
		}
		const categories: CategoryDto[] = await response.json();
		return categories;
	} catch (error) {
		console.error("Error in getAllCategories:", error);
		throw error;
	}
}
