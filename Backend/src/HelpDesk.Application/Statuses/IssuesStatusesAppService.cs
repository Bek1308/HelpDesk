using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using HelpDesk.Application.Localization;
using HelpDesk.Authorization;
using HelpDesk.Statuses.Dto;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace HelpDesk.Statuses
{
    /// <summary>
    /// Application service for managing issue statuses.
    /// Provides CRUD operations.
    /// </summary>
    public class IssuesStatusesAppService :
        AsyncCrudAppService<
            IssuesStatuses,               // Entity
            IssuesStatusesDto,            // DTO for Get/GetAll
            int,                          // Primary key
            GetAllIssuesStatusesInput,    // GetAll input
            CreateIssuesStatusesDto,       // Create input
            IssuesStatusesInputDto        // Update input
        >,
        IIssuesStatusesAppService
    {

        private readonly ILocalizedMessageService _localizedMessageService;
        public IssuesStatusesAppService(
            ILocalizedMessageService localizedMessageService,
            IRepository<IssuesStatuses, int> repository)
            : base(repository)
        {
            _localizedMessageService = localizedMessageService;
        }

        public override async Task<IssuesStatusesDto> CreateAsync(CreateIssuesStatusesDto input)
        {
            CheckCreatePermission();

            var status = ObjectMapper.Map<IssuesStatuses>(input);
            await Repository.InsertAsync(status);
            return ObjectMapper.Map<IssuesStatusesDto>(status);
        }

        public override async Task<IssuesStatusesDto> UpdateAsync(IssuesStatusesInputDto input)
        {
            CheckUpdatePermission();
            var status = await Repository.GetAsync(input.Id);
            ObjectMapper.Map(input, status);
            await Repository.UpdateAsync(status);
            return ObjectMapper.Map<IssuesStatusesDto>(status);
        }

        public override async Task DeleteAsync(EntityDto<int> input)
        {
            CheckDeletePermission();
            await base.DeleteAsync(input);
        }

        public override async Task<IssuesStatusesDto> GetAsync(EntityDto<int> input)
        {
            CheckGetPermission();
            var status = await Repository.GetAll()
                .FirstOrDefaultAsync(x => x.Id == input.Id);
            if (status == null)
            {
                throw new Abp.UI.UserFriendlyException("Issue status not found.");
            }
            return ObjectMapper.Map<IssuesStatusesDto>(status);
        }

        public override async Task<PagedResultDto<IssuesStatusesDto>> GetAllAsync(GetAllIssuesStatusesInput input)
        {
            CheckGetAllPermission();
            var query = CreateFilteredQuery(input);
            var totalCount = await query.CountAsync();
            var items = await ApplySorting(query, input)
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount)
                .ToListAsync();
            
            var result = items.Select(x => new IssuesStatusesDto { 
                Id = x.Id,
                Title = _localizedMessageService.L(x.Title),
            });
            
            return new PagedResultDto<IssuesStatusesDto>(
                totalCount,
                ObjectMapper.Map<List<IssuesStatusesDto>>(result)
            );
        }

        protected override IQueryable<IssuesStatuses> CreateFilteredQuery(GetAllIssuesStatusesInput input)
        {
            return Repository.GetAll()
                .WhereIf(!input.Keyword.IsNullOrWhiteSpace(),
                    x => x.Title.Contains(input.Keyword));
        }

        protected override IQueryable<IssuesStatuses> ApplySorting(IQueryable<IssuesStatuses> query, GetAllIssuesStatusesInput input)
        {
            var sorting = input.Sorting;
            if (string.IsNullOrWhiteSpace(sorting))
            {
                sorting = "Title ASC";
            }
            return query.OrderBy(sorting);
        }

        protected override async Task<IssuesStatuses> GetEntityByIdAsync(int id)
        {
            var status = await Repository.GetAll()
                .FirstOrDefaultAsync(x => x.Id == id);
            if (status == null)
            {
                throw new Abp.UI.UserFriendlyException("Issue status not found.");
            }
            return status;
        }
    }
}