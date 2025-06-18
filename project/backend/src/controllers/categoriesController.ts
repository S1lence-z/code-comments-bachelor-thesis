import { CategoryDto } from "../models/dtoModels.ts";
import CategoriesService from "../services/categoriesService.ts";

export default class CategoriesController {
	public static getCategories(categoriesService: CategoriesService): CategoryDto[] {
		return categoriesService.getCategories();
	}
}
