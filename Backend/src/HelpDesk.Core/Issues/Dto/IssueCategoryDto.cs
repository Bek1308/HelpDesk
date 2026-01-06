using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Issues.Dto
{
    public class IssueCategoryDto
    {
        public string Category { get; set; }
        public string DisplayName { get; set; }
        public string PermissionName { get; set; } // Ruxsat nomi (masalan, "Issues.Create.CallCenter")
        public bool Permission { get; set; } // Foydalanuvchining ruxsati
        public List<FieldDto> SpecificFields { get; set; }
    }
}
