using Abp.Application.Services.Dto;

namespace HelpDesk.Cities.Dto
{
    public class GetAllCityInput : PagedAndSortedResultRequestDto
    {
        public string Keyword { get; set; }

        public void Normalize()
        {
            if (string.IsNullOrEmpty(Sorting))
            {
                Sorting = "Name ASC";
            }

            Keyword = Keyword?.Trim();
        }
    }
}