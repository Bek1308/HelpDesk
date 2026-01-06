using Abp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.PriorityLevels
{
    public class PriorityLevels: Entity, IMayHaveTenant
    {
        [StringLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string Title { get; set; }

        [Range(0, 100)]
        public int Percentage { get; set; } // Muhimlik foizi (0–100)

        public int? TenantId { get; set; }
    }
}
