using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;

namespace HelpDesk.IssuesTypes.Dto
{
    [AutoMapFrom(typeof(IssueTypes))]
    public class IssueTypeDto : EntityDto<int>
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int? TenantId { get; set; }
    }
}