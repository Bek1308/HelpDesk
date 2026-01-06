using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.Statuses.Dto;
using System.Threading.Tasks;

namespace HelpDesk.Statuses
{
    public interface IIssuesStatusesAppService :
        IAsyncCrudAppService<
            IssuesStatusesDto,            // TEntityDto
            int,                          // Primary Key
            GetAllIssuesStatusesInput,    // GetAll input
            CreateIssuesStatusesDto,       // Create input
            IssuesStatusesInputDto        // Update input
        >
    {
    }
}