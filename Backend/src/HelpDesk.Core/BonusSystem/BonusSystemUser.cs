using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using HelpDesk.Authorization.Users;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.BonusSystem
{
    public class BonusSystemUser : Entity<long>, IHasCreationTime, IHasModificationTime, IMayHaveTenant
    {
        public long BonusSystemId { get; set; }
        public long UserId { get; set; }

        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }

        public long? CreatorUserId { get; set; }
        public long? LastModifierUserId { get; set; }

        public int? TenantId { get; set; }

        [ForeignKey("BonusSystemId")]
        public virtual BonusSystem BonusSystem { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("CreatorUserId")]
        public virtual User CreatorUser { get; set; }

        [ForeignKey("LastModifierUserId")]
        public virtual User LastModifierUser { get; set; }
    }
}