using Abp.Application.Services.Dto;
using Abp.AutoMapper;

namespace HelpDesk.Cities.Dto
{
    [AutoMapFrom(typeof(Cities.City))]
    public class CityEditDto : EntityDto<int>
    {
        public string Name { get; set; }
        public int Distance { get; set; }
        public decimal Score { get; set; }
        public decimal? Price { get; set; }
    }
}