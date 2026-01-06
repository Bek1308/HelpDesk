using Abp.AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Category.Dto
{
    [AutoMapTo(typeof(Category.Categories))]
    public class CreateCategoryInput
    {
        public string Title { get; set; }
        public int Distance { get; set; }
        public decimal Score { get; set; }
        public decimal Price { get; set; }
    }
}
