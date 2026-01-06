using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.IssuesTypes
{
    public class IssueTypes: Entity, IMayHaveTenant
    {
        [StringLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string Title { get; set; }

        [StringLength(255)]
        [Column(TypeName = "nvarchar(255)")]
        public string Description { get; set; }
        public int? TenantId { get; set; }
    }
}
