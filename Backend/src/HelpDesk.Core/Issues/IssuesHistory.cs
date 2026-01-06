using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using HelpDesk.Authorization.Users;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Issues
{
    public class IssuesHistory : Entity<long>, IHasCreationTime, IMayHaveTenant
    {
        public long IssueId { get; set; }  // int dan long ga o'zgartirildi
        [StringLength(100)]
        [Column(TypeName = "nvarchar(100)")]
        public string FieldName { get; set; }
        public DateTime CreationTime { get; set; }
        public long CreatedBy { get; set; }
        [Column(TypeName = "nvarchar(max)")]
        public string OriginalValue { get; set; }
        [Column(TypeName = "nvarchar(max)")]
        public string NewValue { get; set; }
        public int? TenantId { get; set; } // IMayHaveTenant uchun
        [Column(TypeName = "nvarchar(max)")]
        public string Description { get; set; }

        [ForeignKey("IssueId")]
        public Issues Issue { get; set; }
        [ForeignKey("CreatedBy")]
        public User CreatedByUser { get; set; }
    }
}