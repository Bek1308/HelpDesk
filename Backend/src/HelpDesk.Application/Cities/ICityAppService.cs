using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.Cities.Dto;
using System.Threading.Tasks;

namespace HelpDesk.Cities
{
    public interface ICityAppService :
        IAsyncCrudAppService<
            CityDto,            // TEntityDto
            int,               // Primary Key
            GetAllCityInput,   // GetAll input
            CreateCityInput,   // Create input
            UpdateCityInput    // Update input
        >
    {
        Task<CityDto> GetCityForEdit(EntityDto input);
    }
}