using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Issues
{
    public class IssuesComments : FullAuditedEntity<long>, IMayHaveTenant
    {
        public long IssueId { get; set; }

        [StringLength(2000)]
        [Column(TypeName = "nvarchar(max)")]
        public string Content { get; set; }

        [StringLength(500)]
        public string FilePath { get; set; } // Fayl joylashuvi (masalan, fayl tizimida yoki cloud storage-da)

        [StringLength(100)]
        public string FileName { get; set; } // Fayl nomi (foydalanuvchi ko'radigan nom)

        [Column(TypeName = "decimal(18,6)")]
        public decimal? Latitude { get; set; } // Geolokatsiya: kenglik

        [Column(TypeName = "decimal(18,6)")]
        public decimal? Longitude { get; set; } // Geolokatsiya: uzunlik

        public int? TenantId { get; set; } // Added for multi-tenancy

        [ForeignKey(nameof(IssueId))]
        public virtual Issues Issue { get; set; }
    }
}