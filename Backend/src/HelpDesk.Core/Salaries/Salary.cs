using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Salaries
{
    [Table("Salaries")]
    public class Salary : Entity<int>, IMayHaveTenant
    {
        [Key]
        [Column("id")]
        public override int Id { get;  set; }

        [Required]
        [MaxLength(100)]
        [Column("dep_name")]
        public string DepName { get; set; }

        [Required]
        [Column("value", TypeName = "numeric(10,2)")]
        public decimal Value { get; set; }

        public int? TenantId { get; set; }
    }
}
