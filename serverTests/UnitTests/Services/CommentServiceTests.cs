using Microsoft.Extensions.Logging;
using Moq;
using server.Models.Categories;
using server.Models.Comments;
using server.Models.Locations;
using server.Models.Locations.DTOs;
using server.Models.Projects;
using server.Services;
using server.Types.Enums;
using server.Types.Repositories;

namespace serverTests.UnitTests.Services
{
    public class CommentServiceTests
    {
        private readonly Mock<ICommentRepository> _commentRepoMock;
        private readonly Mock<IProjectRepository> _projectRepoMock;
        private readonly Mock<ILocationRepository> _locationRepoMock;
        private readonly Mock<ICategoryRepository> _categoryRepoMock;
        private readonly Mock<ILogger<CommentService>> _loggerMock;
        private readonly CommentService _sut;

        private readonly Guid _projectId = Guid.NewGuid();
        private readonly Guid _categoryId = Guid.NewGuid();

        public CommentServiceTests()
        {
            _commentRepoMock = new Mock<ICommentRepository>();
            _projectRepoMock = new Mock<IProjectRepository>();
            _locationRepoMock = new Mock<ILocationRepository>();
            _categoryRepoMock = new Mock<ICategoryRepository>();
            _loggerMock = new Mock<ILogger<CommentService>>();

            _sut = new CommentService(
                _loggerMock.Object,
                _commentRepoMock.Object,
                _projectRepoMock.Object,
                _locationRepoMock.Object,
                _categoryRepoMock.Object);
        }

        private Comment CreateTestComment(
            Guid? id = null,
            Guid? projectId = null,
            CommentType type = CommentType.Singleline,
            string content = "Test content",
            Guid? rootCommentId = null,
            Guid? parentCommentId = null,
            int depth = 0,
            Guid? categoryId = null,
            Location? location = null)
        {
            var loc = location ?? new SinglelineLocation
            {
                Id = Guid.NewGuid(),
                FilePath = "test.cs",
                LineNumber = 10
            };

            var repo = new Repository
            {
                Id = Guid.NewGuid(),
                RepositoryUrl = "https://github.com/test/repo",
                CommitHash = "abc123"
            };

            return new Comment
            {
                Id = id ?? Guid.NewGuid(),
                ProjectId = projectId ?? _projectId,
                LocationId = loc.Id,
                Location = loc,
                CategoryId = categoryId,
                Category = categoryId.HasValue ? new Category { Id = categoryId.Value, Label = "Bug", Description = "A bug" } : null,
                Type = type,
                Content = content,
                RootCommentId = rootCommentId,
                ParentCommentId = parentCommentId,
                Depth = depth,
                CreatedAt = DateTime.UtcNow,
                Project = new Project
                {
                    Id = projectId ?? _projectId,
                    Name = "Test Project",
                    ServerBaseUrl = "http://localhost:5000",
                    Repository = repo,
                    RepositoryId = repo.Id
                },
                ThreadReplies = []
            };
        }

        #region GetAllCommentsForProjectAsync

        [Fact]
        public async Task GetAllComments_ReturnsAllRootComments()
        {
            // Arrange
            var comments = new List<Comment>
            {
                CreateTestComment(content: "First"),
                CreateTestComment(content: "Second")
            };
            _commentRepoMock.Setup(r => r.GetAllByProjectIdAsync(_projectId)).ReturnsAsync(comments);

            // Act
            var result = (await _sut.GetAllCommentsForProjectAsync(_projectId)).ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("First", result[0].Content);
            Assert.Equal("Second", result[1].Content);
        }

        [Fact]
        public async Task GetAllComments_EmptyProject_ReturnsEmptyList()
        {
            // Arrange
            _commentRepoMock.Setup(r => r.GetAllByProjectIdAsync(_projectId)).ReturnsAsync(new List<Comment>());

            // Act
            var result = await _sut.GetAllCommentsForProjectAsync(_projectId);

            // Assert
            Assert.Empty(result);
        }

        #endregion

        #region GetCommentByIdAsync

