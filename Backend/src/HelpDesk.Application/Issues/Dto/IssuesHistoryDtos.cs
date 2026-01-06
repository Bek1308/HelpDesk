using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;
using System.ComponentModel.DataAnnotations;

namespace HelpDesk.Issues.Dto
{
    [AutoMapFrom(typeof(IssuesHistory))]
    public class IssuesHistoryDto : EntityDto<long>
    {
        public long IssueId { get; set; }

        [StringLength(100)]
        public string FieldName { get; set; }

        public DateTime CreationTime { get; set; }

        public long CreatedBy { get; set; }

        [StringLength(500)]
        public string CreatorName { get; set; } // Foydalanuvchi ismi

        public string OriginalValue { get; set; }

        public string NewValue { get; set; }

        public string Description { get; set; } // JSON formatidagi xom ma'lumot

        public string LocalizedDescription { get; set; } // Lokalizatsiya qilingan matn
    }

    public class GetHistoryByIssueInput : PagedAndSortedResultRequestDto
    {
        public long IssueId { get; set; }
    }
}
