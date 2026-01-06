using Abp.Domain.Entities;
using HelpDesk.Category;
using HelpDesk.Issues;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Issues
{
    public class PayvandCardIssue : Entity<long>, IMayHaveTenant
    {
        public long IssuesId { get; set; }

        [StringLength(20)]
        [Column(TypeName = "nvarchar(20)")]
        public string WrongNumber { get; set; }

        [StringLength(20)]
        [Column(TypeName = "nvarchar(20)")]
        public string RightNumber { get; set; }

        public int SubCategoryId { get; set; }

        public int? TenantId { get; set; }

        [ForeignKey(nameof(IssuesId))]
        public virtual Issues Issues { get; set; }

        [ForeignKey(nameof(SubCategoryId))]
        public virtual SubCategories SubCategories { get; set; }
    }
}