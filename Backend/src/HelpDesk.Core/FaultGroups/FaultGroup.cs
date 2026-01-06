using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.FaultGroups
{
    [Table("FaultGroups")]
    public class FaultGroup : Entity<int>, IMayHaveTenant
    {
        [Key]
        [Column("id")]
        public override int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("title")]
        public string Title { get; set; }
        public int? TenantId { get; set; }
    }
}
