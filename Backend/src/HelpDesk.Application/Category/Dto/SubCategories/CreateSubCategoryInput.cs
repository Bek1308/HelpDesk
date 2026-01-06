using Abp.AutoMapper;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Category.Dto.SubCategories
{
    [AutoMapTo(typeof(Category.SubCategories))]
    public class CreateSubCategoryInput
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        [Required]
        public int CategoryId { get; set; }
    }
}
