import type CategoryDto from "../types/dtos/CategoryDto";

const useCategoryService = () => {
	const getAllCategories = async (backendBaseUrl: string): Promise<CategoryDto[]> => {
		try {
			const response = await fetch(`${backendBaseUrl}/api/v1/category`);
			if (!response.ok) {
				throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
			}
			const categories: CategoryDto[] = await response.json();
			return categories;
		} catch (error) {
			throw error;
		}
	};

	return {
		getAllCategories,
	};
};

export default useCategoryService;
