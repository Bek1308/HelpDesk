using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.Issues.Dto;
using System.Threading.Tasks;

namespace HelpDesk.Issues
{
    public interface IIssuesHistoryAppService
    {
        Task<PagedResultDto<IssuesHistoryDto>> GetHistoryByIssueIdAsync(GetHistoryByIssueInput input);
    }
}