using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace server.Migrations.Pgsql
{
    /// <inheritdoc />
    public partial class InitPgsql : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Location",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Location", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Repository",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RepositoryType = table.Column<string>(type: "text", nullable: false, defaultValue: "github"),
                    RepositoryUrl = table.Column<string>(type: "text", nullable: false),
                    Branch = table.Column<string>(type: "text", nullable: false, defaultValue: "main"),
                    CommitHash = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Repository", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FileLocation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileLocation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FileLocation_Location_Id",
                        column: x => x.Id,
                        principalTable: "Location",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MultilineLocation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StartLineNumber = table.Column<int>(type: "integer", nullable: false),
                    EndLineNumber = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MultilineLocation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MultilineLocation_Location_Id",
                        column: x => x.Id,
                        principalTable: "Location",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectLocation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectLocation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectLocation_Location_Id",
                        column: x => x.Id,
                        principalTable: "Location",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SinglelineLocation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SinglelineLocation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SinglelineLocation_Location_Id",
                        column: x => x.Id,
                        principalTable: "Location",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Project",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<string>(type: "text", nullable: false, defaultValue: "1.0"),
                    ServerBaseUrl = table.Column<string>(type: "text", nullable: false),
                    RepositoryId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Project", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Project_Repository_RepositoryId",
                        column: x => x.RepositoryId,
                        principalTable: "Repository",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Comment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    RootCommentId = table.Column<Guid>(type: "uuid", nullable: true),
                    ParentCommentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Depth = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comment_Category_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Category",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Comment_Comment_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalTable: "Comment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Comment_Comment_RootCommentId",
                        column: x => x.RootCommentId,
                        principalTable: "Comment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comment_Location_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Location",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comment_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Category",
                columns: new[] { "Id", "Description", "Label" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), "A bug in the code", "Bug" },
                    { new Guid("00000000-0000-0000-0000-000000000002"), "A request for a new feature", "Feature Request" },
                    { new Guid("00000000-0000-0000-0000-000000000003"), "Issues related to documentation", "Documentation" },
                    { new Guid("00000000-0000-0000-0000-000000000004"), "A question about the code or project", "Question" },
                    { new Guid("00000000-0000-0000-0000-000000000005"), "An enhancement to existing functionality", "Enhancement" },
                    { new Guid("00000000-0000-0000-0000-000000000006"), "Performance-related issues or improvements", "Performance" },
                    { new Guid("00000000-0000-0000-0000-000000000007"), "Security vulnerabilities or concerns", "Security" },
                    { new Guid("00000000-0000-0000-0000-000000000067"), "Default category", "Uncategorized" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comment_CategoryId",
                table: "Comment",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_CreatedAt",
                table: "Comment",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_LocationId",
                table: "Comment",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_ParentCommentId",
                table: "Comment",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_ProjectId_RootCommentId",
                table: "Comment",
                columns: new[] { "ProjectId", "RootCommentId" });

            migrationBuilder.CreateIndex(
                name: "IX_Comment_RootCommentId",
                table: "Comment",
                column: "RootCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Project_RepositoryId",
                table: "Project",
                column: "RepositoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comment");

            migrationBuilder.DropTable(
                name: "FileLocation");

            migrationBuilder.DropTable(
                name: "MultilineLocation");

            migrationBuilder.DropTable(
                name: "ProjectLocation");

            migrationBuilder.DropTable(
                name: "SinglelineLocation");

            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropTable(
                name: "Project");

            migrationBuilder.DropTable(
                name: "Location");

            migrationBuilder.DropTable(
                name: "Repository");
        }
    }
}
