// BonusSystemAppService.cs
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Repositories;
using Abp.Linq.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using AutoMapper;
using HelpDesk.Authorization;
using HelpDesk.BonusSystem.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HelpDesk.BonusSystem
{
    [AbpAuthorize(PermissionNames.Pages_IssueTypes)]
    public class BonusSystemAppService :
        AsyncCrudAppService<BonusSystem, BonusSystemDto, long, PagedAndSortedResultRequestDto, CreateBonusSystemDto, EditBonusSystemDto>,
        IBonusSystemAppService
    {
        private readonly IRepository<BonusSystem, long> _bonusSystemRepository;
        private readonly IRepository<ActionRule, long> _actionRuleRepository;
        private readonly IAbpSession _abpSession;
        private readonly ILogger<BonusSystemAppService> _logger;

        public BonusSystemAppService(
            IRepository<BonusSystem, long> bonusSystemRepository,
            IRepository<ActionRule, long> actionRuleRepository,
            IAbpSession abpSession,
            ILogger<BonusSystemAppService> logger)
            : base(bonusSystemRepository)
        {
            _bonusSystemRepository = bonusSystemRepository;
            _actionRuleRepository = actionRuleRepository;
            _abpSession = abpSession;
            _logger = logger;
        }

        // GET ALL — Include + Sorting + Paging
        public override async Task<PagedResultDto<BonusSystemDto>> GetAllAsync(PagedAndSortedResultRequestDto input)
        {
            var query = _bonusSystemRepository.GetAll()
                .Include(x => x.PeriodType)
                .Include(x => x.PeriodStartWeekday)
                .Include(x => x.BudgetType);

            var totalCount = await query.CountAsync();

            var sortedQuery = string.IsNullOrWhiteSpace(input.Sorting)
                ? query.OrderBy(x => x.Name)
                : ApplySorting(query, input.Sorting);

            var items = await sortedQuery
                .PageBy(input)
                .ToListAsync();

            _logger.LogInformation("BonusSystem GetAll: {Count} items retrieved", totalCount);

            return new PagedResultDto<BonusSystemDto>(
                totalCount,
                ObjectMapper.Map<List<BonusSystemDto>>(items)
            );
        }

        private IQueryable<BonusSystem> ApplySorting(IQueryable<BonusSystem> query, string sorting)
        {
            return sorting.Trim() switch
            {
                "Name DESC" => query.OrderByDescending(x => x.Name),
                "Name" => query.OrderBy(x => x.Name),
                "Amount" => query.OrderBy(x => x.Amount),
                "Amount DESC" => query.OrderByDescending(x => x.Amount),
                "IsActive" => query.OrderBy(x => x.IsActive),
                "IsActive DESC" => query.OrderByDescending(x => x.IsActive),
                _ => query.OrderBy(x => x.Name)
            };
        }

        // CREATE — IssueAppService namunasi asosida (DUPLICATE YO‘Q!)
        public override async Task<BonusSystemDto> CreateAsync(CreateBonusSystemDto input)
        {
            _logger.LogInformation("CreateAsync started for BonusSystem: {Name}", input.Name);

            // ObjectMapper.Map ishlatmaymiz — ActionRules ni o‘zimiz qo‘shamiz
            var bonusSystem = new BonusSystem
            {
                Name = input.Name,
                Description = input.Description,
                PeriodTypeId = input.PeriodTypeId,
                PeriodStartDay = input.PeriodStartDay,
                PeriodStartWeekdayId = input.PeriodStartWeekdayId,
                BudgetTypeId = input.BudgetTypeId,
                Amount = input.Amount,
                IsActive = input.IsActive,
                TenantId = _abpSession.TenantId
            };

            await _bonusSystemRepository.InsertAsync(bonusSystem);

            // ActionRules ni qo‘lda qo‘shamiz
            if (input.ActionRules != null && input.ActionRules.Any())
            {
                _logger.LogInformation("Adding {Count} ActionRules", input.ActionRules.Count);
                foreach (var ruleDto in input.ActionRules)
                {
                    var rule = ObjectMapper.Map<ActionRule>(ruleDto);
                    rule.BonusSystem = bonusSystem;
                    rule.TenantId = _abpSession.TenantId;
                    await _actionRuleRepository.InsertAsync(rule);
                }
            }

            // BIR MARTA SAQLASH
            await CurrentUnitOfWork.SaveChangesAsync();
            _logger.LogInformation("BonusSystem created with Id: {Id}", bonusSystem.Id);

            return MapToEntityDto(bonusSystem);
        }

        // UPDATE — IssueAppService namunasi asosida
        public override async Task<BonusSystemDto> UpdateAsync(EditBonusSystemDto input)
        {
            _logger.LogInformation("UpdateAsync started for BonusSystem.Id: {Id}", input.Id);

            var bonusSystem = await _bonusSystemRepository.GetAsync(input.Id);

            // Asosiy maydonlarni yangilash
            bonusSystem.Name = input.Name;
            bonusSystem.Description = input.Description;
            bonusSystem.PeriodTypeId = input.PeriodTypeId;
            bonusSystem.PeriodStartDay = input.PeriodStartDay;
            bonusSystem.PeriodStartWeekdayId = input.PeriodStartWeekdayId;
            bonusSystem.BudgetTypeId = input.BudgetTypeId;
            bonusSystem.Amount = input.Amount;
            bonusSystem.IsActive = input.IsActive;

            await _bonusSystemRepository.UpdateAsync(bonusSystem);

            // Mavjud ruleni olish
            var existingRules = await _actionRuleRepository.GetAllListAsync(x => x.BonusSystemId == input.Id);
            var incomingIds = input.ActionRules?.Where(x => x.Id != 0).Select(x => x.Id).ToList() ?? new List<long>();

            // O‘chirilgan ruleni o‘chirish
            foreach (var rule in existingRules.Where(x => !incomingIds.Contains(x.Id)))
            {
                await _actionRuleRepository.DeleteAsync(rule);
            }

            // Yangi va o‘zgartirilgan ruleni qo‘shish
            if (input.ActionRules != null)
            {
                foreach (var ruleDto in input.ActionRules)
                {
                    if (ruleDto.Id == 0)
                    {
                        var newRule = ObjectMapper.Map<ActionRule>(ruleDto);
                        newRule.BonusSystem = bonusSystem;
                        newRule.TenantId = _abpSession.TenantId;
                        await _actionRuleRepository.InsertAsync(newRule);
                    }
                    else
                    {
                        var existing = existingRules.FirstOrDefault(x => x.Id == ruleDto.Id);
                        if (existing != null)
                        {
                            ObjectMapper.Map(ruleDto, existing);
                            await _actionRuleRepository.UpdateAsync(existing);
                        }
                    }
                }
            }

            await CurrentUnitOfWork.SaveChangesAsync();
            _logger.LogInformation("BonusSystem updated with Id: {Id}", bonusSystem.Id);

            return MapToEntityDto(bonusSystem);
        }

        // DELETE
        public override async Task DeleteAsync(EntityDto<long> input)
        {
            _logger.LogInformation("Deleting BonusSystem.Id: {Id}", input.Id);
            await _bonusSystemRepository.DeleteAsync(input.Id);
        }

        // GET WITH RULES
        public async Task<BonusSystemWithRulesDto> GetWithRulesAsync(EntityDto<long> input)
        {
            _logger.LogInformation("GetWithRulesAsync called for BonusSystem.Id: {Id}", input.Id);

            var bonusSystem = await _bonusSystemRepository.GetAsync(input.Id);

            var context = _bonusSystemRepository.GetDbContext();
            await context.Entry(bonusSystem).Reference(x => x.PeriodType).LoadAsync();
            await context.Entry(bonusSystem).Reference(x => x.PeriodStartWeekday).LoadAsync();
            await context.Entry(bonusSystem).Reference(x => x.BudgetType).LoadAsync();
            await context.Entry(bonusSystem).Collection(x => x.ActionRules).LoadAsync();

            return ObjectMapper.Map<BonusSystemWithRulesDto>(bonusSystem);
        }
        // Oddiy Get — Include qo'shildi
        public override async Task<BonusSystemDto> GetAsync(EntityDto<long> input)
        {
            var bonusSystem = await _bonusSystemRepository.GetAll()
                .Include(x => x.PeriodType)
                .Include(x => x.PeriodStartWeekday)
                .Include(x => x.BudgetType)
                .FirstOrDefaultAsync(x => x.Id == input.Id);

            if (bonusSystem == null)
            {
                throw new UserFriendlyException("BonusSystem not found");
            }

            return ObjectMapper.Map<BonusSystemDto>(bonusSystem);
        }
    }
}