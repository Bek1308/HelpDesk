using Abp.Application.Services;
using HelpDesk.Sessions.Dto;
using System.Threading.Tasks;

namespace HelpDesk.Sessions;

public interface ISessionAppService : IApplicationService
{
    Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations();
}
