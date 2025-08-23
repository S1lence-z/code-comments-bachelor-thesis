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
					Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
					Label = "Bug",
					Description = "A bug in the code"
				},
				new Category
				{
					Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
					Label = "Feature Request",
					Description = "A request for a new feature"
				},
				new Category
				{
					Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
					Label = "Documentation",
					Description = "Issues related to documentation"
				},
				new Category
				{
					Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
					Label = "Question",
					Description = "A question about the code or project"
				},
				new Category
				{
					Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
					Label = "Enhancement",
					Description = "An enhancement to existing functionality"
				},
				new Category
				{
					Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
					Label = "Performance",
					Description = "Performance-related issues or improvements"
				},
				new Category
				{
					Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
					Label = "Security",
					Description = "Security vulnerabilities or concerns"
				}
			);
		}
	}
}
