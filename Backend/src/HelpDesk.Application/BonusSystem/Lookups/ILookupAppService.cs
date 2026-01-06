// ILookupAppService.cs
using Abp.Application.Services;
using HelpDesk.BonusSystem.Lookups.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HelpDesk.BonusSystem.Lookups
{
    public interface ILookupAppService : IApplicationService
    {
        Task<List<PeriodTypeDto>> GetAllPeriodTypesAsync();
        Task<List<BudgetTypeDto>> GetAllBudgetTypesAsync();
        Task<List<WeekdayDto>> GetAllWeekdaysAsync();
    }
}