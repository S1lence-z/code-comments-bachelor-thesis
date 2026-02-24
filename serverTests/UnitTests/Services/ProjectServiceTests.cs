using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using server.Configs;
using server.Models.Projects;
using server.Models.Projects.DTOs;
using server.Services;
using server.Types.Repositories;

namespace serverTests.UnitTests.Services
{
    public class ProjectServiceTests
    {
        private readonly Mock<IProjectRepository> _projectRepoMock;
        private readonly Mock<ILogger<ProjectService>> _loggerMock;
        private readonly ProjectService _sut;
        private const string BackendUrl = "http://localhost:5000";

        public ProjectServiceTests()
        {
            _projectRepoMock = new Mock<IProjectRepository>();
            _loggerMock = new Mock<ILogger<ProjectService>>();

            var urlSettings = new UrlSettings
            {
                BackendUrl = BackendUrl,
                ManagerUrl = "http://localhost:3001",
                ClientUrl = "http://localhost:3000"
            };
            var urlOptionsMock = new Mock<IOptions<UrlSettings>>();
            urlOptionsMock.Setup(o => o.Value).Returns(urlSettings);

            _sut = new ProjectService(_loggerMock.Object, _projectRepoMock.Object, urlOptionsMock.Object);
        }

        [Fact]
        public async Task GetAllProjects_ReturnsMappedDtos()
        {
            // Arrange
            var repository = new Repository
            {
                Id = Guid.NewGuid(),
                RepositoryUrl = "https://github.com/test/repo",
                CommitHash = "abc123"
            };
            var projects = new List<Project>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Name = "Project 1",
                    ServerBaseUrl = BackendUrl,
                    RepositoryId = repository.Id,
                    Repository = repository
                }
            };
            _projectRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(projects);

            // Act
            var result = (await _sut.GetAllProjectsAsync()).ToList();

            // Assert
            Assert.Single(result);
            Assert.Equal("Project 1", result[0].Name);
            Assert.Equal(repository.Id, result[0].Repository.Id);
        }

        [Fact]
        public async Task GetAllProjects_Empty_ReturnsEmptyList()
        {
            // Arrange
            _projectRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Project>());

            // Act
            var result = await _sut.GetAllProjectsAsync();

            // Assert
            Assert.Empty(result);
        }

        [Fact]
        public async Task SetupProject_ValidUrl_CreatesProjectAndRepository()
        {
            // Arrange
            var request = new ProjectSetupRequest
            {
                ServerBaseUrl = BackendUrl,
                RepositoryUrl = "https://github.com/test/repo",
                Name = "New Project",
                Branch = "main",
                CommitHash = "abc123",
                RepositoryType = "github"
            };

            _projectRepoMock
                .Setup(r => r.CreateWithRepositoryAsync(It.IsAny<Project>(), It.IsAny<Repository>()))
                .ReturnsAsync((Project p, Repository r) =>
                {
                    p.Repository = r;
                    return p;
                });

            // Act
            var result = await _sut.SetupProjectAsync(request);

            // Assert
            Assert.Equal("New Project", result.Name);
            Assert.Equal(BackendUrl, result.ServerBaseUrl);
            Assert.Equal("https://github.com/test/repo", result.Repository.RepositoryUrl);
            _projectRepoMock.Verify(r => r.CreateWithRepositoryAsync(
                It.Is<Project>(p => p.Name == "New Project"),
                It.Is<Repository>(r => r.RepositoryUrl == "https://github.com/test/repo")),
                Times.Once);
        }

        [Fact]
        public async Task SetupProject_MismatchedUrl_ThrowsArgumentException()
        {
            // Arrange
            var request = new ProjectSetupRequest
            {
                ServerBaseUrl = "http://wrong-url:9999",
                RepositoryUrl = "https://github.com/test/repo",
                Name = "New Project",
                Branch = "main",
                CommitHash = "abc123"
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(
                () => _sut.SetupProjectAsync(request));
            Assert.Contains("ServerBaseUrl must match the backend URL", ex.Message);
        }

        [Fact]
        public async Task SetupProject_UrlWithTrailingSlash_Succeeds()
        {
            // Arrange
            var request = new ProjectSetupRequest
            {
                ServerBaseUrl = BackendUrl + "/",
                RepositoryUrl = "https://github.com/test/repo",
                Name = "Trailing Slash Project",
                Branch = "main",
                CommitHash = "abc123",
                RepositoryType = "github"
            };

            _projectRepoMock
                .Setup(r => r.CreateWithRepositoryAsync(It.IsAny<Project>(), It.IsAny<Repository>()))
                .ReturnsAsync((Project p, Repository r) =>
                {
                    p.Repository = r;
                    return p;
                });

            // Act
            var result = await _sut.SetupProjectAsync(request);

            // Assert
            Assert.Equal("Trailing Slash Project", result.Name);
            _projectRepoMock.Verify(r => r.CreateWithRepositoryAsync(
                It.IsAny<Project>(), It.IsAny<Repository>()), Times.Once);
        }
    }
}
