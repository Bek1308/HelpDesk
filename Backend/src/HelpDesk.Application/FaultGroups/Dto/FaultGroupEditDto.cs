using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;

namespace HelpDesk.FaultGroups
{
    [AutoMapFrom(typeof(FaultGroup))]
    public class FaultGroupEditDto : EntityDto<int>
    {
        public string Title { get; set; }
    }
}