using Abp.Domain.Entities;
using HelpDesk.Cities;
using HelpDesk.FaultGroups;
using HelpDesk.Issues;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.TechDepartment
{
    public class TechDepartmentIssue : Entity<long>, IMayHaveTenant
    {
        public long IssuesId { get; set; } // Bog'lanish asosiy Issues jadvali bilan

        [StringLength(100)]
        [Column(TypeName = "nvarchar(100)")]
        public string TerminalNumber { get; set; }  // Номер терминала

        [StringLength(150)]
        [Column(TypeName = "nvarchar(150)")]
        public string TerminalName { get; set; }    // Название терминала

        public long AgentId { get; set; }           // ID агента

        [StringLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string AgentNumber { get; set; }     // Номер агента

        [StringLength(500)]
        [Column(TypeName = "nvarchar(500)")]
        public string IssueDescription { get; set; } // Описание неисправности

        public int? IssueGroupId { get; set; }       // Группа неисправности (FaultGroup jadvalidan ID)

        [StringLength(200)]
        [Column(TypeName = "nvarchar(200)")]
        public string TerminalLocation { get; set; } // Место терминала

        public int? CityId { get; set; }             // Город (City jadvalidan ID)

        public int? TenantId { get; set; }

        [ForeignKey(nameof(IssuesId))]
        public virtual Issues.Issues Issues { get; set; }

        [ForeignKey(nameof(IssueGroupId))]
        public virtual FaultGroup IssueGroup { get; set; }

        [ForeignKey(nameof(CityId))]
        public virtual City City { get; set; }
    }
}