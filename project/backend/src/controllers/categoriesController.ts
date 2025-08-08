import { CategoryDto } from "../models/dtoModels";
import CategoriesService from "../services/categoriesService";

export default class CategoriesController {
	public static getCategories(categoriesService: CategoriesService): CategoryDto[] {
		return categoriesService.getCategories();
	}
}
