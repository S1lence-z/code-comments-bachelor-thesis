using server.Models.Categories;

namespace server.Types.Interfaces
{
	/// <summary>
	/// Defines the contract for retrieving comment categories.
	/// </summary>
	public interface ICategoryService
	{
		/// <summary>
		/// Returns all available comment categories as DTOs.
		/// </summary>
		Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
	}
}
