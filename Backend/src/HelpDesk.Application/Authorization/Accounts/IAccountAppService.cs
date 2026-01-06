using Abp.Application.Services;
using HelpDesk.Authorization.Accounts.Dto;
using System.Threading.Tasks;

namespace HelpDesk.Authorization.Accounts;

public interface IAccountAppService : IApplicationService
{
    Task<IsTenantAvailableOutput> IsTenantAvailable(IsTenantAvailableInput input);

    Task<RegisterOutput> Register(RegisterInput input);
}
