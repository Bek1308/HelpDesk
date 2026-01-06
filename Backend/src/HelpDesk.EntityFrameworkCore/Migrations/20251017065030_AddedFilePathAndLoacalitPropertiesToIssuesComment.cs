using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HelpDesk.Migrations
{
    /// <inheritdoc />
    public partial class AddedFilePathAndLoacalitPropertiesToIssuesComment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "IssuesComments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "IssuesComments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Latitude",
                table: "IssuesComments",
                type: "decimal(18,6)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "IssuesComments",
                type: "decimal(18,6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TenantId",
                table: "IssuesComments",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileName",
                table: "IssuesComments");

            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "IssuesComments");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "IssuesComments");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "IssuesComments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "IssuesComments");
        }
    }
}
