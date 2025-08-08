import DatabaseManager from "./databaseManager";
import { CategoryDto } from "../models/dtoModels";

class CategoriesService {
	constructor(private dbManager: DatabaseManager) {}

	/**
	 * Get all available categories
	 */
	public getCategories(): CategoryDto[] {
		try {
			const db = this.dbManager.getDb();
			const categoryRows = db
				.prepare(`SELECT identifier as id, label, description FROM categories`)
				.all() as CategoryDto[];

			return categoryRows;
		} catch (error) {
			console.error("Error getting categories:", error);
			throw error;
		}
	}
}

export default CategoriesService;
