using Abp.AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Statuses.Dto
{
    [AutoMapTo(typeof(IssuesStatuses))]
    public class CreateIssuesStatusesDto
    {
        public string Title { get; set; }
    }
}
