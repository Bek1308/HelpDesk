using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using HelpDesk.Authorization.Users;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.BonusSystem
{
    public class UserAction : Entity<long>, IHasCreationTime, IHasModificationTime, IMayHaveTenant
    {
        public long? UserId { get; set; }
        public long ActionRuleId { get; set; }
        public DateTime ActionDate { get; set; }
        public long? RealActionId { get; set; }
        public bool IsResolved { get; set; } = false;

        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }

        public long? CreatorUserId { get; set; }
        public long? LastModifierUserId { get; set; }

        public int? TenantId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("ActionRuleId")]
        public virtual ActionRule ActionRule { get; set; }

        [ForeignKey("CreatorUserId")]
        public virtual User CreatorUser { get; set; }

        [ForeignKey("LastModifierUserId")]
        public virtual User LastModifierUser { get; set; }
    }
}