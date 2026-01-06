// IBonusSystemAppService.cs
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.BonusSystem.Dto;
using System.Threading.Tasks;

namespace HelpDesk.BonusSystem
{
    public interface IBonusSystemAppService :
        IAsyncCrudAppService<BonusSystemDto, long, PagedAndSortedResultRequestDto, CreateBonusSystemDto, EditBonusSystemDto>
    {
        Task<BonusSystemWithRulesDto> GetWithRulesAsync(EntityDto<long> input);
    }
}