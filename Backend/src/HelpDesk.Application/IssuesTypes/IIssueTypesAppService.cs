using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.IssuesTypes.Dto;
using System;
using System.Threading.Tasks;

namespace HelpDesk.IssuesTypes
{
    public interface IIssueTypesAppService :
        IAsyncCrudAppService<
            IssueTypeDto,            // TEntityDto
            int,                     // Primary Key
            GetAllIssueTypeInput,    // GetAll input
            CreateIssueTypeInputDto, // Create input
            UpdateIssueTypeInputDto  // Update input
        >
    {
        // Yangi metod deklaratsiyasi
        Task<IssueTypeDto> GetIssueTypeForEditAsync(EntityDto<int> input);

    }
}