        [Fact]
        public async Task GetCommentById_ExistingComment_ReturnsDto()
        {
            // Arrange
            var commentId = Guid.NewGuid();
            var comment = CreateTestComment(id: commentId);
            _commentRepoMock.Setup(r => r.GetByIdAsync(commentId, _projectId, false)).ReturnsAsync(comment);

            // Act
            var result = await _sut.GetCommentByIdAsync(_projectId, commentId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(commentId, result.Id);
            Assert.Equal("Test content", result.Content);
        }

        [Fact]
        public async Task GetCommentById_NonExistent_ReturnsNull()
        {
            // Arrange
            var commentId = Guid.NewGuid();
            _commentRepoMock.Setup(r => r.GetByIdAsync(commentId, _projectId, false)).ReturnsAsync((Comment?)null);

            // Act
            var result = await _sut.GetCommentByIdAsync(_projectId, commentId);

            // Assert
            Assert.Null(result);
        }

        #endregion

        #region GetThreadAsync

        [Fact]
        public async Task GetThread_ExistingThread_ReturnsMappedDtos()
        {
            // Arrange
            var rootId = Guid.NewGuid();
            var root = CreateTestComment(id: rootId, content: "Root");
            var reply = CreateTestComment(content: "Reply", rootCommentId: rootId, parentCommentId: rootId, depth: 1);
            var thread = new List<Comment> { root, reply };

            _commentRepoMock.Setup(r => r.GetThreadAsync(rootId, _projectId)).ReturnsAsync(thread);

            // Act
            var result = (await _sut.GetThreadAsync(_projectId, rootId)).ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Root", result[0].Content);
            Assert.Equal("Reply", result[1].Content);
        }

        [Fact]
        public async Task GetThread_NonExistentThread_ThrowsArgumentException()
        {
            // Arrange
            var rootId = Guid.NewGuid();
            _commentRepoMock.Setup(r => r.GetThreadAsync(rootId, _projectId)).ReturnsAsync(new List<Comment>());

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(
                () => _sut.GetThreadAsync(_projectId, rootId));
            Assert.Contains(rootId.ToString(), ex.Message);
        }

        #endregion

        #region CreateCommentAsync - Root Comments

        [Fact]
        public async Task CreateComment_ValidRootSingleline_CreatesWithCorrectLocation()
        {
            // Arrange
            _projectRepoMock.Setup(r => r.ExistsAsync(_projectId)).ReturnsAsync(true);
            _categoryRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid?>())).ReturnsAsync((Category?)null);
            _locationRepoMock.Setup(r => r.CreateAsync(It.IsAny<Location>()))
                .ReturnsAsync((Location l) => l);
            _commentRepoMock.Setup(r => r.CreateAsync(It.IsAny<Comment>()))
                .ReturnsAsync((Comment c) =>
                {
                    c.Project = new Project
                    {
                        Id = _projectId,
                        Name = "Test",
                        ServerBaseUrl = "http://localhost:5000",
                        Repository = new Repository { Id = Guid.NewGuid(), RepositoryUrl = "url", CommitHash = "hash" }
                    };
                    c.Location = new SinglelineLocation { Id = c.LocationId, FilePath = "test.cs", LineNumber = 42 };
                    return c;
                });

            var dto = new CommentDto
            {
                Type = CommentType.Singleline,
                Content = "Line comment",
                Location = new SinglelineLocationDto { FilePath = "test.cs", LineNumber = 42 }
            };

            // Act
            var result = await _sut.CreateCommentAsync(_projectId, dto);

            // Assert
            Assert.Equal("Line comment", result.Content);
            Assert.Equal(0, result.Depth);
            Assert.Null(result.RootCommentId);
            _locationRepoMock.Verify(r => r.CreateAsync(It.Is<SinglelineLocation>(l => l.LineNumber == 42)), Times.Once);
        }

