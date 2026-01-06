using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Category.Dto.SubCategories
{
    [AutoMapFrom(typeof(Category.SubCategories))]
    public class SubCategoryDto : EntityDto<int>
    {
        public string Title { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int? TenantId { get; set; }
    }
}
