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
		public DbSet<SinglelineLocation> SinglelineLocations { get; set; }
		public DbSet<MultilineLocation> MultilineLocations { get; set; }
		public DbSet<FileLocation> FileLocations { get; set; }
		public DbSet<ProjectLocation> ProjectLocations { get; set; }
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
					Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
					Label = "Bug",
					Description = "A bug in the code"
				},
				new Category
				{
					Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
					Label = "Feature Request",
					Description = "A request for a new feature"
				},
				new Category
				{
					Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
					Label = "Documentation",
					Description = "Issues related to documentation"
				},
				new Category
				{
					Id = Guid.Parse("00000000-0000-0000-0000-000000000004"),
					Label = "Question",
					Description = "A question about the code or project"
				},
				new Category
				{
					Id = Guid.Parse("00000000-0000-0000-0000-000000000005"),
					Label = "Enhancement",
					Description = "An enhancement to existing functionality"
				},
				new Category
				{
					Id = Guid.Parse("00000000-0000-0000-0000-000000000006"),
					Label = "Performance",
					Description = "Performance-related issues or improvements"
				},
				new Category
				{
					Id = Guid.Parse("00000000-0000-0000-0000-000000000007"),
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
				entity.Property(e => e.ReadWriteApiUrl).IsRequired();
				entity.Property(e => e.ServerBaseUrl).IsRequired();
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
					.HasDefaultValue(RepositoryType.github)
					.HasConversion<string>();
				entity.Property(e => e.RepositoryUrl).IsRequired();
				entity.Property(e => e.Branch).IsRequired().HasDefaultValue("main");
				entity.Property(e => e.CommitHash).IsRequired();
			});
		}

		private static void SetupLocations(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Location>().ToTable("Locations");
			modelBuilder.Entity<SinglelineLocation>().ToTable("SinglelineLocations");
			modelBuilder.Entity<MultilineLocation>().ToTable("MultilineLocations");
			modelBuilder.Entity<FileLocation>().ToTable("FileLocations");
			modelBuilder.Entity<ProjectLocation>().ToTable("ProjectLocations");
		}

		private static void SetupComments(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Comment>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Content).IsRequired();
				entity.Property(e => e.Type).IsRequired()
					.HasConversion<string>();
				entity.Property(e => e.Depth).IsRequired().HasDefaultValue(0);
				entity.Property(e => e.CreatedAt).IsRequired();
				entity.HasOne(e => e.Project)
					.WithMany()
					.HasForeignKey(e => e.ProjectId)
					.OnDelete(DeleteBehavior.Cascade);
				entity.HasOne(e => e.Location)
					.WithOne()
					.HasForeignKey<Comment>(e => e.LocationId)
					.OnDelete(DeleteBehavior.Cascade);
				entity.HasOne(e => e.Category)
					.WithMany()
					.HasForeignKey(e => e.CategoryId)
					.OnDelete(DeleteBehavior.SetNull);

				// Parent comment relationship
				entity.HasOne(e => e.ParentComment)
					.WithMany(e => e.DirectReplies)
					.HasForeignKey(e => e.ParentCommentId)
					.OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete loops

				// Root comment relationship
				entity.HasOne(e => e.RootComment)
					.WithMany(e => e.ThreadReplies)
					.HasForeignKey(e => e.RootCommentId)
					.OnDelete(DeleteBehavior.Cascade);

				// Indices for performance
				entity.HasIndex(e => e.RootCommentId);
				entity.HasIndex(e => new { e.ProjectId, e.RootCommentId });
				entity.HasIndex(e => e.CreatedAt);
			});
		}
	}
}
