using Abp.AutoMapper;
using System;

namespace HelpDesk.IssuesTypes.Dto
{
    [AutoMapTo(typeof(IssueTypes))]
    public class CreateIssueTypeInputDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
    }
}