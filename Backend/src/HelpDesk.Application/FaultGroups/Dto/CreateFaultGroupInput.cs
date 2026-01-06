using Abp.AutoMapper;
using System;

namespace HelpDesk.FaultGroups.Dto
{
    [AutoMapTo(typeof(FaultGroup))]
    public class CreateFaultGroupInput
    {
        public string Title { get; set; }
    }
}