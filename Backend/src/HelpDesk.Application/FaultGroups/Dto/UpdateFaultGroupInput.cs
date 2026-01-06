using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;

namespace HelpDesk.FaultGroups.Dto
{
    [AutoMapTo(typeof(FaultGroup))]
    public class UpdateFaultGroupInput : EntityDto<int>
    {
        public string Title { get; set; }
    }
}