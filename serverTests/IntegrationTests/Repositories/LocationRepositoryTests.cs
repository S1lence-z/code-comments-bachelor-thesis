using server.Data.Repositories;
using server.Models.Locations;
using serverTests.Fixtures;

namespace serverTests.IntegrationTests.Repositories
{
    public class LocationRepositoryTests : IDisposable
    {
        private readonly TestDatabaseFixture _fixture;
        private readonly LocationRepository _sut;

        public LocationRepositoryTests()
        {
            _fixture = new TestDatabaseFixture();
            _sut = new LocationRepository(_fixture.Context);
        }

        public void Dispose() => _fixture.Dispose();

        [Fact]
        public async Task CreateAsync_SinglelineLocation_PersistsCorrectly()
        {
            // Arrange
            var location = new SinglelineLocation
            {
                Id = Guid.NewGuid(),
                FilePath = "Program.cs",
                LineNumber = 42
            };

            // Act
            var result = await _sut.CreateAsync(location);

            // Assert
            Assert.Equal(location.Id, result.Id);
            Assert.Equal("Program.cs", result.FilePath);
            Assert.IsType<SinglelineLocation>(result);
            Assert.Equal(42, ((SinglelineLocation)result).LineNumber);
        }

        [Fact]
        public async Task CreateAsync_MultilineLocation_PersistsCorrectly()
        {
            // Arrange
            var location = new MultilineLocation
            {
                Id = Guid.NewGuid(),
                FilePath = "Service.cs",
                StartLineNumber = 10,
                EndLineNumber = 25
            };

            // Act
            var result = await _sut.CreateAsync(location);

            // Assert
            Assert.IsType<MultilineLocation>(result);
            var multiline = (MultilineLocation)result;
            Assert.Equal(10, multiline.StartLineNumber);
            Assert.Equal(25, multiline.EndLineNumber);
        }

        [Fact]
        public async Task CreateAsync_FileLocation_PersistsCorrectly()
        {
            // Arrange
            var location = new FileLocation
            {
                Id = Guid.NewGuid(),
                FilePath = "README.md",
                Description = "Review the readme"
            };

            // Act
            var result = await _sut.CreateAsync(location);

            // Assert
            Assert.IsType<FileLocation>(result);
            Assert.Equal("Review the readme", ((FileLocation)result).Description);
        }

        [Fact]
        public async Task CreateAsync_ProjectLocation_PersistsCorrectly()
        {
            // Arrange
            var location = new ProjectLocation
            {
                Id = Guid.NewGuid(),
                FilePath = "",
                Description = "General project feedback"
            };

            // Act
            var result = await _sut.CreateAsync(location);

            // Assert
            Assert.IsType<ProjectLocation>(result);
            Assert.Equal("General project feedback", ((ProjectLocation)result).Description);
        }
    }
}
