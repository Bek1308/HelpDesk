using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Issues.Dto
{
    public class IssueCategoriesResponseDto
    {
        public List<FieldDto> CommonFields { get; set; }
        public List<IssueCategoryDto> Categories { get; set; }
    }
}
