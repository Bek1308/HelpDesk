// ActionRule.cs
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using HelpDesk.Authorization.Users;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.BonusSystem
{
    public class ActionRule : Entity<long>, IHasCreationTime, IHasModificationTime, IMayHaveTenant
    {
        public long BonusSystemId { get; set; }

        [StringLength(200)]
        [Column(TypeName = "nvarchar(200)")]
        public string ActionName { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ConditionJson { get; set; }

        public int Points { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }
        public long? CreatorUserId { get; set; }
        public long? LastModifierUserId { get; set; }

        public int? TenantId { get; set; }

        // 1-to-Many — navigation property
        [ForeignKey("BonusSystemId")]
        public virtual BonusSystem BonusSystem { get; set; }

        [ForeignKey("CreatorUserId")]
        public virtual User CreatorUser { get; set; }

        [ForeignKey("LastModifierUserId")]
        public virtual User LastModifierUser { get; set; }
    }
}