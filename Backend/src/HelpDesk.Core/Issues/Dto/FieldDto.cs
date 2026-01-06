using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Issues.Dto
{
    public class FieldDto
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Type { get; set; }
        public bool IsRequired { get; set; }
        public int? MaxLength { get; set; }
    }
}
