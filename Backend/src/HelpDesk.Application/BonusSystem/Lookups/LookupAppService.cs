// LookupAppService.cs
using Abp.Application.Services;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using HelpDesk.Authorization.Users;
using HelpDesk.BonusSystem.Lookups.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HelpDesk.BonusSystem.Lookups
{
    [AbpAuthorize] // Agar ruxsat kerak bo'lsa
    public class LookupAppService : ApplicationService, ILookupAppService
    {
        private readonly IRepository<PeriodType, int> _periodTypeRepository;
        private readonly IRepository<BudgetType, int> _budgetTypeRepository;
        private readonly IRepository<Weekday, int> _weekdayRepository;
        private readonly IRepository<User, long> _userRepository;

        public LookupAppService(
            IRepository<PeriodType, int> periodTypeRepository,
            IRepository<BudgetType, int> budgetTypeRepository,
            IRepository<Weekday, int> weekdayRepository,
            IRepository<User, long> userRepository)
        {
            _periodTypeRepository = periodTypeRepository;
            _budgetTypeRepository = budgetTypeRepository;
            _weekdayRepository = weekdayRepository;
            _userRepository = userRepository;
        }

        public async Task<List<PeriodTypeDto>> GetAllPeriodTypesAsync()
        {
            var query = _periodTypeRepository.GetAll()
                .Include(pt => pt.CreatorUser);

            var periodTypes = await query.ToListAsync();

            return periodTypes.Select(pt => new PeriodTypeDto
            {
                Id = pt.Id,
                Name = pt.Name,
                Description = pt.Description,
                Quantity = pt.Quantity,
                CreationTime = pt.CreationTime,
                LastModificationTime = pt.LastModificationTime,
                CreatorUserId = pt.CreatorUserId,
                CreatorUserName = pt.CreatorUser?.UserName,
                TenantId = pt.TenantId
            }).ToList();
        }

        public async Task<List<BudgetTypeDto>> GetAllBudgetTypesAsync()
        {
            var query = _budgetTypeRepository.GetAll()
                .Include(bt => bt.CreatorUser);

            var budgetTypes = await query.ToListAsync();

            return budgetTypes.Select(bt => new BudgetTypeDto
            {
                Id = bt.Id,
                Name = bt.Name,
                Description = bt.Description,
                CreationTime = bt.CreationTime,
                LastModificationTime = bt.LastModificationTime,
                CreatorUserId = bt.CreatorUserId,
                CreatorUserName = bt.CreatorUser?.UserName,
                TenantId = bt.TenantId
            }).ToList();
        }

        public async Task<List<WeekdayDto>> GetAllWeekdaysAsync()
        {
            var query = _weekdayRepository.GetAll()
                .Include(wd => wd.CreatorUser);

            var weekdays = await query.ToListAsync();

            return weekdays.Select(wd => new WeekdayDto
            {
                Id = wd.Id,
                Name = wd.Name,
                CreationTime = wd.CreationTime,
                LastModificationTime = wd.LastModificationTime,
                CreatorUserId = wd.CreatorUserId,
                CreatorUserName = wd.CreatorUser?.UserName,
                TenantId = wd.TenantId
            }).ToList();
        }
    }
}