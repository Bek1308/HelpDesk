// IBonusSystemUserAppService.cs
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.BonusSystem.Dto;
using System.Threading.Tasks;

namespace HelpDesk.BonusSystem
{
    public interface IBonusSystemUserAppService :
        IAsyncCrudAppService<BonusSystemUserDto, long, GetAllBonusSystemUsersInput, CreateBonusSystemUserDto, EditBonusSystemUserDto>
    {
        Task<BonusSystemUserDto> GetAsync(EntityDto<long> input);
        Task<ListResultDto<BonusSystemUserDto>> GetByBonusSystemAsync(EntityDto<long> input);
        Task<ListResultDto<BonusSystemUserDto>> GetByUserAsync(EntityDto<long> input);
    }
}