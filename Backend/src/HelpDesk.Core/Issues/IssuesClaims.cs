using Abp.Domain.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Issues
{
    public class IssuesClaims : Entity<long>
    {
        public long IssueId { get; set; }

        [StringLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string ClaimKey { get; set; }

        [StringLength(200)]
        [Column(TypeName = "nvarchar(200)")]
        public string ClaimValue { get; set; }

        [ForeignKey(nameof(IssueId))]
        public virtual Issues Issue { get; set; }
    }
}