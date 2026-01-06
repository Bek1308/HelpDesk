using Abp.Localization;
using Abp.Zero.EntityFrameworkCore;
using HelpDesk.Authorization.Roles;
using HelpDesk.Authorization.Users;
using HelpDesk.BonusSystem;
using HelpDesk.BonusSystem.Lookups;
using HelpDesk.Category;
using HelpDesk.Cities;
using HelpDesk.FaultGroups;
using HelpDesk.Issues;
using HelpDesk.IssuesTypes;
using HelpDesk.MultiTenancy;
using HelpDesk.PriorityLevels;
using HelpDesk.Repairs;
using HelpDesk.Salaries;
using HelpDesk.Services;
using HelpDesk.Statuses;
using HelpDesk.TechDepartment;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.EntityFrameworkCore
{
    public class HelpDeskDbContext : AbpZeroDbContext<Tenant, Role, User, HelpDeskDbContext>
    {
        /* ---------- DbSet-lar ---------- */
        public override DbSet<ApplicationLanguageText> LanguageTexts { get; set; }
        public DbSet<Categories> Categories { get; set; }
        public DbSet<SubCategories> SubCategories { get; set; }
        public DbSet<Issues.Issues> Issues { get; set; }
        public DbSet<CallCenterIssue> CallCenterIssues { get; set; }
        public DbSet<RepairIssue> RepairIssues { get; set; }
        public DbSet<TechDepartmentIssue> TechDepartmentIssues { get; set; }
        public DbSet<ATMIssue> ATMIssues { get; set; }
        public DbSet<PayvandCardIssue> PayvandCardIssues { get; set; }
        public DbSet<PayvandWalletIssue> PayvandWalletIssues { get; set; }

        public DbSet<IssuesHistory> IssuesHistory { get; set; }
        public DbSet<IssuesAssignees> IssuesAssignees { get; set; }
        public DbSet<IssuesObservers> IssuesObservers { get; set; }
        public DbSet<IssuesAdministrators> IssuesAdministrators { get; set; }
        public DbSet<IssuesClaims> IssuesClaims { get; set; }
        public DbSet<IssuesComments> IssuesComments { get; set; }
        public DbSet<IssueTypes> IssueTypes { get; set; }
        public DbSet<IssuesStatuses> IssuesStatuses { get; set; }
        public DbSet<PriorityLevels.PriorityLevels> PriorityLevels { get; set; }
        public DbSet<Services.Services> Services { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<FaultGroup> FaultGroups { get; set; }
        public DbSet<Salary> Salaries { get; set; }

        // Bonus System
        public DbSet<BudgetType> BudgetTypes { get; set; }
        public DbSet<PeriodType> PeriodTypes { get; set; }
        public DbSet<Weekday> Weekdays { get; set; }
        public DbSet<ActionRule> ActionRules { get; set; }
        public DbSet<Bonus> Bonuses { get; set; }
        public DbSet<BonusSystem.BonusSystem> BonusSystems { get; set; }
        public DbSet<BonusSystemUser> BonusSystemUsers { get; set; }
        public DbSet<UserAction> UserActions { get; set; }

        public HelpDeskDbContext(DbContextOptions<HelpDeskDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            #region Abp prefiksini olib tashlash
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                var tableName = entity.GetTableName();
                if (tableName != null && tableName.StartsWith("Abp"))
                {
                    entity.SetTableName(tableName.Substring(3));
                }
            }
            #endregion

            /* ============================================================= */
            /* =======================  Issues  ============================= */
            /* ============================================================= */

            modelBuilder.Entity<Issues.Issues>()
                .HasOne(i => i.CreatorUser)
                .WithMany()
                .HasForeignKey(i => i.ReportedBy)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Issues.Issues>()
                .HasOne(i => i.IssueStatus)
                .WithMany()
                .HasForeignKey(i => i.IssueStatusId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Issues.Issues>()
                .HasOne(i => i.PriorityLevel)
                .WithMany()
                .HasForeignKey(i => i.PriorityId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Issues.Issues>()
                .HasMany(i => i.IssuesAssignees)
                .WithOne(a => a.Issues)
                .HasForeignKey(a => a.IssueId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Issues.Issues>()
                .HasMany(i => i.IssuesObservers)
                .WithOne(o => o.Issues)
                .HasForeignKey(o => o.IssueId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Issues.Issues>()
                .HasMany(i => i.IssuesAdministrators)
                .WithOne(ad => ad.Issues)
                .HasForeignKey(ad => ad.IssueId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Issues.Issues>()
                .HasMany(i => i.IssuesClaims)
                .WithOne(c => c.Issue)
                .HasForeignKey(c => c.IssueId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Issues.Issues>()
                .HasMany(i => i.IssuesComments)
                .WithOne(com => com.Issue)
                .HasForeignKey(com => com.IssueId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CallCenterIssue>()
                .HasOne(c => c.SubCategories)
                .WithMany()
                .HasForeignKey(c => c.SubCategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<CallCenterIssue>()
                .HasOne(c => c.Services)
                .WithMany()
                .HasForeignKey(c => c.ServiceId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<IssuesAssignees>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<IssuesObservers>()
                .HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<IssuesAdministrators>()
                .HasOne(ad => ad.User)
                .WithMany()
                .HasForeignKey(ad => ad.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<IssuesHistory>()
                .HasOne(h => h.Issue)
                .WithMany()
                .HasForeignKey(h => h.IssueId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Issues.IssuesHistory>()
                .HasOne(h => h.CreatedByUser)
                .WithMany()
                .HasForeignKey(h => h.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Issues.Issues>()
                .HasIndex(i => i.IssueCategory);

            modelBuilder.Entity<IssuesHistory>()
                .HasIndex(h => new { h.IssueId, h.FieldName, h.CreationTime });

            modelBuilder.Entity<IssuesAssignees>()
                .HasIndex(a => new { a.IssueId, a.UserId });

            modelBuilder.Entity<IssuesObservers>()
                .HasIndex(o => new { o.IssueId, o.UserId });

            modelBuilder.Entity<IssuesAdministrators>()
                .HasIndex(ad => new { ad.IssueId, ad.UserId });

            modelBuilder.Entity<IssuesClaims>()
                .HasIndex(c => c.IssueId);

            modelBuilder.Entity<IssuesComments>()
                .HasIndex(com => new { com.IssueId, com.CreationTime });

            modelBuilder.Entity<PriorityLevels.PriorityLevels>(b =>
            {
                b.HasIndex(x => x.Percentage).IsUnique();
            });

            /* ============================================================= */
            /* ======================  Bonus System  ======================= */
            /* ============================================================= */

            #region Lookup-лар (BudgetType, PeriodType, Weekday)

            modelBuilder.Entity<BudgetType>(entity =>
            {
                entity.HasOne(d => d.CreatorUser)
                      .WithMany()
                      .HasForeignKey(d => d.CreatorUserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(d => d.LastModifierUser)
                      .WithMany()
                      .HasForeignKey(d => d.LastModifierUserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<PeriodType>(entity =>
            {
                entity.HasOne(d => d.CreatorUser)
                      .WithMany()
                      .HasForeignKey(d => d.CreatorUserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(d => d.LastModifierUser)
                      .WithMany()
                      .HasForeignKey(d => d.LastModifierUserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<Weekday>(entity =>
            {
                entity.HasOne(d => d.CreatorUser)
                      .WithMany()
                      .HasForeignKey(d => d.CreatorUserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(d => d.LastModifierUser)
                      .WithMany()
                      .HasForeignKey(d => d.LastModifierUserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            #endregion

            #region BonusSystem → ActionRule (One-to-Many)

            modelBuilder.Entity<BonusSystem.BonusSystem>(entity =>
            {
                // Lookups
                entity.HasOne(d => d.PeriodType)
                      .WithMany()
                      .HasForeignKey(d => d.PeriodTypeId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(d => d.PeriodStartWeekday)
                      .WithMany()
                      .HasForeignKey(d => d.PeriodStartWeekdayId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(d => d.BudgetType)
                      .WithMany()
                      .HasForeignKey(d => d.BudgetTypeId)
                      .OnDelete(DeleteBehavior.NoAction);

                // Auditing
                entity.HasOne(d => d.CreatorUser)
                      .WithMany()
                      .HasForeignKey(d => d.CreatorUserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(d => d.LastModifierUser)
                      .WithMany()
                      .HasForeignKey(d => d.LastModifierUserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<ActionRule>(entity =>
            {
                // **MUHIM**: to‘liq One-to-Many aloqa
                entity.HasOne(a => a.BonusSystem)
                      .WithMany(bs => bs.ActionRules)   // <-- teskari navigatsiya
                      .HasForeignKey(a => a.BonusSystemId)
                      .OnDelete(DeleteBehavior.Cascade)
                      .HasConstraintName("FK_ActionRule_BonusSystem");

                // Auditing
                entity.HasOne(a => a.CreatorUser)
                      .WithMany()
                      .HasForeignKey(a => a.CreatorUserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(a => a.LastModifierUser)
                      .WithMany()
                      .HasForeignKey(a => a.LastModifierUserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            #endregion

            #region BonusSystemUser

            modelBuilder.Entity<BonusSystemUser>(entity =>
            {
                entity.HasOne(bsu => bsu.BonusSystem)
                      .WithMany()
                      .HasForeignKey(bsu => bsu.BonusSystemId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(bsu => bsu.User)
                      .WithMany()
                      .HasForeignKey(bsu => bsu.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(bsu => bsu.CreatorUser)
                      .WithMany()
                      .HasForeignKey(bsu => bsu.CreatorUserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(bsu => bsu.LastModifierUser)
                      .WithMany()
                      .HasForeignKey(bsu => bsu.LastModifierUserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            #endregion

            #region Bonus

            modelBuilder.Entity<Bonus>(entity =>
            {
                entity.HasOne(b => b.User)
                      .WithMany()
                      .HasForeignKey(b => b.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(b => b.BonusSystem)
                      .WithMany()
                      .HasForeignKey(b => b.BonusSystemId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(b => b.CreatorUser)
                      .WithMany()
                      .HasForeignKey(b => b.CreatorUserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(b => b.LastModifierUser)
                      .WithMany()
                      .HasForeignKey(b => b.LastModifierUserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            #endregion

            #region UserAction

            modelBuilder.Entity<UserAction>(entity =>
            {
                entity.HasOne(ua => ua.User)
                      .WithMany()
                      .HasForeignKey(ua => ua.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(ua => ua.ActionRule)
                      .WithMany()
                      .HasForeignKey(ua => ua.ActionRuleId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ua => ua.CreatorUser)
                      .WithMany()
                      .HasForeignKey(ua => ua.CreatorUserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(ua => ua.LastModifierUser)
                      .WithMany()
                      .HasForeignKey(ua => ua.LastModifierUserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            #endregion
        }
    }
}