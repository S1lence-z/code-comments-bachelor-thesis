using server.Mappers;
using server.Models.Categories;
using server.Types.Interfaces;
using server.Types.Repositories;

namespace server.Services
{
	public class CategoryService(ICategoryRepository categoryRepository) : ICategoryService
	{
		public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
		{
			IEnumerable<Category> categories = await categoryRepository.GetAllAsync();
			return categories.Select(CategoryMapper.ToDto);
		}
	}
}
