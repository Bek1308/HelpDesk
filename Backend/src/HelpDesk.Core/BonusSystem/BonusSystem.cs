// BonusSystem.cs
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using HelpDesk.Authorization.Users;
using HelpDesk.BonusSystem.Lookups;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.BonusSystem
{
    public class BonusSystem : Entity<long>, IHasCreationTime, IHasModificationTime, IMayHaveTenant
    {
        [StringLength(200)]
        [Column(TypeName = "nvarchar(200)")]
        public string Name { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        public int PeriodTypeId { get; set; }
        public int? PeriodStartDay { get; set; }
        public int? PeriodStartWeekdayId { get; set; }
        public int BudgetTypeId { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal Amount { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }
        public long? CreatorUserId { get; set; }
        public long? LastModifierUserId { get; set; }
        public int? TenantId { get; set; }

        // === Navigatsiya ===
        [ForeignKey("PeriodTypeId")]
        public virtual PeriodType PeriodType { get; set; }

        [ForeignKey("PeriodStartWeekdayId")]
        public virtual Weekday PeriodStartWeekday { get; set; }

        [ForeignKey("BudgetTypeId")]
        public virtual BudgetType BudgetType { get; set; }

        [ForeignKey("CreatorUserId")]
        public virtual User CreatorUser { get; set; }

        [ForeignKey("LastModifierUserId")]
        public virtual User LastModifierUser { get; set; }

        // 1-to-Many — new List<>() kerak
        public virtual ICollection<ActionRule> ActionRules { get; set; } = new List<ActionRule>();
    }
}