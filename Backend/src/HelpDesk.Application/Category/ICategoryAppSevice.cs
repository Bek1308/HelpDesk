using Abp.Application.Services;
using Abp.Application.Services.Dto;
using HelpDesk.Category.Dto;
using System.Threading.Tasks;

namespace HelpDesk.Category
{
    public interface ICategoryAppService :
        IAsyncCrudAppService<
            CategoryDto,          // TEntityDto
            int,                  // Primary Key
            GetAllCategoryInput,  // GetAll input
            CreateCategoryInput,  // Create input
            UpdateCategoryInput   // Update input
        >
    {
        Task<CategoryDto> GetCategoryForEdit(EntityDto input);
    }
}
