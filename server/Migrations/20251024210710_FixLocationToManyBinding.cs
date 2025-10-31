using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class FixLocationToManyBinding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Comments_LocationId",
                table: "Comments");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_LocationId",
                table: "Comments",
                column: "LocationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Comments_LocationId",
                table: "Comments");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_LocationId",
                table: "Comments",
                column: "LocationId",
                unique: true);
        }
    }
}
