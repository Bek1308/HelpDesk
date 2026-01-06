using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.PriorityLevels.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.PriorityLevels
{
    public interface IPriorityLevelAppService :
        IAsyncCrudAppService<
            PriorityLevelDto,          // TEntityDto
            int,                       // Primary Key
            GetAllPriorityLevelInput,  // GetAll input
            CreatePriorityLevelInput,  // Create input
            UpdatePriorityLevelInput   // Update input
        >
    {
        Task<PriorityLevelDto> GetPriorityLevelForEdit(EntityDto input);
    }
}
