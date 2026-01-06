using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Localization;
using Abp.UI;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace HelpDesk.Application.Localization
{
    public class LocalizationAppService : AsyncCrudAppService<ApplicationLanguageText, LanguageTextDto, long, GetLanguageTextsInput, CreateLanguageTextDto, UpdateLanguageTextDto>, ILocalizationAppService
    {
        private readonly IRepository<ApplicationLanguageText, long> _repository;

        public LocalizationAppService(IRepository<ApplicationLanguageText, long> repository) : base(repository)
        {
            _repository = repository;
        }
        public async Task<List<LanguageTextDto>> GetByKeyAsync(string key, string source = "HelpDesk")
        {
            CheckGetPermission();

            if (key.IsNullOrWhiteSpace())
            {
                throw new UserFriendlyException("Localization:KeyIsRequired");
            }

            var entities = await Repository.GetAllListAsync(t =>
                t.Key == key &&
                t.Source == source &&
                t.TenantId == AbpSession.TenantId
            );

            if (!entities.Any())
            {
                throw new UserFriendlyException($"Localization:KeyNotFound{key}");
            }

            return entities.Select(MapToEntityDto).ToList();
        }



        public override async Task<LanguageTextDto> GetAsync(EntityDto<long> input)
        {
            CheckGetPermission();

            var entity = await GetEntityByIdAsync(input.Id);
            return MapToEntityDto(entity);
        }

        public override async Task<PagedResultDto<LanguageTextDto>> GetAllAsync(GetLanguageTextsInput input)
        {
            CheckGetAllPermission();

            var query = CreateFilteredQuery(input);

            var totalCount = await AsyncQueryableExecuter.CountAsync(query);

            var entities = await AsyncQueryableExecuter.ToListAsync(query.PageBy(input));

            return new PagedResultDto<LanguageTextDto>(
                totalCount,
                entities.Select(MapToEntityDto).ToList()
            );
        }

        protected override IQueryable<ApplicationLanguageText> CreateFilteredQuery(GetLanguageTextsInput input)
        {
            return Repository.GetAll()
                .WhereIf(!input.LanguageName.IsNullOrWhiteSpace(), x => x.LanguageName == input.LanguageName)
                .WhereIf(!input.Source.IsNullOrWhiteSpace(), x => x.Source == input.Source)
                .WhereIf(!input.Key.IsNullOrWhiteSpace(), x => x.Key.Contains(input.Key));
        }

        public override async Task<LanguageTextDto> CreateAsync(CreateLanguageTextDto input)
        {
            CheckCreatePermission();
            var existing = await Repository.FirstOrDefaultAsync(t =>
                t.Key == input.Key &&
                t.LanguageName == input.LanguageName &&
                t.Source == input.Source &&
                t.TenantId == AbpSession.TenantId);

            if (existing != null)
            {

                throw new UserFriendlyException("Localization:KeyAlreadyExists");  //NEED TO LOCALIZE
            }

            var entity = MapToEntity(input);
            entity.TenantId = AbpSession.TenantId;

            await Repository.InsertAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(entity);
        }

        public override async Task<LanguageTextDto> UpdateAsync(UpdateLanguageTextDto input)
        {
            CheckUpdatePermission();
            if (input.Key.IsNullOrWhiteSpace())
            {
                throw new UserFriendlyException("Localization:KeyIsRequired");
            }

            var entity = await GetEntityByIdAsync(input.Id);
            MapToEntity(input, entity);
            
            await Repository.UpdateAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(entity);
        }

        public override async Task DeleteAsync(EntityDto<long> input)
        {
            CheckDeletePermission();

            var entity = await GetEntityByIdAsync(input.Id);
            await Repository.DeleteAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        protected override void MapToEntity(UpdateLanguageTextDto updateInput, ApplicationLanguageText entity)
        {
            entity.Key = updateInput.Key;
            entity.Value = updateInput.Value;


        }

        protected override ApplicationLanguageText MapToEntity(CreateLanguageTextDto createInput)
        {
            return new ApplicationLanguageText
            {
                LanguageName = createInput.LanguageName,
                Source = createInput.Source ?? "HelpDesk",
                Key = createInput.Key,
                Value = createInput.Value
            };
        }

        protected override LanguageTextDto MapToEntityDto(ApplicationLanguageText entity)
        {
            return new LanguageTextDto
            {
                Id = entity.Id,
                LanguageName = entity.LanguageName,
                Source = entity.Source,
                Key = entity.Key,
                Value = entity.Value
            };
        }
    }

    public interface ILocalizationAppService : IAsyncCrudAppService<LanguageTextDto, long, GetLanguageTextsInput, CreateLanguageTextDto, UpdateLanguageTextDto>
    {
        Task<List<LanguageTextDto>> GetByKeyAsync(string key, string source = "HelpDesk");
    }

    public class GetLanguageTextsInput : PagedAndSortedResultRequestDto
    {
        public string LanguageName { get; set; }
        public string Source { get; set; }
        public string Key { get; set; }
    }

    public class LanguageTextDto : EntityDto<long>
    {
        public string LanguageName { get; set; }
        public string Source { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
    }

    public class CreateLanguageTextDto
    {
        public string LanguageName { get; set; }
        public string Source { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
    }

    public class UpdateLanguageTextDto : EntityDto<long>
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }
}