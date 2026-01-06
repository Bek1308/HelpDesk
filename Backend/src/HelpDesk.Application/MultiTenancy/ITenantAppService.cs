using Abp.Application.Services;
using HelpDesk.MultiTenancy.Dto;

namespace HelpDesk.MultiTenancy;

public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
{
}

