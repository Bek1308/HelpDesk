using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using HelpDesk.MultiTenancy;

namespace HelpDesk.Sessions.Dto;

[AutoMapFrom(typeof(Tenant))]
public class TenantLoginInfoDto : EntityDto
{
    public string TenancyName { get; set; }

    public string Name { get; set; }
}
