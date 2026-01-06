using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.Services.Dto;
using System.Threading.Tasks;

namespace HelpDesk.Services
{
    public interface IServiceAppService :
        IAsyncCrudAppService<
            ServiceDto,          // TEntityDto
            int,                 // Primary Key
            GetAllServiceInput,  // GetAll input
            CreateServiceInput,  // Create input
            UpdateServiceInput   // Update input
        >
    {
        Task<ServiceDto> GetServiceForEdit(EntityDto input);
    }
}