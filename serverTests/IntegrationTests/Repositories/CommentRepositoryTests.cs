using server.Data.Repositories;
using server.Models.Comments;
using server.Models.Locations;
using server.Types.Enums;
using serverTests.Fixtures;

namespace serverTests.IntegrationTests.Repositories
{
    public class CommentRepositoryTests : IDisposable
    {
        private readonly TestDatabaseFixture _fixture;
        private readonly CommentRepository _sut;

        public CommentRepositoryTests()
        {
            _fixture = new TestDatabaseFixture();
            _sut = new CommentRepository(_fixture.Context);
        }

        public void Dispose() => _fixture.Dispose();

        #region GetAllByProjectIdAsync

        [Fact]
        public async Task GetAllByProjectId_ReturnsOnlyRootComments()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();
            var root = await _fixture.SeedCommentAsync(project.Id, content: "Root");
            await _fixture.SeedCommentAsync(project.Id, content: "Reply",
                rootCommentId: root.Id, parentCommentId: root.Id, depth: 1);

            // Act
            var result = (await _sut.GetAllByProjectIdAsync(project.Id)).ToList();

            // Assert
            Assert.Single(result);
            Assert.Equal("Root", result[0].Content);
        }

        [Fact]
        public async Task GetAllByProjectId_OrdersByCreatedAtDescending()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();
            await _fixture.SeedCommentAsync(project.Id, content: "Older",
                createdAt: DateTime.UtcNow.AddHours(-2));
            await _fixture.SeedCommentAsync(project.Id, content: "Newer",
                createdAt: DateTime.UtcNow.AddHours(-1));

