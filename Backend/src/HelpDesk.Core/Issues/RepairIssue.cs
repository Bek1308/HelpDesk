using Abp.Domain.Entities;
using HelpDesk.Issues;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Repairs
{
    public class RepairIssue : Entity<long>, IMayHaveTenant
    {
        public long IssuesId { get; set; } // Bog'lanish asosiy Issues jadvali bilan

        [StringLength(150)]
        [Column(TypeName = "nvarchar(150)")]
        public string AgentFullName { get; set; }  // ФИО агента

        [StringLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string AgentNumber { get; set; }    // Номер агента

        [StringLength(150)]
        [Column(TypeName = "nvarchar(150)")]
        public string Equipment { get; set; }      // Оборудование

        [StringLength(100)]
        [Column(TypeName = "nvarchar(100)")]
        public string SerialNumber { get; set; }   // Серийный номер

        [StringLength(500)]
        [Column(TypeName = "nvarchar(500)")]
        public string IssueDescription { get; set; } // Описание неисправностей

        [Column(TypeName = "decimal(18,2)")]
        public decimal WorkAmount { get; set; }    // Сумма работы

        [StringLength(300)]
        [Column(TypeName = "nvarchar(300)")]
        public string ReplacementParts { get; set; } // Замена комплектующих

        public int? TenantId { get; set; }

        [ForeignKey(nameof(IssuesId))]
        public virtual Issues.Issues Issues { get; set; }
    }
}
