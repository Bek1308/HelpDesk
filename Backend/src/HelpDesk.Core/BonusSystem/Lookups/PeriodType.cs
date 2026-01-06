using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using HelpDesk.Authorization.Users;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.BonusSystem.Lookups
{
    [Table("PeriodTypes")]
    public class PeriodType : Entity<int>, IHasCreationTime, IHasModificationTime, IMayHaveTenant
    {
        [StringLength(50)]
        [Column(TypeName = "varchar(50)")]
        public string Name { get; set; } // daily, weekly, biweekly, monthly, quarterly, half_yearly, yearly

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        public int Quantity { get; set; } // 1, 2, 3, 6, 12 (oy, hafta, kun)

        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }

        public long? CreatorUserId { get; set; }
        public long? LastModifierUserId { get; set; }

        public int? TenantId { get; set; }

        [ForeignKey("CreatorUserId")]
        public virtual User CreatorUser { get; set; }

        [ForeignKey("LastModifierUserId")]
        public virtual User LastModifierUser { get; set; }
    }
}