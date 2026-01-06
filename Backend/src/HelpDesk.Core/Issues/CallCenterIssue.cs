using Abp.Domain.Entities;
using HelpDesk.Authorization.Users;
using HelpDesk.Category;
using HelpDesk.Statuses;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Issues
{
    public class CallCenterIssue : Entity<long>, IMayHaveTenant
    {
        public long IssuesId { get; set; }
        public int SubCategoryId { get; set; }  // long dan int ga
        public int ServiceId { get; set; }  // long dan int ga
        [StringLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string WrongNumber { get; set; }
        [StringLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string RightNumber { get; set; }
        [StringLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string TerminalNumber { get; set; }
        [StringLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public decimal Sum { get; set; }
        [StringLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public decimal CancelledSum { get; set; }
        [StringLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string Subscriber { get; set; }
        public int? TenantId { get; set; }

        [ForeignKey(nameof(IssuesId))]
        public virtual Issues Issues { get; set; }
        [ForeignKey(nameof(SubCategoryId))]
        public virtual SubCategories SubCategories { get; set; }
        [ForeignKey(nameof(ServiceId))]
        public virtual Services.Services Services { get; set; }
    }
}