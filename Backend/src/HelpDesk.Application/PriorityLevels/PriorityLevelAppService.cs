using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Localization;
using Abp.Runtime.Session;
using Abp.UI;
using HelpDesk.Application.Localization;
using HelpDesk.Authorization;
using HelpDesk.PriorityLevels.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace HelpDesk.PriorityLevels
{
    //[AbpAuthorize(PermissionNames.Pages_PriorityLevels)]
    public class PriorityLevelAppService :
        AsyncCrudAppService<
            PriorityLevels,           // Entity
            PriorityLevelDto,         // DTO
            int,                      // Primary key
            GetAllPriorityLevelInput, // GetAll input
            CreatePriorityLevelInput, // Create input
            UpdatePriorityLevelInput  // Update input
        >,
        IPriorityLevelAppService
    {
        private readonly ILogger<PriorityLevelAppService> _logger;
        private readonly ILocalizedMessageService _localizedMessageService;
        private readonly IRepository<ApplicationLanguageText, long> _languageTextRepository;
        private readonly IAbpSession _abpSession;

        public PriorityLevelAppService(
            IRepository<PriorityLevels, int> repository,
            ILogger<PriorityLevelAppService> logger,
            ILocalizedMessageService localizedMessageService,
            IRepository<ApplicationLanguageText, long> languageTextRepository,
            IAbpSession abpSession)
            : base(repository)
        {
            _logger = logger;
            _localizedMessageService = localizedMessageService;
            _languageTextRepository = languageTextRepository;
            _abpSession = abpSession;
        }

        public override async Task<PriorityLevelDto> CreateAsync(CreatePriorityLevelInput input)
        {
            CheckCreatePermission();

            if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Length > 255)
                throw new UserFriendlyException(L("InvalidTitleLength"));

            // Percentage unikal bo'lishini tekshirish
            if (await Repository.GetAll().AnyAsync(p => p.Percentage == input.Percentage && p.TenantId == AbpSession.TenantId))
                throw new UserFriendlyException(L("PercentageAlreadyExists"));

            var entity = ObjectMapper.Map<PriorityLevels>(input);
            entity.TenantId = AbpSession.TenantId;

            await Repository.InsertAsync(entity);

            var result = ObjectMapper.Map<PriorityLevelDto>(entity);
            result.Title = _localizedMessageService.L(result.Title);

            return result;
        }

        public override async Task<PriorityLevelDto> UpdateAsync(UpdatePriorityLevelInput input)
        {
            CheckUpdatePermission();
            _logger.LogInformation("Updating priority level with ID: {Id}, Title: {Title}, Percentage: {Percentage}", input.Id, input.Title, input.Percentage);

            if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Length > 255) 
                throw new UserFriendlyException(L("InvalidTitleLength"));

            // Percentage unikal bo'lishini tekshirish (o'zini hisobga olmasdan)
            if (await Repository.GetAll().AnyAsync(p => p.Percentage == input.Percentage && p.Id != input.Id && p.TenantId == AbpSession.TenantId))
                throw new UserFriendlyException(L("PercentageAlreadyExists"));

            var priorityLevel = await Repository.GetAsync(input.Id);
            ObjectMapper.Map(input, priorityLevel);
            var result = await base.UpdateAsync(input);
            _logger.LogInformation("Priority level updated successfully with ID: {Id}", result.Id);
            result.Title = _localizedMessageService.L(result.Title);
            return result;
        }

        public override async Task DeleteAsync(EntityDto<int> input)
        {
            CheckDeletePermission();
            _logger.LogInformation("Deleting priority level with ID: {Id}", input.Id);
            await base.DeleteAsync(input);
            _logger.LogInformation("Priority level deleted successfully with ID: {Id}", input.Id);
        }

        public override async Task<PriorityLevelDto> GetAsync(EntityDto<int> input)
        {
            CheckGetPermission();
            _logger.LogInformation("Retrieving priority level with ID: {Id}", input.Id);
            var result = await base.GetAsync(input);
            if (result == null)
            {
                _logger.LogWarning("Priority level with ID {Id} not found", input.Id);
                throw new UserFriendlyException(L("PriorityLevelNotFound"));
            }
            result.Title = _localizedMessageService.L(result.Title);
            return result;
        }

        public override async Task<PagedResultDto<PriorityLevelDto>> GetAllAsync(GetAllPriorityLevelInput input)
        {
            CheckGetAllPermission();
            _logger.LogInformation("Retrieving all priority levels with Filter: {Filter}, Language: {Language}", input.Keyword, CultureInfo.CurrentUICulture.Name);

            var query = CreateFilteredQuery(input);
            query = ApplySorting(query, input);

            var totalCount = await query.CountAsync();
            _logger.LogInformation("Found {Count} priority levels for keyword: {Keyword}", totalCount, input.Keyword);

            var rawItems = await query
                .Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.Percentage
                })
                .PageBy(input)
                .ToListAsync();

            var items = rawItems.Select(x => new PriorityLevelDto
            {
                Id = x.Id,
                Title = _localizedMessageService.L(x.Title),
                Percentage = x.Percentage
            }).ToList();

            return new PagedResultDto<PriorityLevelDto>(totalCount, items);
        }

        public async Task<PriorityLevelDto> GetPriorityLevelForEdit(EntityDto input)
        {
            CheckGetPermission();
            _logger.LogInformation("Retrieving priority level with ID: {Id}", input.Id);
            var result = await base.GetAsync(input);
            if (result == null)
            {
                _logger.LogWarning("Priority level with ID {Id} not found", input.Id);
                throw new UserFriendlyException(L("PriorityLevelNotFound"));
            }
           
            return result;


        }

        protected override IQueryable<PriorityLevels> CreateFilteredQuery(GetAllPriorityLevelInput input)
        {
            var query = Repository.GetAll();
            var language = CultureInfo.CurrentUICulture.Name ?? "en";
            var source = "HelpDesk";
            var tenantId = _abpSession.TenantId;

            _logger.LogDebug("Creating filtered query with Keyword: {Keyword}, Language: {Language}, TenantId: {TenantId}", input.Keyword, language, tenantId);

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                query = from priorityLevel in query
                        join translation in _languageTextRepository.GetAll()
                            on new { Name = priorityLevel.Title, LanguageName = language, Source = source, TenantId = tenantId }
                            equals new { Name = translation.Key, translation.LanguageName, translation.Source, translation.TenantId }
                            into translations
                        from translation in translations.DefaultIfEmpty()
                        where translation != null && translation.Value.Contains(input.Keyword)
                        select priorityLevel;

                query = query.Distinct();
                _logger.LogDebug("Query filtered with keyword: {Keyword}, found {Count} results", input.Keyword, query.Count());
            }

            return query;
        }

        protected override IQueryable<PriorityLevels> ApplySorting(IQueryable<PriorityLevels> query, GetAllPriorityLevelInput input)
        {
            var sorting = !string.IsNullOrWhiteSpace(input.Sorting) ? input.Sorting : "Title";
            return query.OrderBy(sorting);
        }

        protected override async Task<PriorityLevels> GetEntityByIdAsync(int id)
        {
            return await Repository.GetAll().FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}