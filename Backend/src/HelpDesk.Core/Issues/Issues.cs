using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using HelpDesk.Authorization.Users;
using HelpDesk.PriorityLevels;
using HelpDesk.Repairs;
using HelpDesk.Statuses;
using HelpDesk.TechDepartment;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Issues
{
    public class Issues : FullAuditedEntity<long>, IMayHaveTenant
    {
        [StringLength(100)]
        [Column(TypeName = "nvarchar(100)")]
        public string Title { get; set; }

        [StringLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string IssueCategory { get; set; }

        public int PriorityId { get; set; }
        public long ReportedBy { get; set; }
        public int IssueStatusId { get; set; }

        [StringLength(500)]
        [Column(TypeName = "nvarchar(500)")]
        public string Description { get; set; }
        public bool IsResolved { get; set; } = false;

        [StringLength(150)]
        [Column(TypeName = "nvarchar(150)")]
        public string? ClientFullName { get; set; } // ФИО клиента, null qabul qiladi

        [StringLength(10)]
        [Column(TypeName = "nvarchar(10)")]
        public string? Gender { get; set; } // Пол (мужчина/женщина), null qabul qiladi

        public DateTime? ResolvedTime { get; set; }
        public DateTime? Deadline { get; set; }
        public int? TenantId { get; set; }

        [ForeignKey(nameof(ReportedBy))]
        public virtual User CreatorUser { get; set; }

        [ForeignKey(nameof(IssueStatusId))]
        public virtual IssuesStatuses IssueStatus { get; set; }

        [ForeignKey(nameof(PriorityId))]
        public virtual PriorityLevels.PriorityLevels PriorityLevel { get; set; }

        public virtual CallCenterIssue CallCenterIssue { get; set; }
        public virtual RepairIssue RepairIssue { get; set; }
        public virtual TechDepartmentIssue TechDepartmentIssue { get; set; }
        public virtual ATMIssue ATMIssue { get; set; }
        public virtual PayvandWalletIssue PayvandWalletIssue { get; set; }
        public virtual PayvandCardIssue PayvandCardIssue { get; set; }

        public virtual ICollection<IssuesAssignees> IssuesAssignees { get; set; } = new List<IssuesAssignees>();
        public virtual ICollection<IssuesObservers> IssuesObservers { get; set; } = new List<IssuesObservers>();
        public virtual ICollection<IssuesAdministrators> IssuesAdministrators { get; set; } = new List<IssuesAdministrators>();
        public virtual ICollection<IssuesClaims> IssuesClaims { get; set; } = new List<IssuesClaims>();
        public virtual ICollection<IssuesComments> IssuesComments { get; set; } = new List<IssuesComments>();
    }
}