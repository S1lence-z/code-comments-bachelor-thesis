using server.Models.Categories;

namespace server.Mappers
{
	public static class CategoryMapper
	{
		public static CategoryDto ToDto(Category category)
		{
			return new CategoryDto
			{
				Id = category.Id,
				Label = category.Label,
				Description = category.Description
			};
		}
	}
}
