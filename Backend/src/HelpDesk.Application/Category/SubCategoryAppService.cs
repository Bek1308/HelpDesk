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
using HelpDesk.Category.Dto.SubCategories;
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
    //[AbpAuthorize(PermissionNames.Pages_SubCategories)]
    public class SubCategoryAppService :
        AsyncCrudAppService<
            SubCategories,           // Entity
            SubCategoryDto,          // DTO
            int,                     // Primary key
            GetAllSubCategoryInput,  // GetAll input
            CreateSubCategoryInput,  // Create input
            UpdateSubCategoryInput   // Update input
        >,
        ISubCategoryAppService
    {
        private readonly IRepository<Categories, int> _categoryRepository;
        private readonly ILocalizedMessageService _localizedMessageService;
        private readonly IRepository<ApplicationLanguageText, long> _languageTextRepository;
        private readonly ILogger<SubCategoryAppService> _logger;
        private readonly IAbpSession _abpSession;

        public SubCategoryAppService(
            ILocalizedMessageService localizedMessageService,
            IRepository<SubCategories, int> repository,
            IRepository<Categories, int> categoryRepository,
            IRepository<ApplicationLanguageText, long> languageTextRepository,
            ILogger<SubCategoryAppService> logger,
            IAbpSession abpSession)
            : base(repository)
        {
            _categoryRepository = categoryRepository;
            _localizedMessageService = localizedMessageService;
            _languageTextRepository = languageTextRepository;
            _logger = logger;
            _abpSession = abpSession;
        }

        public override async Task<SubCategoryDto> CreateAsync(CreateSubCategoryInput input)
        {
            CheckCreatePermission();


            await EnsureCategoryExists(input.CategoryId);

            var subCategory = ObjectMapper.Map<SubCategories>(input);

         
            subCategory.TenantId = _abpSession.TenantId;

            await Repository.InsertAsync(subCategory);

            return ObjectMapper.Map<SubCategoryDto>(subCategory);
        }


        public override async Task<SubCategoryDto> UpdateAsync(UpdateSubCategoryInput input)
        {
            CheckUpdatePermission();
            await EnsureCategoryExists(input.CategoryId);
            var subCategory = await Repository.GetAsync(input.Id);
            ObjectMapper.Map(input, subCategory);
            return await base.UpdateAsync(input);
        }

        public override async Task DeleteAsync(EntityDto<int> input)
        {
            CheckDeletePermission();
            await base.DeleteAsync(input);
        }
        public override async Task<SubCategoryDto> GetAsync(EntityDto<int> input)
        {
            CheckGetPermission();
            var subCategory = await Repository.GetAllIncluding(x => x.Category)
                .Where(x => x.Id == input.Id)
                .Select(x => new SubCategoryDto
                {
                    Id = x.Id,
                    Title = _localizedMessageService.L($"{x.Title}"),
                    CategoryId = x.CategoryId,
                    CategoryName = _localizedMessageService.L($"{x.Category.Title}"),
                   
                })
                .FirstOrDefaultAsync();

            if (subCategory == null)
            {
                throw new Abp.UI.UserFriendlyException(L("SubCategoryNotFound", input.Id));
            }

            return subCategory;
        }
        public override async Task<PagedResultDto<SubCategoryDto>> GetAllAsync(GetAllSubCategoryInput input)
        {
            CheckGetAllPermission();
            _logger.LogInformation("Retrieving all subcategories with Filter: {Filter}, Language: {Language}", input.Keyword, CultureInfo.CurrentUICulture.Name);

            var query = CreateFilteredQuery(input);
            query = ApplySorting(query, input);

            var totalCount = await query.CountAsync();
            _logger.LogInformation("Found {Count} subcategories for keyword: {Keyword}", totalCount, input.Keyword);

            var rawItems = await query
                .Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.CategoryId,
                    CategoryTitle = x.Category.Title
                })
                .PageBy(input)
                .ToListAsync();

            var items = rawItems.Select(x => new SubCategoryDto
            {
                Id = x.Id,
                Title = _localizedMessageService.L(x.Title),
                CategoryId = x.CategoryId,
                CategoryName = _localizedMessageService.L(x.CategoryTitle)
            }).ToList();

            return new PagedResultDto<SubCategoryDto>(totalCount, items);
        }

        public async Task<SubCategoryDto> GetSubCategoryForEdit(EntityDto input)
        {
            CheckGetPermission();
            var subCategory = await Repository.GetAllIncluding(x => x.Category)
                .Where(x => x.Id == input.Id)
                .Select(x => new SubCategoryDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    CategoryId = x.CategoryId,
                    CategoryName = x.Category.Title
                })
                .FirstOrDefaultAsync();

            if (subCategory == null)
            {
                throw new Abp.UI.UserFriendlyException(L("SubCategoryNotFound", input.Id));
            }

            return subCategory;
        }

        protected override IQueryable<SubCategories> CreateFilteredQuery(GetAllSubCategoryInput input)
        {
            var query = Repository.GetAllIncluding(x => x.Category);
            var language = CultureInfo.CurrentUICulture.Name ?? "en";
            var source = "HelpDesk";
            var tenantId = _abpSession.TenantId;

            _logger.LogDebug("Creating filtered query with Keyword: {Keyword}, Language: {Language}, TenantId: {TenantId}", input.Keyword, language, tenantId);

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                query = from subCategory in query
                        join titleTranslation in _languageTextRepository.GetAll()
                            on new { Title = subCategory.Title, LanguageName = language, Source = source, TenantId = tenantId }
                            equals new { Title = titleTranslation.Key, titleTranslation.LanguageName, titleTranslation.Source, titleTranslation.TenantId }
                            into titleTranslations
                        from titleTranslation in titleTranslations.DefaultIfEmpty()
                        join categoryTranslation in _languageTextRepository.GetAll()
                            on new { Title = subCategory.Category.Title, LanguageName = language, Source = source, TenantId = tenantId }
                            equals new { Title = categoryTranslation.Key, categoryTranslation.LanguageName, categoryTranslation.Source, categoryTranslation.TenantId }
                            into categoryTranslations
                        from categoryTranslation in categoryTranslations.DefaultIfEmpty()
                        where (titleTranslation != null && titleTranslation.Value.Contains(input.Keyword)) ||
                              (categoryTranslation != null && categoryTranslation.Value.Contains(input.Keyword))
                        select subCategory;

                query = query.Distinct();
                _logger.LogDebug("Query filtered with keyword: {Keyword}, found {Count} results", input.Keyword, query.Count());
            }

            return query;
        }

        protected override IQueryable<SubCategories> ApplySorting(IQueryable<SubCategories> query, GetAllSubCategoryInput input)
        {
            var sorting = !string.IsNullOrWhiteSpace(input.Sorting) ? input.Sorting : "Title ASC";
            var sortParts = sorting.Split(' ');
            var sortField = sortParts[0];
            var sortOrder = sortParts.Length > 1 ? sortParts[1].ToUpper() : "ASC";

            if (sortField.Equals("categoryName", StringComparison.OrdinalIgnoreCase))
            {
                return sortOrder == "ASC"
                    ? query.OrderBy(x => x.Category.Title)
                    : query.OrderByDescending(x => x.Category.Title);
            }
            else
            {
                return query.OrderBy(sorting);
            }
        }

        protected override async Task<SubCategories> GetEntityByIdAsync(int id)
        {
            return await Repository.GetAllIncluding(x => x.Category).FirstOrDefaultAsync(x => x.Id == id);
        }

        private async Task EnsureCategoryExists(int categoryId)
        {
            var category = await _categoryRepository.FirstOrDefaultAsync(c => c.Id == categoryId);
            if (category == null)
            {
                throw new Abp.UI.UserFriendlyException(L("CategoryNotFound", categoryId));
            }
        }
    }
}