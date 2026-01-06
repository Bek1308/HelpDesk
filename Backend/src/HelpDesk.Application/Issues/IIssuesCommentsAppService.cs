using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.Issues.Dto;
using System.Threading.Tasks;

namespace HelpDesk.Issues
{
    public interface IIssuesCommentsAppService :
        IAsyncCrudAppService<
            IssuesCommentsDto,         // TEntityDto
            long,                      // Primary Key
            GetAllIssuesCommentsInput, // GetAll input
            CreateIssuesCommentsInput, // Create input
            UpdateIssuesCommentsInput  // Update input
        >
    {
        Task<IssuesCommentsDto> GetCommentForEdit(EntityDto<long> input);
    }
}