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
using HelpDesk.Cities.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace HelpDesk.Cities
{
    //[AbpAuthorize(PermissionNames.Pages_Cities)]
    public class CityAppService :
        AsyncCrudAppService<
            City,              // Entity
            CityDto,           // DTO
            int,               // Primary key
            GetAllCityInput,   // GetAll input
            CreateCityInput,   // Create input
            UpdateCityInput    // Update input
        >,
        ICityAppService
    {
        private readonly ILocalizedMessageService _localizedMessageService;
        private readonly IRepository<ApplicationLanguageText, long> _languageTextRepository;
        private readonly ILogger<CityAppService> _logger;
        private readonly IAbpSession _abpSession;

        public CityAppService(
            ILocalizedMessageService localizedMessageService,
            IRepository<City, int> repository,
            IRepository<ApplicationLanguageText, long> languageTextRepository,
            ILogger<CityAppService> logger,
            IAbpSession abpSession)
            : base(repository)
        {
            _localizedMessageService = localizedMessageService;
            _languageTextRepository = languageTextRepository;
            _logger = logger;
            LocalizationSourceName = "HelpDesk";
            _abpSession = abpSession;
        }

        public override async Task<CityDto> CreateAsync(CreateCityInput input)
        {
            CheckCreatePermission();
            _logger.LogDebug("Creating city with Name: {Name}, TenantId: {TenantId}", input.Name, _abpSession.TenantId);

            var city = ObjectMapper.Map<City>(input);
            city.TenantId = _abpSession.TenantId;

            await Repository.InsertAsync(city);
            await CurrentUnitOfWork.SaveChangesAsync(); // Ensure changes are saved

            _logger.LogInformation("City created successfully: Id={Id}, Name={Name}", city.Id, city.Name);
            return ObjectMapper.Map<CityDto>(city);
        }

        public override async Task<CityDto> UpdateAsync(UpdateCityInput input)
        {
            CheckUpdatePermission();
            _logger.LogDebug("Updating city with Id: {Id}, Name: {Name}", input.Id, input.Name);

            var city = await Repository.GetAsync(input.Id);
            if (city == null)
            {
                _logger.LogWarning("City not found for update: Id={Id}", input.Id);
                throw new UserFriendlyException(L("CityNotFound", input.Id));
            }

            ObjectMapper.Map(input, city);
            await Repository.UpdateAsync(city);
            await CurrentUnitOfWork.SaveChangesAsync();

            _logger.LogInformation("City updated successfully: Id={Id}, Name={Name}", city.Id, city.Name);
            return ObjectMapper.Map<CityDto>(city);
        }

        public override async Task DeleteAsync(EntityDto<int> input)
        {
            CheckDeletePermission();
            _logger.LogDebug("Deleting city with Id: {Id}", input.Id);

            var city = await Repository.GetAsync(input.Id);
            if (city == null)
            {
                _logger.LogWarning("City not found for deletion: Id={Id}", input.Id);
                throw new UserFriendlyException(L("CityNotFound", input.Id));
            }

            await Repository.DeleteAsync(city);
            _logger.LogInformation("City deleted successfully: Id={Id}", input.Id);
        }

        public override async Task<CityDto> GetAsync(EntityDto<int> input)
        {
            try
            {
                CheckGetPermission();
                _logger.LogDebug("Fetching city with Id: {Id}, TenantId: {TenantId}", input.Id, _abpSession.TenantId);

                var city = await Repository.GetAll()
                    .Where(x => x.Id == input.Id && (x.TenantId == _abpSession.TenantId || x.TenantId == null))
                    .Select(x => new CityDto
                    {
                        Id = x.Id,
                        Name = x.Name, // Raw name, localization applied if needed
                        Distance = x.Distance,
                        Score = x.Score,
                        Price = x.Price,
                        TenantId = x.TenantId
                    })
                    .FirstOrDefaultAsync();

                if (city == null)
                {
                    _logger.LogWarning("City not found: Id={Id}, TenantId={TenantId}", input.Id, _abpSession.TenantId);
                    throw new UserFriendlyException(L("CityNotFound", input.Id));
                }

                // Apply localization to the Name field
                city.Name = _localizedMessageService.L(city.Name) ?? city.Name;
                _logger.LogDebug("City retrieved: Id={Id}, Name={Name}", city.Id, city.Name);
                return city;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching city with Id: {Id}", input.Id);
                throw;
            }
        }

        public override async Task<PagedResultDto<CityDto>> GetAllAsync(GetAllCityInput input)
        {
            try
            {
                CheckGetAllPermission();
                _logger.LogInformation("Retrieving all cities with Keyword: {Keyword}, Language: {Language}, TenantId: {TenantId}",
                    input.Keyword, CultureInfo.CurrentUICulture.Name, _abpSession.TenantId);

                input.Normalize();
                var query = CreateFilteredQuery(input);
                query = ApplySorting(query, input);

                var totalCount = await query.CountAsync();
                _logger.LogDebug("Found {Count} cities for keyword: {Keyword}", totalCount, input.Keyword);

                var rawItems = await query
                    .Where(x => x.TenantId == _abpSession.TenantId || x.TenantId == null) // Tenant filter
                    .Select(x => new
                    {
                        x.Id,
                        x.Name,
                        x.Distance,
                        x.Score,
                        x.Price,
                        x.TenantId
                    })
                    .PageBy(input)
                    .ToListAsync();

                var items = rawItems.Select(x => new CityDto
                {
                    Id = x.Id,
                    Name = _localizedMessageService.L(x.Name) ?? x.Name, // Fallback to raw name if localization fails
                    Distance = x.Distance,
                    Score = x.Score,
                    Price = x.Price,
                    TenantId = x.TenantId
                }).ToList();

                _logger.LogDebug("Returning {Count} cities", items.Count);
                return new PagedResultDto<CityDto>(totalCount, items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all cities with Keyword: {Keyword}", input.Keyword);
                throw;
            }
        }

        public async Task<CityDto> GetCityForEdit(EntityDto input)
        {
            try
            {
                CheckGetPermission();
                _logger.LogDebug("Fetching city for edit with Id: {Id}, TenantId: {TenantId}", input.Id, _abpSession.TenantId);

                var city = await Repository.GetAll()
                    .Where(x => x.Id == input.Id && (x.TenantId == _abpSession.TenantId || x.TenantId == null))
                    .Select(x => new CityDto
                    {
                        Id = x.Id,
                        Name = x.Name, // Raw name for editing
                        Distance = x.Distance,
                        Score = x.Score,
                        Price = x.Price,
                        TenantId = x.TenantId
                    })
                    .FirstOrDefaultAsync();

                if (city == null)
                {
                    _logger.LogWarning("City not found for edit: Id={Id}, TenantId={TenantId}", input.Id, _abpSession.TenantId);
                    throw new UserFriendlyException(L("CityNotFound", input.Id));
                }

                _logger.LogDebug("City retrieved for edit: Id={Id}, Name={Name}", city.Id, city.Name);
                return city;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching city for edit with Id: {Id}", input.Id);
                throw;
            }
        }

        protected override IQueryable<City> CreateFilteredQuery(GetAllCityInput input)
        {
            var query = Repository.GetAll();
            var language = CultureInfo.CurrentUICulture.Name ?? "en";
            var source = "HelpDesk";
            var tenantId = _abpSession.TenantId;

            _logger.LogDebug("Creating filtered query with Keyword: {Keyword}, Language: {Language}, TenantId: {TenantId}",
                input.Keyword, language, tenantId);

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                query = from city in query
                        join translation in _languageTextRepository.GetAll()
                            on new { Name = city.Name, LanguageName = language, Source = source, TenantId = tenantId }
                            equals new { Name = translation.Key, translation.LanguageName, translation.Source, TenantId = translation.TenantId }
                            into translations
                        from translation in translations.DefaultIfEmpty()
                        where translation == null || translation.Value.Contains(input.Keyword)
                        select city;

                query = query.Where(x => x.Name.Contains(input.Keyword) || x.TenantId == tenantId);
                _logger.LogDebug("Query filtered with keyword: {Keyword}, found {Count} results", input.Keyword, query.Count());
            }

            return query;
        }

        protected override IQueryable<City> ApplySorting(IQueryable<City> query, GetAllCityInput input)
        {
            var sorting = !string.IsNullOrWhiteSpace(input.Sorting) ? input.Sorting : "Name ASC";
            _logger.LogDebug("Applying sorting: {Sorting}", sorting);
            return query.OrderBy(sorting);
        }

        protected override async Task<City> GetEntityByIdAsync(int id)
        {
            var city = await Repository.GetAll()
                .Where(x => x.Id == id && (x.TenantId == _abpSession.TenantId || x.TenantId == null))
                .FirstOrDefaultAsync();

            if (city == null)
            {
                _logger.LogWarning("Entity not found for Id: {Id}, TenantId: {TenantId}", id, _abpSession.TenantId);
            }

            return city;
        }
    }
}