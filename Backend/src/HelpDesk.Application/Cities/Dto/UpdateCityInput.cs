using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System.ComponentModel.DataAnnotations;

namespace HelpDesk.Cities.Dto
{
    [AutoMapTo(typeof(Cities.City))]
    public class UpdateCityInput : EntityDto<int>
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; }

        [Required]
        public int Distance { get; set; }

        [Required]
        public decimal Score { get; set; }

        public decimal? Price { get; set; }
    }
}