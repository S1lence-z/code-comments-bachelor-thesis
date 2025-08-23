using Microsoft.EntityFrameworkCore;
using server.Models.Categories;

namespace server.Data
{
	public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
	{
		public DbSet<Category> Categories { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);
			SetupCategories(modelBuilder);
		}

		private static void SetupCategories(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Category>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Label).IsRequired();
				entity.Property(e => e.Description).HasMaxLength(500);
			});

			// Seed initial data
			modelBuilder.Entity<Category>().HasData(
				new Category
				{
					Id = Guid.NewGuid(),
					Label = "Bug",
					Description = "A bug in the code"
				},
				new Category
				{
					Id = Guid.NewGuid(),
					Label = "Feature Request",
					Description = "A request for a new feature"
				},
				new Category
				{
					Id = Guid.NewGuid(),
					Label = "Documentation",
					Description = "Issues related to documentation"
				},
				new Category
				{
					Id = Guid.NewGuid(),
					Label = "Question",
					Description = "A question about the code or project"
				},
				new Category
				{
					Id = Guid.NewGuid(),
					Label = "Enhancement",
					Description = "An enhancement to existing functionality"
				},
				new Category
				{
					Id = Guid.NewGuid(),
					Label = "Performance",
					Description = "Performance-related issues or improvements"
				},
				new Category
				{
					Id = Guid.NewGuid(),
					Label = "Security",
					Description = "Security vulnerabilities or concerns"
				}
			);
		}
	}
}
