using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HelpDesk.Migrations
{
    /// <inheritdoc />
    public partial class InitBonusSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BudgetTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetTypes_Users_CreatorUserId",
                        column: x => x.CreatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BudgetTypes_Users_LastModifierUserId",
                        column: x => x.LastModifierUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PeriodTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PeriodTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PeriodTypes_Users_CreatorUserId",
                        column: x => x.CreatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PeriodTypes_Users_LastModifierUserId",
                        column: x => x.LastModifierUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Weekdays",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Weekdays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Weekdays_Users_CreatorUserId",
                        column: x => x.CreatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Weekdays_Users_LastModifierUserId",
                        column: x => x.LastModifierUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "BonusSystems",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PeriodTypeId = table.Column<int>(type: "int", nullable: false),
                    PeriodStartDay = table.Column<int>(type: "int", nullable: true),
                    PeriodStartWeekdayId = table.Column<int>(type: "int", nullable: true),
                    BudgetTypeId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BonusSystems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BonusSystems_BudgetTypes_BudgetTypeId",
                        column: x => x.BudgetTypeId,
                        principalTable: "BudgetTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BonusSystems_PeriodTypes_PeriodTypeId",
                        column: x => x.PeriodTypeId,
                        principalTable: "PeriodTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BonusSystems_Users_CreatorUserId",
                        column: x => x.CreatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BonusSystems_Users_LastModifierUserId",
                        column: x => x.LastModifierUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BonusSystems_Weekdays_PeriodStartWeekdayId",
                        column: x => x.PeriodStartWeekdayId,
                        principalTable: "Weekdays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ActionRules",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BonusSystemId = table.Column<long>(type: "bigint", nullable: false),
                    ActionName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConditionJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Points = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActionRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActionRules_BonusSystems_BonusSystemId",
                        column: x => x.BonusSystemId,
                        principalTable: "BonusSystems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ActionRules_Users_CreatorUserId",
                        column: x => x.CreatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ActionRules_Users_LastModifierUserId",
                        column: x => x.LastModifierUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Bonuses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: true),
                    BonusSystemId = table.Column<long>(type: "bigint", nullable: false),
                    TotalPoints = table.Column<int>(type: "int", nullable: false),
                    BonusAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    ForPeriod = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true),
                    IsPaidFull = table.Column<bool>(type: "bit", nullable: false),
                    LastPaidAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastPaidAmount = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bonuses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bonuses_BonusSystems_BonusSystemId",
                        column: x => x.BonusSystemId,
                        principalTable: "BonusSystems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bonuses_Users_CreatorUserId",
                        column: x => x.CreatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Bonuses_Users_LastModifierUserId",
                        column: x => x.LastModifierUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Bonuses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "BonusSystemUsers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BonusSystemId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BonusSystemUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BonusSystemUsers_BonusSystems_BonusSystemId",
                        column: x => x.BonusSystemId,
                        principalTable: "BonusSystems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BonusSystemUsers_Users_CreatorUserId",
                        column: x => x.CreatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BonusSystemUsers_Users_LastModifierUserId",
                        column: x => x.LastModifierUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BonusSystemUsers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserActions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: true),
                    ActionRuleId = table.Column<long>(type: "bigint", nullable: false),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RealActionId = table.Column<long>(type: "bigint", nullable: true),
                    IsResolved = table.Column<bool>(type: "bit", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserActions_ActionRules_ActionRuleId",
                        column: x => x.ActionRuleId,
                        principalTable: "ActionRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserActions_Users_CreatorUserId",
                        column: x => x.CreatorUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserActions_Users_LastModifierUserId",
                        column: x => x.LastModifierUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserActions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActionRules_BonusSystemId",
                table: "ActionRules",
                column: "BonusSystemId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionRules_CreatorUserId",
                table: "ActionRules",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionRules_LastModifierUserId",
                table: "ActionRules",
                column: "LastModifierUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bonuses_BonusSystemId",
                table: "Bonuses",
                column: "BonusSystemId");

            migrationBuilder.CreateIndex(
                name: "IX_Bonuses_CreatorUserId",
                table: "Bonuses",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bonuses_LastModifierUserId",
                table: "Bonuses",
                column: "LastModifierUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bonuses_UserId",
                table: "Bonuses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BonusSystems_BudgetTypeId",
                table: "BonusSystems",
                column: "BudgetTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_BonusSystems_CreatorUserId",
                table: "BonusSystems",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BonusSystems_LastModifierUserId",
                table: "BonusSystems",
                column: "LastModifierUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BonusSystems_PeriodStartWeekdayId",
                table: "BonusSystems",
                column: "PeriodStartWeekdayId");

            migrationBuilder.CreateIndex(
                name: "IX_BonusSystems_PeriodTypeId",
                table: "BonusSystems",
                column: "PeriodTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_BonusSystemUsers_BonusSystemId",
                table: "BonusSystemUsers",
                column: "BonusSystemId");

            migrationBuilder.CreateIndex(
                name: "IX_BonusSystemUsers_CreatorUserId",
                table: "BonusSystemUsers",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BonusSystemUsers_LastModifierUserId",
                table: "BonusSystemUsers",
                column: "LastModifierUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BonusSystemUsers_UserId",
                table: "BonusSystemUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetTypes_CreatorUserId",
                table: "BudgetTypes",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetTypes_LastModifierUserId",
                table: "BudgetTypes",
                column: "LastModifierUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PeriodTypes_CreatorUserId",
                table: "PeriodTypes",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PeriodTypes_LastModifierUserId",
                table: "PeriodTypes",
                column: "LastModifierUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserActions_ActionRuleId",
                table: "UserActions",
                column: "ActionRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserActions_CreatorUserId",
                table: "UserActions",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserActions_LastModifierUserId",
                table: "UserActions",
                column: "LastModifierUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserActions_UserId",
                table: "UserActions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Weekdays_CreatorUserId",
                table: "Weekdays",
                column: "CreatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Weekdays_LastModifierUserId",
                table: "Weekdays",
                column: "LastModifierUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bonuses");

            migrationBuilder.DropTable(
                name: "BonusSystemUsers");

            migrationBuilder.DropTable(
                name: "UserActions");

            migrationBuilder.DropTable(
                name: "ActionRules");

            migrationBuilder.DropTable(
                name: "BonusSystems");

            migrationBuilder.DropTable(
                name: "BudgetTypes");

            migrationBuilder.DropTable(
                name: "PeriodTypes");

            migrationBuilder.DropTable(
                name: "Weekdays");
        }
    }
}
