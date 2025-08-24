using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Mappers;
using server.Models.Categories;
using server.Types.Interfaces;

namespace server.Services
{
	public class CategoryService(ApplicationDbContext context) : ICategoryService
	{
		public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
		{
			try
			{
				IEnumerable<Category> categories = await context.Categories.AsNoTracking().ToListAsync();
				return categories.Select(CategoryMapper.ToDto);
			}
			catch (Exception ex)
			{
				throw new Exception("An error occurred while retrieving categories.", ex);
			}
		}
	}
}
