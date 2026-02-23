using server.Data.Repositories;
using server.Models.Projects;
using serverTests.Fixtures;

namespace serverTests.IntegrationTests.Repositories
{
    public class ProjectRepositoryTests : IDisposable
    {
        private readonly TestDatabaseFixture _fixture;
        private readonly ProjectRepository _sut;

        public ProjectRepositoryTests()
        {
            _fixture = new TestDatabaseFixture();
            _sut = new ProjectRepository(_fixture.Context);
        }

        public void Dispose() => _fixture.Dispose();

        [Fact]
        public async Task GetAllAsync_ReturnsAllProjectsWithRepositories()
        {
            // Arrange
            await _fixture.SeedProjectAsync("Project A");
            await _fixture.SeedProjectAsync("Project B");

            // Act
            var result = (await _sut.GetAllAsync()).ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.All(result, p => Assert.NotNull(p.Repository));
        }

        [Fact]
        public async Task CreateWithRepositoryAsync_CreatesBothEntities()
        {
            // Arrange
            var repoId = Guid.NewGuid();
            var repository = new Repository
            {
                Id = repoId,
                RepositoryType = "github",
                RepositoryUrl = "https://github.com/test/new-repo",
                Branch = "develop",
                CommitHash = "def456"
            };
            var project = new Project
            {
                Id = Guid.NewGuid(),
                Name = "Created Project",
                ServerBaseUrl = "http://localhost:5000",
                RepositoryId = repoId
            };

            // Act
            var result = await _sut.CreateWithRepositoryAsync(project, repository);

            // Assert
            Assert.Equal("Created Project", result.Name);
            Assert.NotNull(result.Repository);
            Assert.Equal("https://github.com/test/new-repo", result.Repository.RepositoryUrl);
            Assert.Equal("develop", result.Repository.Branch);

            // Verify both are persisted
            var dbProject = await _fixture.Context.Projects.FindAsync(project.Id);
            var dbRepo = await _fixture.Context.Repositories.FindAsync(repoId);
            Assert.NotNull(dbProject);
            Assert.NotNull(dbRepo);
        }

        [Fact]
        public async Task ExistsAsync_ExistingProject_ReturnsTrue()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();

            // Act
            var result = await _sut.ExistsAsync(project.Id);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task ExistsAsync_NonExistent_ReturnsFalse()
        {
            // Act
            var result = await _sut.ExistsAsync(Guid.NewGuid());

            // Assert
            Assert.False(result);
        }
    }
}
