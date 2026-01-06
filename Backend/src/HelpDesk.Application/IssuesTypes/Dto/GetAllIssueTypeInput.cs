using Abp.Application.Services.Dto;
using System;

namespace HelpDesk.IssuesTypes.Dto
{
    public class GetAllIssueTypeInput : PagedAndSortedResultRequestDto
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