using Abp.Domain.Entities;
using HelpDesk.Category;
using HelpDesk.Issues;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Issues
{
    public class ATMIssue : Entity<long>, IMayHaveTenant
    {
        public long IssuesId { get; set; }

        [StringLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string ATMNumber { get; set; }

        [StringLength(500)]
        [Column(TypeName = "nvarchar(500)")]
        public string Reason { get; set; }

        [StringLength(100)]
        [Column(TypeName = "nvarchar(100)")]
        public string IssuingBank { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [StringLength(20)]
        [Column(TypeName = "nvarchar(20)")]
        public string PhoneNumber { get; set; }

        public int SubCategoryId { get; set; }

        public int? TenantId { get; set; }

        [ForeignKey(nameof(IssuesId))]
        public virtual Issues Issues { get; set; }

        [ForeignKey(nameof(SubCategoryId))]
        public virtual SubCategories SubCategories { get; set; }
    }
}