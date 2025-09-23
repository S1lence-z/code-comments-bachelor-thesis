using server.Mappers;
using server.Models.Categories;
using server.Types.Interfaces;
using server.Types.Repositories;

namespace server.Services
{
	public class CategoryService(ICategoryRepository repository) : ICategoryService
	{
		public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
		{
			try
			{
				IEnumerable<Category> categories = await repository.GetAllAsync();
				return categories.Select(CategoryMapper.ToDto);
			}
			catch (Exception ex)
			{
				throw new Exception("An error occurred while retrieving categories.", ex);
			}
		}
	}
}
