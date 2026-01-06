using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using HelpDesk.Authorization.Users;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.BonusSystem
{
    public class Bonus : Entity<long>, IHasCreationTime, IHasModificationTime, IMayHaveTenant
    {
        public long? UserId { get; set; }
        public long BonusSystemId { get; set; }

        public int TotalPoints { get; set; } = 0;

        [Column(TypeName = "decimal(12,2)")]
        public decimal BonusAmount { get; set; } = 0;

        [Column(TypeName = "decimal(12,2)")]
        public decimal PaidAmount { get; set; } = 0;

        [StringLength(50)]
        [Column(TypeName = "varchar(50)")]
        public string ForPeriod { get; set; } // 2025-W01, 2025-01, etc.

        public bool IsPaidFull { get; set; } = false;
        public DateTime? LastPaidAt { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal? LastPaidAmount { get; set; }

        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }

        public long? CreatorUserId { get; set; }
        public long? LastModifierUserId { get; set; }

        public int? TenantId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("BonusSystemId")]
        public virtual BonusSystem BonusSystem { get; set; }

        [ForeignKey("CreatorUserId")]
        public virtual User CreatorUser { get; set; }

        [ForeignKey("LastModifierUserId")]
        public virtual User LastModifierUser { get; set; }
    }
}