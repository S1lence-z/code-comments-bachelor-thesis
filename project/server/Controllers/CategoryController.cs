using Microsoft.AspNetCore.Mvc;
using server.Interfaces;
using server.Models.Categories;

namespace server.Controllers
{
	[Route("api/v1/[controller]")]
	[ApiController]
	public class CategoryController(ICategoryService categoryService) : ControllerBase
	{
		[HttpGet]
		public async Task<IActionResult> GetAllCategories()
		{
			try
			{
				IEnumerable<Category> categories = await categoryService.GetAllCategoriesAsync();
				IEnumerable<CategoryDto> categoryDtos = categories.Select(CategoryDto.From);
				return Ok(categoryDtos);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = ex.Message });
			}
		}
	}
}
