using server.Data.Repositories;
using serverTests.Fixtures;

namespace serverTests.IntegrationTests.Repositories
{
    public class CategoryRepositoryTests : IDisposable
    {
        private readonly TestDatabaseFixture _fixture;
        private readonly CategoryRepository _sut;

        public CategoryRepositoryTests()
        {
            _fixture = new TestDatabaseFixture();
            _sut = new CategoryRepository(_fixture.Context);
        }

        public void Dispose() => _fixture.Dispose();

        [Fact]
        public async Task GetAllAsync_ReturnsSeededCategories()
        {
            // Act
            var result = (await _sut.GetAllAsync()).ToList();

            // Assert — 8 categories are seeded in ApplicationDbContext
            Assert.Equal(8, result.Count);
            Assert.Contains(result, c => c.Label == "Bug");
            Assert.Contains(result, c => c.Label == "Uncategorized");
            Assert.Contains(result, c => c.Label == "Security");
        }

        [Fact]
        public async Task GetByIdAsync_ExistingCategory_ReturnsCategory()
        {
            // Arrange — "Bug" category has a known seeded ID
            var bugId = Guid.Parse("00000000-0000-0000-0000-000000000001");

            // Act
            var result = await _sut.GetByIdAsync(bugId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Bug", result.Label);
        }

        [Fact]
        public async Task GetByIdAsync_NullId_ReturnsNull()
        {
            // Act
            var result = await _sut.GetByIdAsync(null);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByIdAsync_NonExistent_ReturnsNull()
        {
            // Act
            var result = await _sut.GetByIdAsync(Guid.NewGuid());

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task ExistsAsync_ExistingCategory_ReturnsTrue()
        {
            // Arrange — seeded "Bug" category
            var bugId = Guid.Parse("00000000-0000-0000-0000-000000000001");

            // Act
            var result = await _sut.ExistsAsync(bugId);

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
