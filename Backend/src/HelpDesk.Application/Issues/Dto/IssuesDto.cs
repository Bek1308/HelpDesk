using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;
using System.Collections.Generic;

namespace HelpDesk.Issues.Dto
{
    // O'qish operatsiyalari uchun umumiy DTO (ko'rish uchun, masalan, GetAllAsync)
    public class IssuesDto : EntityDto<long>
    {
        public string Title { get; set; }
        public string IssueCategory { get; set; }
        public string Description { get; set; }
        public int PriorityId { get; set; }
        public string PriorityName { get; set; }
        public int IssueStatusId { get; set; }
        public string IssueStatusName { get; set; }
        public long ReportedBy { get; set; }
        public string ReportedByName { get; set; }
        public bool IsResolved { get; set; }
        public DateTime? Deadline { get; set; }
        public DateTime? ResolvedTime { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }
        public int? TenantId { get; set; }
        public string? ClientFullName { get; set; } // Yangi maydon, null qabul qiladi
        public string? Gender { get; set; } // Yangi maydon, null qabul qiladi
        public List<long> AssigneeUserIds { get; set; } = new List<long>();
        public CallCenterIssueQueryDto CallCenterData { get; set; }
        public RepairIssueQueryDto RepairData { get; set; }
        public TechDepartmentIssueQueryDto TechDepartmentData { get; set; }
        public ATMIssueQueryDto ATMData { get; set; } // Yangi entity uchun
        public PayvandWalletIssueQueryDto PayvandWalletData { get; set; } // Yangi entity uchun
        public PayvandCardIssueQueryDto PayvandCardData { get; set; } // Yangi entity uchun
        public List<IssuesClaimsDto> IssuesClaims { get; set; }
    }

    // Yaratish uchun DTO
    public class CreateIssuesDto
    {
        public string Title { get; set; }
        public string IssueCategory { get; set; }
        public int PriorityId { get; set; }
        public int IssueStatusId { get; set; }
        public string Description { get; set; }
        public DateTime? Deadline { get; set; }
        public bool IsResolved { get; set; }
        public string? ClientFullName { get; set; } // Yangi maydon, null qabul qiladi
        public string? Gender { get; set; } // Yangi maydon, null qabul qiladi
        public List<long> AssigneeUserIds { get; set; } = new List<long>();
        public CallCenterIssueCommandDto CallCenterData { get; set; }
        public RepairIssueCommandDto RepairData { get; set; }
        public TechDepartmentIssueCommandDto TechDepartmentData { get; set; }
        public ATMIssueCommandDto ATMData { get; set; } // Yangi entity uchun
        public PayvandWalletIssueCommandDto PayvandWalletData { get; set; } // Yangi entity uchun
        public PayvandCardIssueCommandDto PayvandCardData { get; set; } // Yangi entity uchun
        public List<CreateIssuesClaimsDto> IssuesClaims { get; set; }
    }

    // Yangilash uchun DTO
    public class EditIssuesDto : EntityDto<long>
    {
        public string Title { get; set; }
        public string IssueCategory { get; set; }
        public int PriorityId { get; set; }
        public int IssueStatusId { get; set; }
        public string Description { get; set; }
        public DateTime? Deadline { get; set; }
        public bool IsResolved { get; set; }
        public DateTime? ResolvedTime { get; set; }
        public string? ClientFullName { get; set; } // Yangi maydon, null qabul qiladi
        public string? Gender { get; set; } // Yangi maydon, null qabul qiladi
        public List<long> AssigneeUserIds { get; set; } = new List<long>();
        public CallCenterIssueCommandDto CallCenterData { get; set; }
        public RepairIssueCommandDto RepairData { get; set; }
        public TechDepartmentIssueCommandDto TechDepartmentData { get; set; }
        public ATMIssueCommandDto ATMData { get; set; } // Yangi entity uchun
        public PayvandWalletIssueCommandDto PayvandWalletData { get; set; } // Yangi entity uchun
        public PayvandCardIssueCommandDto PayvandCardData { get; set; } // Yangi entity uchun
        public List<IssuesClaimsDto> IssuesClaims { get; set; }
    }

    // CallCenterIssue uchun o'qish DTO (ko'rish uchun)
    public class CallCenterIssueQueryDto
    {
        public int SubCategoryId { get; set; }
        public string SubCategoryName { get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public string WrongNumber { get; set; }
        public string RightNumber { get; set; }
        public string TerminalNumber { get; set; }
        public string Sum { get; set; }
        public string CancelledSum { get; set; }
        public string Subscriber { get; set; }
    }

    // CallCenterIssue uchun yozish DTO (yaratish/yangilash uchun)
    public class CallCenterIssueCommandDto
    {
        public int SubCategoryId { get; set; }
        public int ServiceId { get; set; }
        public string WrongNumber { get; set; }
        public string RightNumber { get; set; }
        public string TerminalNumber { get; set; }
        public decimal Sum { get; set; }
        public decimal CancelledSum { get; set; }
        public string Subscriber { get; set; }
    }

