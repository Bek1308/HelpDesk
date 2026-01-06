using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;

namespace HelpDesk.Statuses.Dto
{
    [AutoMapTo(typeof(IssuesStatuses))]
    public class IssuesStatusesInputDto : EntityDto<int>
    {
        public string Title { get; set; }
    }
}