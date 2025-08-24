namespace server.Models.Categories
{
	public class CategoryDto
	{
		public Guid Id { get; set; }

		public string Label { get; set; } = string.Empty;

		public string Description { get; set; } = string.Empty;

		public static CategoryDto From(Category category)
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
