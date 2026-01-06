using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HelpDesk.Migrations
{
    /// <inheritdoc />
    public partial class FixBonusSystemRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActionRules_BonusSystems_BonusSystemId",
                table: "ActionRules");

            migrationBuilder.AddForeignKey(
                name: "FK_ActionRule_BonusSystem",
                table: "ActionRules",
                column: "BonusSystemId",
                principalTable: "BonusSystems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActionRule_BonusSystem",
                table: "ActionRules");

            migrationBuilder.AddForeignKey(
                name: "FK_ActionRules_BonusSystems_BonusSystemId",
                table: "ActionRules",
                column: "BonusSystemId",
                principalTable: "BonusSystems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
