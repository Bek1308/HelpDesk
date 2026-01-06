using Abp.Domain.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Cities
{
    [Table("Cities")]
    public class City : Entity<int>, IMayHaveTenant
    {
        [Key]
        [Column("id")]
        public override int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("name")]
        public string Name { get; set; }

        [Required]
        [Column("distance")]
        public int Distance { get; set; }

        [Required]
        [Column("score", TypeName = "decimal(10,2)")]
        public decimal Score { get; set; }

        [Column("price", TypeName = "decimal(18,2)")]
        public decimal? Price { get; set; }

        public int? TenantId { get; set; }

    }
}
