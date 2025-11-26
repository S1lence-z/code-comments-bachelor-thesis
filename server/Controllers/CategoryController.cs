using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models.Categories;
using server.Types.Interfaces;

namespace server.Controllers
{
	[Route("api/v1/[controller]")]
	[ApiController]
	public class CategoryController(ICategoryService categoryService) : ControllerBase
	{
		[HttpGet]
		[AllowAnonymous]
		public async Task<IActionResult> GetAllCategories()
		{
			IEnumerable<CategoryDto> categoryDtos = await categoryService.GetAllCategoriesAsync();
			return Ok(categoryDtos);
		}
	}
}
