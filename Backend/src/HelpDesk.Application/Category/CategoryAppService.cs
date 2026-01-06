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
using HelpDesk.Category.Dto;
using HelpDesk.Domain.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace HelpDesk.Category
{
    //[AbpAuthorize(PermissionNames.Pages_Categories)]
    public class CategoryAppService :
        AsyncCrudAppService<
            Categories,           // Entity
            CategoryDto,          // DTO
            int,                  // Primary key
            GetAllCategoryInput,  // GetAll input
            CreateCategoryInput,  // Create input
            UpdateCategoryInput   // Update input
        >,
        ICategoryAppService
    {
        private readonly ILocalizedMessageService _localizedMessageService;
        private readonly IRepository<ApplicationLanguageText, long> _languageTextRepository;
        private readonly ILogger<CategoryAppService> _logger;
        private readonly IAbpSession _abpSession;
        private readonly LocalizationManager _localizationManager;
        public CategoryAppService(
            IRepository<Categories, int> repository,
            ILocalizedMessageService localizedMessageService,
            IRepository<ApplicationLanguageText, long> languageTextRepository,
            LocalizationManager localizationManager,
            ILogger<CategoryAppService> logger,
            IAbpSession abpSession)
            : base(repository)
        {
            _localizedMessageService = localizedMessageService;
            _languageTextRepository = languageTextRepository;
            _logger = logger;
            _abpSession = abpSession;
            _localizationManager = localizationManager;

        }

        public override async Task<CategoryDto> CreateAsync(CreateCategoryInput input)
        {
            CheckCreatePermission();

            if (string.IsNullOrWhiteSpace(input.Title))
            {
                throw new Abp.UI.UserFriendlyException("Category title cannot be empty.");
            }

            // Entity yaratish
            var category = ObjectMapper.Map<Categories>(input);

            // TenantId ni _abpSession orqali o'rnatish
            category.TenantId = _abpSession.TenantId ?? null;

            // DB ga saqlash
            await Repository.InsertAsync(category);

            return ObjectMapper.Map<CategoryDto>(category);
        }


        public override async Task<CategoryDto> UpdateAsync(UpdateCategoryInput input)
        {
            CheckUpdatePermission();

            if (string.IsNullOrWhiteSpace(input.Title))
            {
                throw new Abp.UI.UserFriendlyException("Category title cannot be empty.");
            }

            var category = await Repository.GetAsync(input.Id);
            if (category == null)
            {
                throw new Abp.UI.UserFriendlyException($"Category with ID {input.Id} not found.");
            }

            ObjectMapper.Map(input, category);
            var result = await base.UpdateAsync(input);
            return result;
        }

        public override async Task DeleteAsync(EntityDto<int> input)
        {
            CheckDeletePermission();

            var category = await Repository.GetAsync(input.Id);
            if (category == null)
            {
                throw new Abp.UI.UserFriendlyException($"Category with ID {input.Id} not found.");
            }
            await _localizationManager.DeleteByKeyAsync(category.Title);

            await base.DeleteAsync(input);
        }

        public override async Task<CategoryDto> GetAsync(EntityDto<int> input)
        {
            CheckGetPermission();

            var category = await Repository.GetAsync(input.Id);
            if (category == null)
            {
                throw new Abp.UI.UserFriendlyException($"Category with ID {input.Id} not found.");
            }

            var result = await base.GetAsync(input);
            result.Title = _localizedMessageService.L($"{result.Title}");
            return result;
        }

        public override async Task<PagedResultDto<CategoryDto>> GetAllAsync(GetAllCategoryInput input)
        {
            CheckGetAllPermission();
            _logger.LogInformation("Retrieving all categories with Filter: {Filter}, Language: {Language}", input.Keyword, CultureInfo.CurrentUICulture.Name);

            var query = CreateFilteredQuery(input);
            query = ApplySorting(query, input);

            var totalCount = await query.CountAsync();
            _logger.LogInformation("Found {Count} categories for keyword: {Keyword}", totalCount, input.Keyword);

            var rawItems = await query
                .Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.Distance
                })
                .PageBy(input)
                .ToListAsync();

            var items = rawItems.Select(x => new CategoryDto
            {
                Id = x.Id,
                Title = _localizedMessageService.L(x.Title),
                Distance = x.Distance
            }).ToList();

            return new PagedResultDto<CategoryDto>(totalCount, items);
        }

        public async Task<CategoryDto> GetCategoryForEdit(EntityDto input)
        {
            CheckGetPermission();

            var category = await Repository.GetAsync(input.Id);
            if (category == null)
            {
                throw new Abp.UI.UserFriendlyException($"Category with ID {input.Id} not found.");
            }

            var result = await base.GetAsync(input);
            return result;
        }

        protected override IQueryable<Categories> CreateFilteredQuery(GetAllCategoryInput input)
        {
            var query = Repository.GetAll();
            var language = CultureInfo.CurrentUICulture.Name ?? "en";
            var source = "HelpDesk";
            var tenantId = _abpSession.TenantId;

            _logger.LogDebug("Creating filtered query with Keyword: {Keyword}, Language: {Language}, TenantId: {TenantId}", input.Keyword, language, tenantId);

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                query = from category in query
                        join translation in _languageTextRepository.GetAll()
                            on new { Name = category.Title, LanguageName = language, Source = source, TenantId = tenantId }
                            equals new { Name = translation.Key, translation.LanguageName, translation.Source, translation.TenantId }
                            into translations
                        from translation in translations.DefaultIfEmpty()
                        where translation != null && translation.Value.Contains(input.Keyword)
                        select category;

                query = query.Distinct();
                _logger.LogDebug("Query filtered with keyword: {Keyword}, found {Count} results", input.Keyword, query.Count());
            }

            return query;
        }

        protected override IQueryable<Categories> ApplySorting(IQueryable<Categories> query, GetAllCategoryInput input)
        {
            return query.OrderBy(!string.IsNullOrWhiteSpace(input.Sorting) ? input.Sorting : "Title");
        }

        protected override async Task<Categories> GetEntityByIdAsync(int id)
        {
            var category = await Repository.GetAll().FirstOrDefaultAsync(x => x.Id == id);
            if (category == null)
            {
                throw new Abp.UI.UserFriendlyException($"Category with ID {id} not found.");
            }
            return category;
        }
    }
}