using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HelpDesk.Migrations
{
    /// <inheritdoc />
    public partial class AddedNewIssuesCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClientFullName",
                table: "Issues",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Issues",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ATMIssues",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IssuesId = table.Column<long>(type: "bigint", nullable: false),
                    ATMNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IssuingBank = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SubCategoryId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ATMIssues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ATMIssues_Issues_IssuesId",
                        column: x => x.IssuesId,
                        principalTable: "Issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ATMIssues_SubCategories_SubCategoryId",
                        column: x => x.SubCategoryId,
                        principalTable: "SubCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PayvandCardIssues",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IssuesId = table.Column<long>(type: "bigint", nullable: false),
                    WrongNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    RightNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SubCategoryId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayvandCardIssues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PayvandCardIssues_Issues_IssuesId",
                        column: x => x.IssuesId,
                        principalTable: "Issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PayvandCardIssues_SubCategories_SubCategoryId",
                        column: x => x.SubCategoryId,
                        principalTable: "SubCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PayvandWalletIssues",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IssuesId = table.Column<long>(type: "bigint", nullable: false),
                    WrongNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    RightNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SubCategoryId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayvandWalletIssues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PayvandWalletIssues_Issues_IssuesId",
                        column: x => x.IssuesId,
                        principalTable: "Issues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PayvandWalletIssues_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PayvandWalletIssues_SubCategories_SubCategoryId",
                        column: x => x.SubCategoryId,
                        principalTable: "SubCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ATMIssues_IssuesId",
                table: "ATMIssues",
                column: "IssuesId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ATMIssues_SubCategoryId",
                table: "ATMIssues",
                column: "SubCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_PayvandCardIssues_IssuesId",
                table: "PayvandCardIssues",
                column: "IssuesId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PayvandCardIssues_SubCategoryId",
                table: "PayvandCardIssues",
                column: "SubCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_PayvandWalletIssues_IssuesId",
                table: "PayvandWalletIssues",
                column: "IssuesId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PayvandWalletIssues_ServiceId",
                table: "PayvandWalletIssues",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_PayvandWalletIssues_SubCategoryId",
                table: "PayvandWalletIssues",
                column: "SubCategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ATMIssues");

            migrationBuilder.DropTable(
                name: "PayvandCardIssues");

            migrationBuilder.DropTable(
                name: "PayvandWalletIssues");

            migrationBuilder.DropColumn(
                name: "ClientFullName",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Issues");
        }
    }
}
