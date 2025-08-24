using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using server.Models.Categories;
using server.Models.Locations;
using server.Models.Projects;
using server.Types.Enums;

namespace server.Models.Comments
{
	public record class Comment
	{
		[Key]
		public Guid Id { get; set; }

		[Required]
		public Guid ProjectId { get; set; }
		[ForeignKey("ProjectId")]
		public virtual Project Project { get; set; } = null!;

		[Required]
		public Guid LocationId { get; set; }
		[ForeignKey("LocationId")]
		public virtual Location Location { get; set; } = null!;

		[Required]
		public CommentType Type { get; set; }

		[Required]
		public string Content { get; set; } = string.Empty;

		public ICollection<Category> Categories { get; set; } = [];
	}
}
