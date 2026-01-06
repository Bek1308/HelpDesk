using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.Category.Dto;
using HelpDesk.Category.Dto.SubCategories;
using System.Threading.Tasks;

namespace HelpDesk.Category
{
    public interface ISubCategoryAppService :
        IAsyncCrudAppService<
            SubCategoryDto,          // TEntityDto
            int,                     // Primary Key
            GetAllSubCategoryInput,  // GetAll input
            CreateSubCategoryInput,  // Create input
            UpdateSubCategoryInput   // Update input
        >
    {
        Task<SubCategoryDto> GetSubCategoryForEdit(EntityDto input);
    }
}