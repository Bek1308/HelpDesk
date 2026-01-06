// BonusSystemUserAppService.cs
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using HelpDesk.Authorization.Users;
using HelpDesk.BonusSystem.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HelpDesk.BonusSystem
{
    public class BonusSystemUserAppService :
        AsyncCrudAppService<BonusSystemUser, BonusSystemUserDto, long, GetAllBonusSystemUsersInput, CreateBonusSystemUserDto, EditBonusSystemUserDto>,
        IBonusSystemUserAppService
    {
        private readonly IRepository<BonusSystemUser, long> _bonusSystemUserRepository;
        private readonly IAbpSession _abpSession;
        private readonly ILogger<BonusSystemUserAppService> _logger;

        public BonusSystemUserAppService(
            IRepository<BonusSystemUser, long> bonusSystemUserRepository,
            IAbpSession abpSession,
            ILogger<BonusSystemUserAppService> logger)
            : base(bonusSystemUserRepository)
        {
            _bonusSystemUserRepository = bonusSystemUserRepository;
            _abpSession = abpSession;
            _logger = logger;
        }

        public override async Task<PagedResultDto<BonusSystemUserDto>> GetAllAsync(GetAllBonusSystemUsersInput input)
        {
            var query = CreateFilteredQuery(input);

            var totalCount = await query.CountAsync();

            // To'g'ri: Expression orqali
            var sortedQuery = string.IsNullOrWhiteSpace(input.Sorting)
                ? query.OrderBy(x => x.User.Name).ThenBy(x => x.User.Surname)
                : ApplySorting(query, input.Sorting);

            var items = await sortedQuery
                .PageBy(input)
                .ToListAsync();

            return new PagedResultDto<BonusSystemUserDto>(totalCount, ObjectMapper.Map<List<BonusSystemUserDto>>(items));
        }

        // Helper metod
        private IQueryable<BonusSystemUser> ApplySorting(IQueryable<BonusSystemUser> query, string sorting)
        {
            return sorting.ToLower() switch
            {
                "user.name" => query.OrderBy(x => x.User.Name).ThenBy(x => x.User.Surname),
                "user.name desc" => query.OrderByDescending(x => x.User.Name).ThenByDescending(x => x.User.Surname),
                "user.email" => query.OrderBy(x => x.User.EmailAddress),
                "user.email desc" => query.OrderByDescending(x => x.User.EmailAddress),
                "bonussystem.name" => query.OrderBy(x => x.BonusSystem.Name),
                "bonussystem.name desc" => query.OrderByDescending(x => x.BonusSystem.Name),
                "creationtime" => query.OrderBy(x => x.CreationTime),
                "creationtime desc" => query.OrderByDescending(x => x.CreationTime),
                _ => query.OrderBy(x => x.User.Name).ThenBy(x => x.User.Surname)
            };
        }

        protected IQueryable<BonusSystemUser> CreateFilteredQuery(GetAllBonusSystemUsersInput input)
        {
            var query = _bonusSystemUserRepository.GetAllIncluding(x => x.User, x => x.BonusSystem)
                .Where(x => x.TenantId == _abpSession.TenantId);

            if (input.BonusSystemId.HasValue)
                query = query.Where(x => x.BonusSystemId == input.BonusSystemId.Value);

            if (input.UserId.HasValue)
                query = query.Where(x => x.UserId == input.UserId.Value);

            if (!input.Keyword.IsNullOrEmpty())
            {
                query = query.Where(x =>
                    x.User.Name.Contains(input.Keyword) ||
                    x.User.Surname.Contains(input.Keyword) ||
                    x.User.EmailAddress.Contains(input.Keyword) ||
                    x.BonusSystem.Name.Contains(input.Keyword)
                );
            }

            if (input.IsActive.HasValue)
                query = query.Where(x => x.BonusSystem.IsActive == input.IsActive.Value);

            if (input.AmountMin.HasValue)
                query = query.Where(x => x.BonusSystem.Amount >= input.AmountMin.Value);

            if (input.AmountMax.HasValue)
                query = query.Where(x => x.BonusSystem.Amount <= input.AmountMax.Value);

            if (input.CreationTimeStart.HasValue)
                query = query.Where(x => x.CreationTime >= input.CreationTimeStart.Value);

            if (input.CreationTimeEnd.HasValue)
                query = query.Where(x => x.CreationTime <= input.CreationTimeEnd.Value);

            return query;
        }

        public override async Task<BonusSystemUserDto> CreateAsync(CreateBonusSystemUserDto input)
        {
            var exists = await _bonusSystemUserRepository.FirstOrDefaultAsync(x =>
                x.BonusSystemId == input.BonusSystemId && x.UserId == input.UserId && x.TenantId == _abpSession.TenantId);

            if (exists != null)
                throw new UserFriendlyException("Already assigned");

            var entity = ObjectMapper.Map<BonusSystemUser>(input);
            entity.TenantId = _abpSession.TenantId;
            await _bonusSystemUserRepository.InsertAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(entity);
        }

        public override async Task<BonusSystemUserDto> UpdateAsync(EditBonusSystemUserDto input)
        {
            var entity = await _bonusSystemUserRepository.GetAsync(input.Id);
            var conflict = await _bonusSystemUserRepository.FirstOrDefaultAsync(x =>
                x.BonusSystemId == input.BonusSystemId && x.UserId == input.UserId &&
                x.TenantId == _abpSession.TenantId && x.Id != input.Id);

            if (conflict != null)
                throw new UserFriendlyException("Already assigned");

            ObjectMapper.Map(input, entity);
            await _bonusSystemUserRepository.UpdateAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(entity);
        }

        public async Task<ListResultDto<BonusSystemUserDto>> GetByBonusSystemAsync(EntityDto<long> input)
        {
            var items = await _bonusSystemUserRepository.GetAllIncluding(x => x.User)
                .Where(x => x.BonusSystemId == input.Id && x.TenantId == _abpSession.TenantId)
                .OrderBy(x => x.User.Name)
                .ToListAsync();

            return new ListResultDto<BonusSystemUserDto>(ObjectMapper.Map<List<BonusSystemUserDto>>(items));
        }

        public async Task<ListResultDto<BonusSystemUserDto>> GetByUserAsync(EntityDto<long> input)
        {
            var items = await _bonusSystemUserRepository.GetAllIncluding(x => x.BonusSystem)
                .Where(x => x.UserId == input.Id && x.TenantId == _abpSession.TenantId)
                .OrderBy(x => x.BonusSystem.Name)
                .ToListAsync();

            return new ListResultDto<BonusSystemUserDto>(ObjectMapper.Map<List<BonusSystemUserDto>>(items));
        }
    }
}