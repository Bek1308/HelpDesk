using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Category
{
    public class SubCategories: Entity,IMayHaveTenant
    {
        [StringLength(100)]
        [Column(TypeName = "nvarchar(100)")]
        public string Title { get; set; }

        [ForeignKey("CategoryId")]
        public int CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public Categories Category { get; set; }
        public int? TenantId { get; set; }

        
    }
}