        [Fact]
        public async Task CreateComment_ValidRootMultiline_CreatesWithCorrectLocation()
        {
            // Arrange
            _projectRepoMock.Setup(r => r.ExistsAsync(_projectId)).ReturnsAsync(true);
            _categoryRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid?>())).ReturnsAsync((Category?)null);
            _locationRepoMock.Setup(r => r.CreateAsync(It.IsAny<Location>()))
                .ReturnsAsync((Location l) => l);
            _commentRepoMock.Setup(r => r.CreateAsync(It.IsAny<Comment>()))
                .ReturnsAsync((Comment c) =>
                {
                    c.Project = new Project
                    {
                        Id = _projectId, Name = "Test", ServerBaseUrl = "http://localhost:5000",
                        Repository = new Repository { Id = Guid.NewGuid(), RepositoryUrl = "url", CommitHash = "hash" }
                    };
                    c.Location = new MultilineLocation { Id = c.LocationId, FilePath = "test.cs", StartLineNumber = 1, EndLineNumber = 10 };
                    return c;
                });

            var dto = new CommentDto
            {
                Type = CommentType.Multiline,
                Content = "Range comment",
                Location = new MultilineLocationDto { FilePath = "test.cs", StartLineNumber = 1, EndLineNumber = 10 }
            };

            // Act
            var result = await _sut.CreateCommentAsync(_projectId, dto);

            // Assert
            Assert.Equal("Range comment", result.Content);
            _locationRepoMock.Verify(r => r.CreateAsync(
                It.Is<MultilineLocation>(l => l.StartLineNumber == 1 && l.EndLineNumber == 10)), Times.Once);
        }

        [Fact]
        public async Task CreateComment_ValidRootFileType_CreatesWithFileLocation()
        {
            // Arrange
            _projectRepoMock.Setup(r => r.ExistsAsync(_projectId)).ReturnsAsync(true);
            _categoryRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid?>())).ReturnsAsync((Category?)null);
            _locationRepoMock.Setup(r => r.CreateAsync(It.IsAny<Location>()))
                .ReturnsAsync((Location l) => l);
            _commentRepoMock.Setup(r => r.CreateAsync(It.IsAny<Comment>()))
                .ReturnsAsync((Comment c) =>
                {
                    c.Project = new Project
                    {
                        Id = _projectId, Name = "Test", ServerBaseUrl = "http://localhost:5000",
                        Repository = new Repository { Id = Guid.NewGuid(), RepositoryUrl = "url", CommitHash = "hash" }
                    };
                    c.Location = new FileLocation { Id = c.LocationId, FilePath = "readme.md", Description = "Review this file" };
                    return c;
                });

            var dto = new CommentDto
            {
                Type = CommentType.File,
                Content = "File comment",
                Location = new FileLocationDto { FilePath = "readme.md", Description = "Review this file" }
            };

            // Act
            var result = await _sut.CreateCommentAsync(_projectId, dto);

            // Assert
            Assert.Equal("File comment", result.Content);
            _locationRepoMock.Verify(r => r.CreateAsync(
                It.Is<FileLocation>(l => l.Description == "Review this file")), Times.Once);
        }

        [Fact]
        public async Task CreateComment_ValidRootProjectType_CreatesWithProjectLocation()
        {
            // Arrange
            _projectRepoMock.Setup(r => r.ExistsAsync(_projectId)).ReturnsAsync(true);
            _categoryRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid?>())).ReturnsAsync((Category?)null);
            _locationRepoMock.Setup(r => r.CreateAsync(It.IsAny<Location>()))
                .ReturnsAsync((Location l) => l);
            _commentRepoMock.Setup(r => r.CreateAsync(It.IsAny<Comment>()))
                .ReturnsAsync((Comment c) =>
                {
                    c.Project = new Project
                    {
                        Id = _projectId, Name = "Test", ServerBaseUrl = "http://localhost:5000",
                        Repository = new Repository { Id = Guid.NewGuid(), RepositoryUrl = "url", CommitHash = "hash" }
                    };
                    c.Location = new ProjectLocation { Id = c.LocationId, FilePath = "", Description = "General feedback" };
                    return c;
                });

            var dto = new CommentDto
            {
                Type = CommentType.Project,
                Content = "Project comment",
                Location = new ProjectLocationDto { FilePath = "", Description = "General feedback" }
            };

            // Act
            var result = await _sut.CreateCommentAsync(_projectId, dto);

            // Assert
            Assert.Equal("Project comment", result.Content);
            _locationRepoMock.Verify(r => r.CreateAsync(
                It.Is<ProjectLocation>(l => l.Description == "General feedback")), Times.Once);
        }

        [Fact]
        public async Task CreateComment_FileTypeWithNullDescription_DefaultsToFileComment()
        {
            // Arrange
            _projectRepoMock.Setup(r => r.ExistsAsync(_projectId)).ReturnsAsync(true);
            _categoryRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid?>())).ReturnsAsync((Category?)null);
            _locationRepoMock.Setup(r => r.CreateAsync(It.IsAny<Location>()))
                .ReturnsAsync((Location l) => l);
            _commentRepoMock.Setup(r => r.CreateAsync(It.IsAny<Comment>()))
                .ReturnsAsync((Comment c) =>
                {
                    c.Project = new Project
                    {
                        Id = _projectId, Name = "Test", ServerBaseUrl = "http://localhost:5000",
                        Repository = new Repository { Id = Guid.NewGuid(), RepositoryUrl = "url", CommitHash = "hash" }
                    };
                    c.Location = new FileLocation { Id = c.LocationId, FilePath = "test.cs", Description = "File Comment" };
                    return c;
                });

            var dto = new CommentDto
            {
                Type = CommentType.File,
                Content = "No desc",
                Location = new FileLocationDto { FilePath = "test.cs", Description = null! }
            };

            // Act
            await _sut.CreateCommentAsync(_projectId, dto);

            // Assert
            _locationRepoMock.Verify(r => r.CreateAsync(
                It.Is<FileLocation>(l => l.Description == "File Comment")), Times.Once);
        }

        [Fact]
        public async Task CreateComment_NonExistentProject_ThrowsArgumentException()
        {
            // Arrange
            _projectRepoMock.Setup(r => r.ExistsAsync(_projectId)).ReturnsAsync(false);

            var dto = new CommentDto
            {
                Type = CommentType.Singleline,
                Content = "Test",
                Location = new SinglelineLocationDto { FilePath = "test.cs", LineNumber = 1 }
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(
                () => _sut.CreateCommentAsync(_projectId, dto));
            Assert.Contains(_projectId.ToString(), ex.Message);
        }

        [Fact]
        public async Task CreateComment_MismatchedTypeAndLocation_ThrowsArgumentException()
        {
            // Arrange
            _projectRepoMock.Setup(r => r.ExistsAsync(_projectId)).ReturnsAsync(true);
            _categoryRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid?>())).ReturnsAsync((Category?)null);

            var dto = new CommentDto
            {
                Type = CommentType.Singleline,
                Content = "Test",
                Location = new MultilineLocationDto { FilePath = "test.cs", StartLineNumber = 1, EndLineNumber = 5 }
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(
                () => _sut.CreateCommentAsync(_projectId, dto));
        }

        #endregion

        #region CreateCommentAsync - Reply Comments

        [Fact]
        public async Task CreateReply_ValidParent_InheritsLocationAndSetsDepth()
        {
            // Arrange
            var parentId = Guid.NewGuid();
            var parentLocation = new SinglelineLocation { Id = Guid.NewGuid(), FilePath = "test.cs", LineNumber = 10 };
            var parentComment = CreateTestComment(id: parentId, location: parentLocation);

            _projectRepoMock.Setup(r => r.ExistsAsync(_projectId)).ReturnsAsync(true);
            _categoryRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid?>())).ReturnsAsync((Category?)null);
            _commentRepoMock.Setup(r => r.GetByIdAsync(parentId, _projectId, false)).ReturnsAsync(parentComment);
            _commentRepoMock.Setup(r => r.CreateAsync(It.IsAny<Comment>()))
                .ReturnsAsync((Comment c) =>
                {
                    c.Project = parentComment.Project;
                    c.Location = parentLocation;
                    return c;
                });

            var dto = new CommentDto
            {
                Type = CommentType.Singleline,
                Content = "Reply content",
                ParentCommentId = parentId
            };

            // Act
            var result = await _sut.CreateCommentAsync(_projectId, dto);

            // Assert
            Assert.Equal(1, result.Depth);
            Assert.Equal(parentId, result.RootCommentId);
            // Location repo should NOT be called for replies (inherits from parent)
            _locationRepoMock.Verify(r => r.CreateAsync(It.IsAny<Location>()), Times.Never);
        }

        [Fact]
        public async Task CreateReply_ToReply_UsesOriginalRootId()
        {
            // Arrange
            var originalRootId = Guid.NewGuid();
            var parentId = Guid.NewGuid();
            var parentComment = CreateTestComment(
                id: parentId,
                rootCommentId: originalRootId,
                parentCommentId: originalRootId,
                depth: 1);

            _projectRepoMock.Setup(r => r.ExistsAsync(_projectId)).ReturnsAsync(true);
            _categoryRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid?>())).ReturnsAsync((Category?)null);
            _commentRepoMock.Setup(r => r.GetByIdAsync(parentId, _projectId, false)).ReturnsAsync(parentComment);
            _commentRepoMock.Setup(r => r.CreateAsync(It.IsAny<Comment>()))
                .ReturnsAsync((Comment c) =>
                {
                    c.Project = parentComment.Project;
                    c.Location = parentComment.Location;
                    return c;
                });

            var dto = new CommentDto
            {
                Type = CommentType.Singleline,
                Content = "Nested reply",
                ParentCommentId = parentId
            };

            // Act
            var result = await _sut.CreateCommentAsync(_projectId, dto);

            // Assert
            Assert.Equal(originalRootId, result.RootCommentId);
            Assert.Equal(2, result.Depth);
        }

        [Fact]
        public async Task CreateReply_NonExistentParent_ThrowsArgumentException()
        {
            // Arrange
            var parentId = Guid.NewGuid();
            _projectRepoMock.Setup(r => r.ExistsAsync(_projectId)).ReturnsAsync(true);
            _categoryRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid?>())).ReturnsAsync((Category?)null);
            _commentRepoMock.Setup(r => r.GetByIdAsync(parentId, _projectId, false)).ReturnsAsync((Comment?)null);

            var dto = new CommentDto
            {
                Type = CommentType.Singleline,
                Content = "Reply",
                ParentCommentId = parentId
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(
                () => _sut.CreateCommentAsync(_projectId, dto));
            Assert.Contains(parentId.ToString(), ex.Message);
        }

        #endregion

        #region UpdateCommentAsync

        [Fact]
        public async Task UpdateComment_ValidData_UpdatesContentAndCategory()
        {
            // Arrange
            var commentId = Guid.NewGuid();
            var existingComment = CreateTestComment(id: commentId, content: "Old content");

            _commentRepoMock.Setup(r => r.GetByIdAsync(commentId, _projectId, true)).ReturnsAsync(existingComment);
            _categoryRepoMock.Setup(r => r.ExistsAsync(_categoryId)).ReturnsAsync(true);
            _commentRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Comment>()))
                .ReturnsAsync((Comment c) => c);

            var dto = new CommentDto
            {
                Content = "Updated content",
                CategoryId = _categoryId,
                Type = CommentType.Singleline
            };

            // Act
            var result = await _sut.UpdateCommentAsync(_projectId, commentId, dto);

            // Assert
            Assert.Equal("Updated content", result.Content);
            Assert.Equal(_categoryId, result.CategoryId);
        }

        [Fact]
        public async Task UpdateComment_NonExistentComment_ThrowsArgumentException()
        {
            // Arrange
            var commentId = Guid.NewGuid();
            _commentRepoMock.Setup(r => r.GetByIdAsync(commentId, _projectId, true)).ReturnsAsync((Comment?)null);

            var dto = new CommentDto { Content = "Updated", Type = CommentType.Singleline };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(
                () => _sut.UpdateCommentAsync(_projectId, commentId, dto));
            Assert.Contains(commentId.ToString(), ex.Message);
        }

        [Fact]
        public async Task UpdateComment_NonExistentCategory_ThrowsArgumentException()
        {
            // Arrange
            var commentId = Guid.NewGuid();
            var existingComment = CreateTestComment(id: commentId);
            var fakeCategoryId = Guid.NewGuid();

            _commentRepoMock.Setup(r => r.GetByIdAsync(commentId, _projectId, true)).ReturnsAsync(existingComment);
            _categoryRepoMock.Setup(r => r.ExistsAsync(fakeCategoryId)).ReturnsAsync(false);

            var dto = new CommentDto
            {
                Content = "Updated",
                CategoryId = fakeCategoryId,
                Type = CommentType.Singleline
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(
                () => _sut.UpdateCommentAsync(_projectId, commentId, dto));
            Assert.Contains(fakeCategoryId.ToString(), ex.Message);
        }

        [Fact]
        public async Task UpdateComment_NullCategory_ClearsCategoryWithoutError()
        {
            // Arrange
            var commentId = Guid.NewGuid();
            var existingComment = CreateTestComment(id: commentId, categoryId: _categoryId);

            _commentRepoMock.Setup(r => r.GetByIdAsync(commentId, _projectId, true)).ReturnsAsync(existingComment);
            _commentRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Comment>()))
                .ReturnsAsync((Comment c) => c);

            var dto = new CommentDto
            {
                Content = "Updated",
                CategoryId = null,
                Type = CommentType.Singleline
            };

            // Act
            var result = await _sut.UpdateCommentAsync(_projectId, commentId, dto);

            // Assert
            Assert.Null(result.CategoryId);
            // Category existence check should NOT be called when CategoryId is null
            _categoryRepoMock.Verify(r => r.ExistsAsync(It.IsAny<Guid>()), Times.Never);
        }

        #endregion

        #region DeleteCommentAsync

        [Fact]
        public async Task DeleteComment_Existing_ReturnsTrue()
        {
            // Arrange
            var commentId = Guid.NewGuid();
            var comment = CreateTestComment(id: commentId);

            _commentRepoMock.Setup(r => r.GetByIdAsync(commentId, _projectId, true)).ReturnsAsync(comment);
            _commentRepoMock.Setup(r => r.DeleteAsync(comment)).ReturnsAsync(true);

            // Act
            var result = await _sut.DeleteCommentAsync(_projectId, commentId);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task DeleteComment_NonExistent_ThrowsArgumentException()
        {
            // Arrange
            var commentId = Guid.NewGuid();
            _commentRepoMock.Setup(r => r.GetByIdAsync(commentId, _projectId, true)).ReturnsAsync((Comment?)null);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(
                () => _sut.DeleteCommentAsync(_projectId, commentId));
            Assert.Contains(commentId.ToString(), ex.Message);
        }

        #endregion
    }
}
