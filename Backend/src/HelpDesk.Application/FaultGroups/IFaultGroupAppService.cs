using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.FaultGroups.Dto;
using System.Threading.Tasks;

namespace HelpDesk.FaultGroups
{
    public interface IFaultGroupAppService :
        IAsyncCrudAppService<
            FaultGroupDto,        // TEntityDto
            int,                  // Primary Key
            GetAllFaultGroupInput, // GetAll input
            CreateFaultGroupInput, // Create input
            UpdateFaultGroupInput  // Update input
        >
    {
        Task<FaultGroupDto> GetFaultGroupForEdit(EntityDto input);
    }
}