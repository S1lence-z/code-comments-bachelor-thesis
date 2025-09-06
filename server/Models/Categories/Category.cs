using System.ComponentModel.DataAnnotations;

namespace server.Models.Categories
{
	public record class Category
	{
		[Key]
		public Guid Id { get; set; } = Guid.NewGuid();

		[Required]
		public string Label { get; set; } = string.Empty;

		[Required]
		public string Description { get; set; } = string.Empty;
	}
}
