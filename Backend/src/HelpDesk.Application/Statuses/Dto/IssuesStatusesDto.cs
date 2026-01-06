using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;

namespace HelpDesk.Statuses.Dto
{
    [AutoMapFrom(typeof(IssuesStatuses))]
    public class IssuesStatusesDto : EntityDto<int>
    {
        public string Title { get; set; }
        public int? TenantId { get; set; }
    }
}