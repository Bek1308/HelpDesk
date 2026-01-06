using Abp.Application.Services.Dto;
using System;

namespace HelpDesk.FaultGroups.Dto
{
    public class GetAllFaultGroupInput : PagedAndSortedResultRequestDto
    {
        public string Keyword { get; set; }

        public void Normalize()
        {
            if (string.IsNullOrEmpty(Sorting))
            {
                Sorting = "Title";
            }

            Keyword = Keyword?.Trim();
        }
    }
}