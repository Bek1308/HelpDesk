using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;
using System.ComponentModel.DataAnnotations;

namespace HelpDesk.Issues.Dto
{
    [AutoMap(typeof(IssuesComments))]
    public class IssuesCommentsDto : EntityDto<long>
    {
        public long IssueId { get; set; }

        [StringLength(2000)]
        public string Content { get; set; }

        [StringLength(500)]
        public string FilePath { get; set; }

        [StringLength(100)]
        public string FileName { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public int? TenantId { get; set; }

        // FullAuditedEntity properties
        public long? CreatorUserId { get; set; }
        public string CreatorFullName { get; set; } // Foydalanuvchi ismi
        public DateTime CreationTime { get; set; }
        public long? LastModifierUserId { get; set; }
        public string LastModifierFullName { get; set; } // Oxirgi o'zgartiruvchi ismi
        public DateTime? LastModificationTime { get; set; }
        public long? DeleterUserId { get; set; }
        public string DeleterFullName { get; set; } // O'chiruvchi ismi
        public DateTime? DeletionTime { get; set; }
        public bool IsDeleted { get; set; }
    }

    [AutoMapTo(typeof(IssuesComments))]
    public class CreateIssuesCommentsInput
    {
        [Required]
        public long IssueId { get; set; }

        [Required]
        [StringLength(2000)]
        public string Content { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }
    }

    [AutoMapTo(typeof(IssuesComments))]
    public class UpdateIssuesCommentsInput : EntityDto<long>
    {
        [Required]
        public long IssueId { get; set; }

        [Required]
        [StringLength(2000)]
        public string Content { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }
    }

    public class GetAllIssuesCommentsInput : PagedAndSortedResultRequestDto
    {
        public string Keyword { get; set; }
        public long? IssueId { get; set; }
    }
}