namespace server.Models.Categories
{
	public record class CategoryDto
	{
		public Guid Id { get; set; }

		public string Label { get; set; } = string.Empty;

		public string Description { get; set; } = string.Empty;
	}
}
