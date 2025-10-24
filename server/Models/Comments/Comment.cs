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

		public Guid? CategoryId { get; set; }
		[ForeignKey("CategoryId")]
		public virtual Category? Category { get; set; }

		[Required]
		public CommentType Type { get; set; }

		[Required]
		public string Content { get; set; } = string.Empty;

		// Threading fields
		public Guid? RootCommentId { get; set; }
		[ForeignKey("RootCommentId")]
		public virtual Comment? RootComment { get; set; }

		public Guid? ParentCommentId { get; set; }
		[ForeignKey("ParentCommentId")]
		public virtual Comment? ParentComment { get; set; }

		[Required]
		public int Depth { get; set; } = 0;

		[Required]
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		// Navigation properties
		public virtual ICollection<Comment> DirectReplies { get; set; } = [];

		public virtual ICollection<Comment> ThreadReplies { get; set; } = [];
	}
}
