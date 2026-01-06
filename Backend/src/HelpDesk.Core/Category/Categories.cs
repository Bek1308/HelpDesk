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
    public class Categories : Entity, IMayHaveTenant
    {
        [MaxLength(100)]
        [Column(TypeName = "nvarchar(100)")]

        public string Title { get; set; }
        public int Distance { get; set; }
        [Column(TypeName = "decimal(10,2)")]
        public decimal Score { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        public int? TenantId { get; set; }

    }
}
