using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using HelpDesk.Authorization.Users;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.BonusSystem.Lookups
{
    [Table("Weekdays")]
    public class Weekday : Entity<int>, IHasCreationTime, IHasModificationTime, IMayHaveTenant
    {
        [StringLength(10)]
        [Column(TypeName = "varchar(10)")]
        public string Name { get; set; } // monday, tuesday, ..., sunday

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