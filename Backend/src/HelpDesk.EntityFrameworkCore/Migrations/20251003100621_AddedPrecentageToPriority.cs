using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HelpDesk.Migrations
{
    public partial class AddedPrecentageToPriority : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Ustunni qo‘shamiz
            migrationBuilder.AddColumn<int>(
                name: "Percentage",
                table: "PriorityLevels",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // 2. Eski yozuvlarni unique qilish uchun vaqtinchalik yangilab chiqamiz
            migrationBuilder.Sql(@"
                WITH Duplicates AS (
                    SELECT Id, ROW_NUMBER() OVER(ORDER BY Id) AS RowNum
                    FROM PriorityLevels
                )
                UPDATE PriorityLevels
                SET Percentage = (RowNum * 10)  -- har biriga turli foizlar berib chiqamiz (10, 20, 30...)
                FROM PriorityLevels p
                INNER JOIN Duplicates d ON p.Id = d.Id
            ");

            // 3. Endi unique index yaratamiz
            migrationBuilder.CreateIndex(
                name: "IX_PriorityLevels_Percentage",
                table: "PriorityLevels",
                column: "Percentage",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PriorityLevels_Percentage",
                table: "PriorityLevels");

            migrationBuilder.DropColumn(
                name: "Percentage",
                table: "PriorityLevels");
        }
    }
}
