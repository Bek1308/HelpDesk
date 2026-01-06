using Abp.Application.Services.Dto;
using System;

namespace HelpDesk.Statuses.Dto
{
    public class GetAllIssuesStatusesInput : PagedAndSortedResultRequestDto
    {
        public string Keyword { get; set; }

        public void Normalize()
        {
            if (string.IsNullOrEmpty(Sorting))
            {
                Sorting = "Title ASC";
            }

            Keyword = Keyword?.Trim();
        }
    }
}