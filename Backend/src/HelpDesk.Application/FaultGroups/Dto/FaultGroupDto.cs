using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;

namespace HelpDesk.FaultGroups.Dto
{
    [AutoMapFrom(typeof(FaultGroup))]
    public class FaultGroupDto : EntityDto<int>
    {
        public string Title { get; set; }
        public int? TenantId { get; set; }
    }
}