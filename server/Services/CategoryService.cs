using server.Mappers;
using server.Models.Categories;
using server.Types.Interfaces;
using server.Types.Repositories;

namespace server.Services
{
	/// <summary>
	/// Retrieves comment categories from the repository and maps them to DTOs.
	/// </summary>
	public class CategoryService(ICategoryRepository categoryRepository) : ICategoryService
	{
		/// <inheritdoc />
		public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
		{
			IEnumerable<Category> categories = await categoryRepository.GetAllAsync();
			return categories.Select(CategoryMapper.ToDto);
		}
	}
}
