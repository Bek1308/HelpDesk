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
using HelpDesk.Services.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace HelpDesk.Services
{
    [AbpAuthorize(PermissionNames.Pages_Services)]
    public class ServiceAppService :
        AsyncCrudAppService<
            Services,
            ServiceDto,
            int,
            GetAllServiceInput,
            CreateServiceInput,
            UpdateServiceInput
        >,
        IServiceAppService
    {
        private readonly ILogger<ServiceAppService> _logger;
        private readonly ILocalizedMessageService _localizedMessageService;
        private readonly IRepository<ApplicationLanguageText, long> _languageTextRepository;
        private readonly IAbpSession _abpSession;

        public ServiceAppService(
            IRepository<Services, int> repository,
            ILogger<ServiceAppService> logger,
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

        public override async Task<ServiceDto> CreateAsync(CreateServiceInput input)
        {
            CheckCreatePermission();

            if (string.IsNullOrWhiteSpace(input.Name) || input.Name.Length > 100)
                throw new UserFriendlyException(_localizedMessageService.L("InvalidNameLength"));

            var entity = ObjectMapper.Map<Services>(input);
            entity.TenantId = AbpSession.TenantId;

            await Repository.InsertAsync(entity);

            var result = ObjectMapper.Map<ServiceDto>(entity);
            result.Name = _localizedMessageService.L(result.Name);

            return result;
        }


        public override async Task<ServiceDto> UpdateAsync(UpdateServiceInput input)
        {
            CheckUpdatePermission();
            _logger.LogInformation("Updating service with ID: {Id}, Name: {Name}", input.Id, input.Name);

            if (string.IsNullOrWhiteSpace(input.Name) || input.Name.Length > 100)
            {
                throw new UserFriendlyException(_localizedMessageService.L("InvalidNameLength"));
            }

            var service = await Repository.GetAsync(input.Id);
            ObjectMapper.Map(input, service);
            var result = await base.UpdateAsync(input);
            _logger.LogInformation("Service updated successfully with ID: {Id}", result.Id);
            result.Name = _localizedMessageService.L(result.Name);
            return result;
        }

        public override async Task DeleteAsync(EntityDto<int> input)
        {
            CheckDeletePermission();
            _logger.LogInformation("Deleting service with ID: {Id}", input.Id);
            await base.DeleteAsync(input);
            _logger.LogInformation("Service deleted successfully with ID: {Id}", input.Id);
        }

        public override async Task<ServiceDto> GetAsync(EntityDto<int> input)
        {
            CheckGetPermission();
            _logger.LogInformation("Retrieving service with ID: {Id}", input.Id);
            var result = await base.GetAsync(input);
            if (result == null)
            {
                _logger.LogWarning("Service with ID {Id} not found", input.Id);
                throw new UserFriendlyException(_localizedMessageService.L("ServiceNotFound"));
            }
            result.Name = _localizedMessageService.L(result.Name);
            return result;
        }

        public override async Task<PagedResultDto<ServiceDto>> GetAllAsync(GetAllServiceInput input)
        {
            CheckGetAllPermission();
            _logger.LogInformation("Retrieving all services with Filter: {Filter}, Language: {Language}", input.Keyword, CultureInfo.CurrentUICulture.Name);
            var query = CreateFilteredQuery(input);
            query = ApplySorting(query, input);

            var totalCount = await query.CountAsync();
            _logger.LogInformation("Found {Count} services for keyword: {Keyword}", totalCount, input.Keyword);
            var rawItems = await query
                .Select(x => new
                {
                    x.Id,
                    x.Name
                })
                .PageBy(input)
                .ToListAsync();

            var items = rawItems.Select(x => new ServiceDto
            {
                Id = x.Id,
                Name = _localizedMessageService.L(x.Name)
            }).ToList();

            return new PagedResultDto<ServiceDto>(totalCount, items);
        }

        public async Task<ServiceDto> GetServiceForEdit(EntityDto input)
        {
            CheckGetPermission();
            
            var result = await base.GetAsync(input);
            if (result == null)
            {
                
                throw new UserFriendlyException(_localizedMessageService.L("ServiceNotFound"));
            }
            return result;
        }

        protected override IQueryable<Services> CreateFilteredQuery(GetAllServiceInput input)
        {
            var query = Repository.GetAll();
            var language = CultureInfo.CurrentUICulture.Name ?? "en";
            var source = "HelpDesk";
            var tenantId = _abpSession.TenantId;

           

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                query = from service in query
                        join translation in _languageTextRepository.GetAll()
                            on new { Name = service.Name, LanguageName = language, Source = source, TenantId = tenantId }
                            equals new { Name = translation.Key, translation.LanguageName, translation.Source, translation.TenantId }
                            into translations
                        from translation in translations.DefaultIfEmpty()
                        where translation != null && translation.Value.Contains(input.Keyword)
                        select service;

                query = query.Distinct();
                
            }

            return query;
        }

        protected override IQueryable<Services> ApplySorting(IQueryable<Services> query, GetAllServiceInput input)
        {
            var sorting = !string.IsNullOrWhiteSpace(input.Sorting) ? input.Sorting : "Name";
            return query.OrderBy(sorting);
        }

        protected override async Task<Services> GetEntityByIdAsync(int id)
        {
            return await Repository.GetAll().FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}