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
using HelpDesk.FaultGroups.Dto;
using HelpDesk.Domain.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace HelpDesk.FaultGroups
{
    //[AbpAuthorize(PermissionNames.Pages_FaultGroups)]
    public class FaultGroupAppService :
        AsyncCrudAppService<
            FaultGroup,           // Entity
            FaultGroupDto,        // DTO
            int,                  // Primary key
            GetAllFaultGroupInput, // GetAll input
            CreateFaultGroupInput, // Create input
            UpdateFaultGroupInput  // Update input
        >,
        IFaultGroupAppService
    {
        private readonly ILocalizedMessageService _localizedMessageService;
        private readonly IRepository<ApplicationLanguageText, long> _languageTextRepository;
        private readonly ILogger<FaultGroupAppService> _logger;
        private readonly IAbpSession _abpSession;
        private readonly LocalizationManager _localizationManager;

        public FaultGroupAppService(
            IRepository<FaultGroup, int> repository,
            ILocalizedMessageService localizedMessageService,
            IRepository<ApplicationLanguageText, long> languageTextRepository,
            LocalizationManager localizationManager,
            ILogger<FaultGroupAppService> logger,
            IAbpSession abpSession)
            : base(repository)
        {
            _localizedMessageService = localizedMessageService;
            _languageTextRepository = languageTextRepository;
            _logger = logger;
            _abpSession = abpSession;
            _localizationManager = localizationManager;
        }

        public override async Task<FaultGroupDto> CreateAsync(CreateFaultGroupInput input)
        {
            CheckCreatePermission();

            if (string.IsNullOrWhiteSpace(input.Title))
            {
                throw new Abp.UI.UserFriendlyException("Fault group title cannot be empty.");
            }

            var faultGroup = ObjectMapper.Map<FaultGroup>(input);
            faultGroup.TenantId = _abpSession.TenantId ?? null;

            await Repository.InsertAsync(faultGroup);

            return ObjectMapper.Map<FaultGroupDto>(faultGroup);
        }

        public override async Task<FaultGroupDto> UpdateAsync(UpdateFaultGroupInput input)
        {
            CheckUpdatePermission();

            if (string.IsNullOrWhiteSpace(input.Title))
            {
                throw new Abp.UI.UserFriendlyException("Fault group title cannot be empty.");
            }

            var faultGroup = await Repository.GetAsync(input.Id);
            if (faultGroup == null)
            {
                throw new Abp.UI.UserFriendlyException($"Fault group with ID {input.Id} not found.");
            }

            ObjectMapper.Map(input, faultGroup);
            var result = await base.UpdateAsync(input);
            return result;
        }

        public override async Task DeleteAsync(EntityDto<int> input)
        {
            CheckDeletePermission();

            var faultGroup = await Repository.GetAsync(input.Id);
            if (faultGroup == null)
            {
                throw new Abp.UI.UserFriendlyException($"Fault group with ID {input.Id} not found.");
            }
            await _localizationManager.DeleteByKeyAsync(faultGroup.Title);

            await base.DeleteAsync(input);
        }

        public override async Task<FaultGroupDto> GetAsync(EntityDto<int> input)
        {
            CheckGetPermission();

            var faultGroup = await Repository.GetAsync(input.Id);
            if (faultGroup == null)
            {
                throw new Abp.UI.UserFriendlyException($"Fault group with ID {input.Id} not found.");
            }

            var result = await base.GetAsync(input);
            result.Title = _localizedMessageService.L($"{result.Title}");
            return result;
        }

        public override async Task<PagedResultDto<FaultGroupDto>> GetAllAsync(GetAllFaultGroupInput input)
        {
            CheckGetAllPermission();
            _logger.LogInformation("Retrieving all fault groups with Filter: {Filter}, Language: {Language}", input.Keyword, CultureInfo.CurrentUICulture.Name);

            var query = CreateFilteredQuery(input);
            query = ApplySorting(query, input);

            var totalCount = await query.CountAsync();
            _logger.LogInformation("Found {Count} fault groups for keyword: {Keyword}", totalCount, input.Keyword);

            var rawItems = await query
                .Select(x => new
                {
                    x.Id,
                    x.Title
                })
                .PageBy(input)
                .ToListAsync();

            var items = rawItems.Select(x => new FaultGroupDto
            {
                Id = x.Id,
                Title = _localizedMessageService.L(x.Title)
            }).ToList();

            return new PagedResultDto<FaultGroupDto>(totalCount, items);
        }

        public async Task<FaultGroupDto> GetFaultGroupForEdit(EntityDto input)
        {
            CheckGetPermission();

            var faultGroup = await Repository.GetAsync(input.Id);
            if (faultGroup == null)
            {
                throw new Abp.UI.UserFriendlyException($"Fault group with ID {input.Id} not found.");
            }

            var result = await base.GetAsync(input);
            return result;
        }

        protected override IQueryable<FaultGroup> CreateFilteredQuery(GetAllFaultGroupInput input)
        {
            var query = Repository.GetAll();
            var language = CultureInfo.CurrentUICulture.Name ?? "en";
            var source = "HelpDesk";
            var tenantId = _abpSession.TenantId;

            _logger.LogDebug("Creating filtered query with Keyword: {Keyword}, Language: {Language}, TenantId: {TenantId}", input.Keyword, language, tenantId);

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                query = from faultGroup in query
                        join translation in _languageTextRepository.GetAll()
                            on new { Name = faultGroup.Title, LanguageName = language, Source = source, TenantId = tenantId }
                            equals new { Name = translation.Key, translation.LanguageName, translation.Source, translation.TenantId }
                            into translations
                        from translation in translations.DefaultIfEmpty()
                        where translation != null && translation.Value.Contains(input.Keyword)
                        select faultGroup;

                query = query.Distinct();
                _logger.LogDebug("Query filtered with keyword: {Keyword}, found {Count} results", input.Keyword, query.Count());
            }

            return query;
        }

        protected override IQueryable<FaultGroup> ApplySorting(IQueryable<FaultGroup> query, GetAllFaultGroupInput input)
        {
            return query.OrderBy(!string.IsNullOrWhiteSpace(input.Sorting) ? input.Sorting : "Title");
        }

        protected override async Task<FaultGroup> GetEntityByIdAsync(int id)
        {
            var faultGroup = await Repository.GetAll().FirstOrDefaultAsync(x => x.Id == id);
            if (faultGroup == null)
            {
                throw new Abp.UI.UserFriendlyException($"Fault group with ID {id} not found.");
            }
            return faultGroup;
        }
    }
}