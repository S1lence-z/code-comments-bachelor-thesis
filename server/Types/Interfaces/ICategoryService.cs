using server.Models.Categories;

namespace server.Types.Interfaces
{
	public interface ICategoryService
	{
		Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
	}
}
