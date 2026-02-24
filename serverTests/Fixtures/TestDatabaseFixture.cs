using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models.Comments;
using server.Models.Locations;
using server.Models.Projects;
using server.Types.Enums;

namespace serverTests.Fixtures
{
    public class TestDatabaseFixture : IDisposable
    {
        private readonly SqliteConnection _connection;
        public ApplicationDbContext Context { get; }

        public TestDatabaseFixture()
        {
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection)
                .Options;

            Context = new ApplicationDbContext(options);
            Context.Database.EnsureCreated();
        }

        public void Dispose()
        {
            Context.Dispose();
            _connection.Dispose();
        }
    }

    public static class TestDatabaseFixtureExtensions
    {
        public static async Task<(Project project, Repository repository)> SeedProjectAsync(
            this TestDatabaseFixture fixture,
            string name = "Test Project",
            string serverBaseUrl = "http://localhost:5000")
        {
            var repository = new Repository
            {
                Id = Guid.NewGuid(),
                RepositoryType = "github",
                RepositoryUrl = "https://github.com/test/repo",
                Branch = "main",
                CommitHash = "abc123"
            };

            var project = new Project
            {
                Id = Guid.NewGuid(),
                Name = name,
                ServerBaseUrl = serverBaseUrl,
                RepositoryId = repository.Id
            };

            fixture.Context.Repositories.Add(repository);
            fixture.Context.Projects.Add(project);
            await fixture.Context.SaveChangesAsync();

            return (project, repository);
        }

        public static async Task<Comment> SeedCommentAsync(
            this TestDatabaseFixture fixture,
            Guid projectId,
            CommentType type = CommentType.Singleline,
            Guid? rootCommentId = null,
            Guid? parentCommentId = null,
            int depth = 0,
            Guid? categoryId = null,
            string content = "Test comment",
            DateTime? createdAt = null)
        {
            Location location = type switch
            {
                CommentType.Singleline => new SinglelineLocation
                {
                    Id = Guid.NewGuid(),
                    FilePath = "test.cs",
                    LineNumber = 10
                },
                CommentType.Multiline => new MultilineLocation
                {
                    Id = Guid.NewGuid(),
                    FilePath = "test.cs",
                    StartLineNumber = 1,
                    EndLineNumber = 10
                },
                CommentType.File => new FileLocation
                {
                    Id = Guid.NewGuid(),
                    FilePath = "test.cs",
                    Description = "File comment"
                },
                CommentType.Project => new ProjectLocation
                {
                    Id = Guid.NewGuid(),
                    FilePath = "",
                    Description = "Project comment"
                },
                _ => throw new ArgumentException("Invalid comment type")
            };

            fixture.Context.Locations.Add(location);

            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                LocationId = location.Id,
                CategoryId = categoryId,
                Type = type,
                Content = content,
                RootCommentId = rootCommentId,
                ParentCommentId = parentCommentId,
                Depth = depth,
                CreatedAt = createdAt ?? DateTime.UtcNow
            };

            fixture.Context.Comments.Add(comment);
            await fixture.Context.SaveChangesAsync();

            return comment;
        }
    }
}
