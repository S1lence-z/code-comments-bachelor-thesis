using Microsoft.EntityFrameworkCore;
using server.Models.Categories;
using server.Models.Projects;
using server.Models.Locations;
using server.Models.Comments;
using server.Types.Enums;

namespace server.Data
{
	public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
	{
		public DbSet<Category> Categories { get; set; }
		public DbSet<Project> Projects { get; set; }
		public DbSet<Repository> Repositories { get; set; }
		public DbSet<Location> Locations { get; set; }
		public DbSet<LineLocation> LineLocations { get; set; }
		public DbSet<LineRange> LineRanges { get; set; }
		public DbSet<OtherLocation> OtherLocations { get; set; }
		public DbSet<Comment> Comments { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);
			SetupCategories(modelBuilder);
			SetupProjects(modelBuilder);
			SetupRepositories(modelBuilder);
			SetupLocations(modelBuilder);
			SetupComments(modelBuilder);
		}

		private static void SeedCategories(ModelBuilder modelBuilder)
		{
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

		private static void SetupCategories(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Category>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Label).IsRequired();
				entity.Property(e => e.Description).HasMaxLength(500);
			});
			SeedCategories(modelBuilder);
		}

		private static void SetupProjects(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Project>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Name).IsRequired();
				entity.Property(e => e.Version).IsRequired().HasDefaultValue("1.0");
				entity.Property(e => e.ReadApiUrl).IsRequired();
				entity.Property(e => e.WriteApiUrl).IsRequired();
				entity.HasOne(e => e.Repository)
					.WithMany()
					.HasForeignKey(e => e.RepositoryId)
					.OnDelete(DeleteBehavior.Cascade);
			});
		}

		private static void SetupRepositories(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Repository>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.RepositoryType).IsRequired()
					.HasDefaultValue(RepositoryType.git)
					.HasConversion<string>();
				entity.Property(e => e.RepositoryUrl).IsRequired();
				entity.Property(e => e.Branch).IsRequired().HasDefaultValue("main");
				entity.Property(e => e.CommitHash).IsRequired();
			});
		}

		private static void SetupLocations(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Location>().ToTable("Locations");
			modelBuilder.Entity<LineLocation>().ToTable("LineLocations");
			modelBuilder.Entity<LineRange>().ToTable("LineRanges");
			modelBuilder.Entity<OtherLocation>().ToTable("OtherLocations");
		}

		private static void SetupComments(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Comment>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Content).IsRequired();
				entity.HasOne(e => e.Project)
					.WithMany()
					.HasForeignKey(e => e.ProjectId)
					.OnDelete(DeleteBehavior.Cascade);
				entity.HasOne(e => e.Location)
					.WithOne()
					.HasForeignKey<Comment>(e => e.LocationId)
					.OnDelete(DeleteBehavior.Cascade);
				entity.HasMany(e => e.Categories)
					.WithMany()
					.UsingEntity(j => j.ToTable("CommentCategories"));
			});
		}
	}
}
