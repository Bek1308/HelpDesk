using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.PriorityLevels.Dto
{
    public class GetAllPriorityLevelInput : PagedAndSortedResultRequestDto
    {
        public string Keyword { get; set; }

        public void Normalize()
        {
            Keyword = Keyword?.Trim();
        }
    }
}