            // Act
            var result = (await _sut.GetAllByProjectIdAsync(project.Id)).ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Newer", result[0].Content);
            Assert.Equal("Older", result[1].Content);
        }

        [Fact]
        public async Task GetAllByProjectId_IncludesRelationsAndReplies()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();
            var categoryId = Guid.Parse("00000000-0000-0000-0000-000000000001"); // seeded "Bug"
            var root = await _fixture.SeedCommentAsync(project.Id, categoryId: categoryId, content: "Root");
            await _fixture.SeedCommentAsync(project.Id, content: "Reply",
                rootCommentId: root.Id, parentCommentId: root.Id, depth: 1);

            // Act
            var result = (await _sut.GetAllByProjectIdAsync(project.Id)).ToList();

            // Assert
            var rootComment = result[0];
            Assert.NotNull(rootComment.Project);
            Assert.NotNull(rootComment.Project.Repository);
            Assert.NotNull(rootComment.Location);
            Assert.NotNull(rootComment.Category);
            Assert.Equal("Bug", rootComment.Category.Label);
            Assert.Single(rootComment.ThreadReplies);
        }

        [Fact]
        public async Task GetAllByProjectId_WrongProject_ReturnsEmpty()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();
            await _fixture.SeedCommentAsync(project.Id);

            // Act
            var result = await _sut.GetAllByProjectIdAsync(Guid.NewGuid());

            // Assert
            Assert.Empty(result);
        }

        #endregion

        #region GetByIdAsync

        [Fact]
        public async Task GetByIdAsync_ExistingComment_ReturnsWithRelations()
        {
            // Arrange
            string testContent = "Test content";
			var (project, _) = await _fixture.SeedProjectAsync();
            var comment = await _fixture.SeedCommentAsync(project.Id, content: testContent);

            // Act
            var result = await _sut.GetByIdAsync(comment.Id, project.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(testContent, result.Content);
            Assert.NotNull(result.Project);
            Assert.NotNull(result.Location);
        }

        [Fact]
        public async Task GetByIdAsync_NonExistent_ReturnsNull()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();

            // Act
            var result = await _sut.GetByIdAsync(Guid.NewGuid(), project.Id);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByIdAsync_WrongProject_ReturnsNull()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();
            var comment = await _fixture.SeedCommentAsync(project.Id);

            // Act
            var result = await _sut.GetByIdAsync(comment.Id, Guid.NewGuid());

            // Assert
            Assert.Null(result);
        }

        #endregion

        #region GetThreadAsync

        [Fact]
        public async Task GetThreadAsync_ReturnsRootPlusRepliesOrdered()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();
            var root = await _fixture.SeedCommentAsync(project.Id, content: "Root",
                createdAt: DateTime.UtcNow.AddMinutes(-10));
            var reply1 = await _fixture.SeedCommentAsync(project.Id, content: "Reply 1",
                rootCommentId: root.Id, parentCommentId: root.Id, depth: 1,
                createdAt: DateTime.UtcNow.AddMinutes(-5));
            var reply2 = await _fixture.SeedCommentAsync(project.Id, content: "Reply 2",
                rootCommentId: root.Id, parentCommentId: reply1.Id, depth: 2,
                createdAt: DateTime.UtcNow.AddMinutes(-1));

            // Act
            var result = (await _sut.GetThreadAsync(root.Id, project.Id)).ToList();

            // Assert
            Assert.Equal(3, result.Count);
            Assert.Equal("Root", result[0].Content);
            Assert.Equal("Reply 1", result[1].Content);
            Assert.Equal("Reply 2", result[2].Content);
        }

        [Fact]
        public async Task GetThreadAsync_FromReplyId_StillReturnsFullThread()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();
            var root = await _fixture.SeedCommentAsync(project.Id, content: "Root",
                createdAt: DateTime.UtcNow.AddMinutes(-10));
            var reply = await _fixture.SeedCommentAsync(project.Id, content: "Reply",
                rootCommentId: root.Id, parentCommentId: root.Id, depth: 1,
                createdAt: DateTime.UtcNow.AddMinutes(-5));

            // Act — query with the reply's ID, not the root's
            var result = (await _sut.GetThreadAsync(reply.Id, project.Id)).ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Root", result[0].Content);
            Assert.Equal("Reply", result[1].Content);
        }

        [Fact]
        public async Task GetThreadAsync_NonExistent_ReturnsEmpty()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();

            // Act
            var result = await _sut.GetThreadAsync(Guid.NewGuid(), project.Id);

            // Assert
            Assert.Empty(result);
        }

        #endregion

        #region CreateAsync

        [Fact]
        public async Task CreateAsync_PersistsAndReloadsComment()
        {
            // Arrange
            string testContent = "New comment";
			var (project, _) = await _fixture.SeedProjectAsync();
            var location = new SinglelineLocation
            {
                Id = Guid.NewGuid(),
                FilePath = "test.cs",
                LineNumber = 5
            };
            _fixture.Context.Locations.Add(location);
            await _fixture.Context.SaveChangesAsync();

            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                LocationId = location.Id,
                Type = CommentType.Singleline,
                Content = testContent,
                Depth = 0,
                CreatedAt = DateTime.UtcNow
            };

            // Act
            var result = await _sut.CreateAsync(comment);

            // Assert
            Assert.Equal(testContent, result.Content);
            Assert.NotNull(result.Project);
            Assert.NotNull(result.Location);
            Assert.IsType<SinglelineLocation>(result.Location);
        }

        #endregion

        #region UpdateAsync

        [Fact]
        public async Task UpdateAsync_ModifiesAndReloads()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();
            var comment = await _fixture.SeedCommentAsync(project.Id, content: "Original");

            // Reload tracked
            var tracked = await _fixture.Context.Comments.FindAsync(comment.Id);
            tracked!.Content = "Modified";

            // Act
            var result = await _sut.UpdateAsync(tracked);

            // Assert
            Assert.Equal("Modified", result.Content);
        }

        #endregion

        #region DeleteAsync

        [Fact]
        public async Task DeleteAsync_RemovesComment_ReturnsTrue()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();
            var comment = await _fixture.SeedCommentAsync(project.Id);

            var tracked = await _fixture.Context.Comments.FindAsync(comment.Id);

            // Act
            var result = await _sut.DeleteAsync(tracked!);

            // Assert
            Assert.True(result);
            var deleted = await _fixture.Context.Comments.FindAsync(comment.Id);
            Assert.Null(deleted);
        }

        [Fact]
        public async Task DeleteAsync_RootComment_CascadeDeletesReplies()
        {
            // Arrange
            var (project, _) = await _fixture.SeedProjectAsync();
            var root = await _fixture.SeedCommentAsync(project.Id, content: "Root");
            var reply = await _fixture.SeedCommentAsync(project.Id, content: "Reply",
                rootCommentId: root.Id, parentCommentId: root.Id, depth: 1);

            var trackedRoot = await _fixture.Context.Comments.FindAsync(root.Id);

            // Act
            var result = await _sut.DeleteAsync(trackedRoot!);

            // Assert
            Assert.True(result);
            var deletedReply = await _fixture.Context.Comments.FindAsync(reply.Id);
            Assert.Null(deletedReply);
        }

        #endregion
    }
}
