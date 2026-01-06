using Abp.Domain.Entities;
using HelpDesk.Category;
using HelpDesk.Issues;
using HelpDesk.Services;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Issues
{
    public class PayvandWalletIssue : Entity<long>, IMayHaveTenant
    {
        public long IssuesId { get; set; }

        [StringLength(20)]
        [Column(TypeName = "nvarchar(20)")]
        public string WrongNumber { get; set; }

        [StringLength(20)]
        [Column(TypeName = "nvarchar(20)")]
        public string RightNumber { get; set; }

        public int ServiceId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public int SubCategoryId { get; set; }

        public int? TenantId { get; set; }

        [ForeignKey(nameof(IssuesId))]
        public virtual Issues Issues { get; set; }

        [ForeignKey(nameof(SubCategoryId))]
        public virtual SubCategories SubCategories { get; set; }

        [ForeignKey(nameof(ServiceId))]
        public virtual Services.Services Services { get; set; }
    }
}