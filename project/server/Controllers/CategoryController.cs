﻿using Microsoft.AspNetCore.Mvc;
using server.Mappers;
using server.Models.Categories;
using server.Types.Interfaces;

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
				IEnumerable<CategoryDto> categoryDtos = await categoryService.GetAllCategoriesAsync();
				return Ok(categoryDtos);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = ex.Message });
			}
		}
	}
}
