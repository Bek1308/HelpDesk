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
using HelpDesk.IssuesTypes.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace HelpDesk.IssuesTypes
{
    //[AbpAuthorize(PermissionNames.Pages_IssueTypes)]
    public class IssueTypesAppService :
        AsyncCrudAppService<
            IssueTypes,              // Entity
            IssueTypeDto,            // DTO
            int,                     // Primary key
            GetAllIssueTypeInput,    // GetAll input
            CreateIssueTypeInputDto, // Create input
            UpdateIssueTypeInputDto  // Update input
        >,
        IIssueTypesAppService
    {
        private readonly ILocalizedMessageService _localizedMessageService;
        private readonly IRepository<ApplicationLanguageText, long> _languageTextRepository;
        private readonly ILogger<IssueTypesAppService> _logger;
        private readonly IAbpSession _abpSession;

        public IssueTypesAppService(
            IRepository<IssueTypes, int> repository,
            ILocalizedMessageService localizedMessageService,
            IRepository<ApplicationLanguageText, long> languageTextRepository,
            ILogger<IssueTypesAppService> logger,
            IAbpSession abpSession)
            : base(repository)
        {
            _localizedMessageService = localizedMessageService;
            _languageTextRepository = languageTextRepository;
            _logger = logger;
            _abpSession = abpSession;
        }

        public override async Task<IssueTypeDto> CreateAsync(CreateIssueTypeInputDto input)
        {
            CheckCreatePermission();

            if (string.IsNullOrWhiteSpace(input.Title))
                throw new UserFriendlyException(_localizedMessageService.L("InvalidTitle"));

            var issueType = ObjectMapper.Map<IssueTypes>(input);
            issueType.TenantId = _abpSession.TenantId;

            await Repository.InsertAsync(issueType);

            var result = ObjectMapper.Map<IssueTypeDto>(issueType);
            result.Title = _localizedMessageService.L(result.Title);
            result.Description = input.Description != null ? _localizedMessageService.L(input.Description) : null;

            return result;
        }


        public override async Task<IssueTypeDto> UpdateAsync(UpdateIssueTypeInputDto input)
        {
            CheckUpdatePermission();
            _logger.LogInformation("Updating issue type with ID: {Id}, Title: {Title}, Description: {Description}", input.Id, input.Title, input.Description);

            if (string.IsNullOrWhiteSpace(input.Title))
            {
                throw new UserFriendlyException(_localizedMessageService.L("InvalidTitle"));
            }

            var issueType = await Repository.GetAsync(input.Id);
            ObjectMapper.Map(input, issueType);
            await Repository.UpdateAsync(issueType);
            var result = ObjectMapper.Map<IssueTypeDto>(issueType);
            result.Title = _localizedMessageService.L(result.Title);
            result.Description = issueType.Description != null ? _localizedMessageService.L(issueType.Description) : null;
            return result;
        }

        public override async Task DeleteAsync(EntityDto<int> input)
        {
            CheckDeletePermission();
            _logger.LogInformation("Deleting issue type with ID: {Id}", input.Id);
            await base.DeleteAsync(input);
            _logger.LogInformation("Issue type deleted successfully with ID: {Id}", input.Id);
        }

        public override async Task<IssueTypeDto> GetAsync(EntityDto<int> input)
        {
            CheckGetPermission();
            _logger.LogInformation("Retrieving issue type with ID: {Id}", input.Id);
            var issueType = await Repository.GetAsync(input.Id);
            if (issueType == null)
            {
                _logger.LogWarning("Issue type with ID {Id} not found", input.Id);
                throw new UserFriendlyException(_localizedMessageService.L("IssueTypeNotFound"));
            }
            var result = ObjectMapper.Map<IssueTypeDto>(issueType);
            result.Title = _localizedMessageService.L(result.Title);
            result.Description = issueType.Description != null ? _localizedMessageService.L(issueType.Description) : null;
            return result;
        }

        public override async Task<PagedResultDto<IssueTypeDto>> GetAllAsync(GetAllIssueTypeInput input)
        {
            CheckGetAllPermission();
            _logger.LogInformation("Retrieving all issue types with Filter: {Filter}, Language: {Language}", input.Keyword, CultureInfo.CurrentUICulture.Name);

            var query = CreateFilteredQuery(input);
            query = ApplySorting(query, input);

            var totalCount = await query.CountAsync();
            _logger.LogInformation("Found {Count} issue types for keyword: {Keyword}", totalCount, input.Keyword);

            var rawItems = await query
                .Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.Description
                })
                .PageBy(input)
                .ToListAsync();

            var items = rawItems.Select(x => new IssueTypeDto
            {
                Id = x.Id,
                Title = _localizedMessageService.L(x.Title),
                Description = x.Description != null ? _localizedMessageService.L(x.Description) : null
            }).ToList();

            return new PagedResultDto<IssueTypeDto>(totalCount, items);
        }
        public  async Task<IssueTypeDto> GetIssueTypeForEditAsync(EntityDto<int> input)
        {
            CheckGetPermission();
            _logger.LogInformation("Retrieving issue type with ID: {Id}", input.Id);
            var issueType = await Repository.GetAsync(input.Id);
            if (issueType == null)
            {
                _logger.LogWarning("Issue type with ID {Id} not found", input.Id);
                throw new UserFriendlyException(L("IssueTypeNotFound"));
            }
            var result = ObjectMapper.Map<IssueTypeDto>(issueType);
            return result;
        }


        protected override IQueryable<IssueTypes> CreateFilteredQuery(GetAllIssueTypeInput input)
        {
            var query = Repository.GetAll();
            var language = CultureInfo.CurrentUICulture.Name ?? "en";
            var source = "HelpDesk";
            var tenantId = _abpSession.TenantId;

            _logger.LogDebug("Creating filtered query with Keyword: {Keyword}, Language: {Language}, TenantId: {TenantId}", input.Keyword, language, tenantId);

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                query = from issueType in query
                        join titleTranslation in _languageTextRepository.GetAll()
                            on new { Name = issueType.Title, LanguageName = language, Source = source, TenantId = tenantId }
                            equals new { Name = titleTranslation.Key, titleTranslation.LanguageName, titleTranslation.Source, titleTranslation.TenantId }
                            into titleTranslations
                        from titleTranslation in titleTranslations.DefaultIfEmpty()
                        join descTranslation in _languageTextRepository.GetAll()
                            on new { Name = issueType.Description, LanguageName = language, Source = source, TenantId = tenantId }
                            equals new { Name = descTranslation.Key, descTranslation.LanguageName, descTranslation.Source, descTranslation.TenantId }
                            into descTranslations
                        from descTranslation in descTranslations.DefaultIfEmpty()
                        where (titleTranslation != null && titleTranslation.Value.Contains(input.Keyword)) ||
                              (descTranslation != null && descTranslation.Value.Contains(input.Keyword))
                        select issueType;

                query = query.Distinct();
                _logger.LogDebug("Query filtered with keyword: {Keyword}, found {Count} results", input.Keyword, query.Count());
            }

            return query;
        }

        protected override IQueryable<IssueTypes> ApplySorting(IQueryable<IssueTypes> query, GetAllIssueTypeInput input)
        {
            return query.OrderBy(!string.IsNullOrWhiteSpace(input.Sorting) ? input.Sorting : "Title");
        }

        protected override async Task<IssueTypes> GetEntityByIdAsync(int id)
        {
            var issueType = await Repository.GetAll().FirstOrDefaultAsync(x => x.Id == id);
            if (issueType == null)
            {
                throw new UserFriendlyException(_localizedMessageService.L("IssueTypeNotFound"));
            }
            return issueType;
        }
    }
}