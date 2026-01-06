using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;

namespace HelpDesk.IssuesTypes.Dto
{
    [AutoMapTo(typeof(IssueTypes))]
    public class UpdateIssueTypeInputDto : EntityDto<int>
    {
        public string Title { get; set; }
        public string Description { get; set; }
    }
}