    // RepairIssue uchun o'qish DTO (ko'rish uchun)
    public class RepairIssueQueryDto
    {
        public string AgentFullName { get; set; }
        public string AgentNumber { get; set; }
        public string Equipment { get; set; }
        public string SerialNumber { get; set; }
        public string IssueDescription { get; set; }
        public decimal WorkAmount { get; set; }
        public string ReplacementParts { get; set; }
    }

    // RepairIssue uchun yozish DTO (yaratish/yangilash uchun)
    public class RepairIssueCommandDto
    {
        public string AgentFullName { get; set; }
        public string AgentNumber { get; set; }
        public string Equipment { get; set; }
        public string SerialNumber { get; set; }
        public string IssueDescription { get; set; }
        public decimal WorkAmount { get; set; }
        public string ReplacementParts { get; set; }
    }

    // TechDepartmentIssue uchun o'qish DTO (ko'rish uchun)
    public class TechDepartmentIssueQueryDto
    {
        public string TerminalNumber { get; set; }
        public string TerminalName { get; set; }
        public long AgentId { get; set; }
        public string AgentNumber { get; set; }
        public string IssueDescription { get; set; }
        public int? IssueGroupId { get; set; }
        public string? IssueGroupName { get; set; }
        public string TerminalLocation { get; set; }
        public int? CityId { get; set; }
        public string? CityName { get; set; }
    }

    // TechDepartmentIssue uchun yozish DTO (yaratish/yangilash uchun)
    public class TechDepartmentIssueCommandDto
    {
        public string TerminalNumber { get; set; }
        public string TerminalName { get; set; }
        public long AgentId { get; set; }
        public string AgentNumber { get; set; }
        public string IssueDescription { get; set; }
        public int? IssueGroupId { get; set; }
        public string TerminalLocation { get; set; }
        public int? CityId { get; set; }
    }

    // ATMIssue uchun o'qish DTO (ko'rish uchun)
    [AutoMapFrom(typeof(ATMIssue))]
    public class ATMIssueQueryDto
    {
        public string ATMNumber { get; set; }
        public string Reason { get; set; }
        public string IssuingBank { get; set; }
        public decimal Amount { get; set; }
        public string PhoneNumber { get; set; }
        public int SubCategoryId { get; set; }
        public string SubCategoryName { get; set; }
    }

    // ATMIssue uchun yozish DTO (yaratish/yangilash uchun)
    [AutoMapFrom(typeof(ATMIssue))]
    public class ATMIssueCommandDto
    {
        public string ATMNumber { get; set; }
        public string Reason { get; set; }
        public string IssuingBank { get; set; }
        public decimal Amount { get; set; }
        public string PhoneNumber { get; set; }
        public int SubCategoryId { get; set; }
    }

    // PayvandWalletIssue uchun o'qish DTO (ko'rish uchun)
    [AutoMapFrom(typeof(PayvandWalletIssue))]
    public class PayvandWalletIssueQueryDto
    {
        public string WrongNumber { get; set; }
        public string RightNumber { get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public decimal Amount { get; set; }
        public int SubCategoryId { get; set; }
        public string SubCategoryName { get; set; }
    }

    // PayvandWalletIssue uchun yozish DTO (yaratish/yangilash uchun)
    [AutoMapFrom(typeof(PayvandWalletIssue))]
    public class PayvandWalletIssueCommandDto
    {
        public string WrongNumber { get; set; }
        public string RightNumber { get; set; }
        public int ServiceId { get; set; }
        public decimal Amount { get; set; }
        public int SubCategoryId { get; set; }
    }

    // PayvandCardIssue uchun o'qish DTO (ko'rish uchun)
    [AutoMapFrom(typeof(PayvandCardIssue))]
    public class PayvandCardIssueQueryDto
    {
        public string WrongNumber { get; set; }
        public string RightNumber { get; set; }
        public int SubCategoryId { get; set; }
        public string SubCategoryName { get; set; }
    }

    // PayvandCardIssue uchun yozish DTO (yaratish/yangilash uchun)
    [AutoMapFrom(typeof(PayvandCardIssue))]
    public class PayvandCardIssueCommandDto
    {
        public string WrongNumber { get; set; }
        public string RightNumber { get; set; }
        public int SubCategoryId { get; set; }
    }

    public class IssuesClaimsDto : EntityDto<long>
    {
        public string ClaimKey { get; set; }
        public string ClaimValue { get; set; }
    }

    public class CreateIssuesClaimsDto
    {
        public string ClaimKey { get; set; }
        public string ClaimValue { get; set; }
    }
}