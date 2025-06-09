import { CategoryDto } from "../models/dtoModels.ts";
import DatabaseManager from "../services/databaseManager.ts";

export default class CategoriesController {
	public static getCategories(dbManager: DatabaseManager): CategoryDto[] {
		return dbManager.getCategories();
	}
}
