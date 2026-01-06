using HelpDesk.Authorization;
using HelpDesk.Issues.Dto;
using System.Collections.Generic;

namespace HelpDesk.Issues.Definitions
{
    public static class IssueCategoryDefinitions
    {
        public static List<FieldDto> CommonFields => new List<FieldDto>
        {
            new FieldDto { Name = "Title", DisplayName = "Field_Title", Type = "string", IsRequired = true, MaxLength = 100 },
            new FieldDto { Name = "Description", DisplayName = "Field_Description", Type = "string", IsRequired = false, MaxLength = 500 },
            new FieldDto { Name = "PriorityId", DisplayName = "Field_Priority", Type = "number", IsRequired = true },
            new FieldDto { Name = "IssueStatusId", DisplayName = "Field_Status", Type = "number", IsRequired = true },
            new FieldDto { Name = "AssigneeUserIds", DisplayName = "Field_Assignees", Type = "multi-select", IsRequired = false }
        };

        public static List<IssueCategoryDto> Categories => new List<IssueCategoryDto>
        {
            // CallCenter
            new IssueCategoryDto
            {
                Category = "CallCenter",
                DisplayName = "CallCenter",
                PermissionName = PermissionNames.Issue_Create_CallCenter,
                SpecificFields = new List<FieldDto>
                {
                    new FieldDto { Name = "SubCategoryId", DisplayName = "Field_SubCategory", Type = "number", IsRequired = true },
                    new FieldDto { Name = "ServiceId", DisplayName = "Field_Service", Type = "number", IsRequired = true },
                    new FieldDto { Name = "WrongNumber", DisplayName = "Field_WrongNumber", Type = "string", IsRequired = false, MaxLength = 255 },
                    new FieldDto { Name = "RightNumber", DisplayName = "Field_RightNumber", Type = "string", IsRequired = false, MaxLength = 255 },
                    new FieldDto { Name = "TerminalNumber", DisplayName = "Field_TerminalNumber", Type = "string", IsRequired = false, MaxLength = 255 },
                    new FieldDto { Name = "Sum", DisplayName = "Field_Sum", Type = "string", IsRequired = false, MaxLength = 255 },
                    new FieldDto { Name = "CancelledSum", DisplayName = "Field_CancelledSum", Type = "string", IsRequired = false, MaxLength = 255 },
                    new FieldDto { Name = "Subscriber", DisplayName = "Field_Subscriber", Type = "string", IsRequired = false, MaxLength = 255 }
                }
            },

            // Repair
            new IssueCategoryDto
            {
                Category = "Repair",
                DisplayName = "Repair",
                PermissionName = PermissionNames.Issue_Create_Repair,
                SpecificFields = new List<FieldDto>
                {
                    new FieldDto { Name = "AgentFullName", DisplayName = "Field_AgentFullName", Type = "string", IsRequired = true, MaxLength = 150 },
                    new FieldDto { Name = "AgentNumber", DisplayName = "Field_AgentNumber", Type = "string", IsRequired = true, MaxLength = 50 },
                    new FieldDto { Name = "Equipment", DisplayName = "Field_Equipment", Type = "string", IsRequired = true, MaxLength = 150 },
                    new FieldDto { Name = "SerialNumber", DisplayName = "Field_SerialNumber", Type = "string", IsRequired = false, MaxLength = 100 },
                    new FieldDto { Name = "IssueDescription", DisplayName = "Field_IssueDescription", Type = "string", IsRequired = false, MaxLength = 500 },
                    new FieldDto { Name = "WorkAmount", DisplayName = "Field_WorkAmount", Type = "decimal", IsRequired = false },
                    new FieldDto { Name = "ReplacementParts", DisplayName = "Field_ReplacementParts", Type = "string", IsRequired = false, MaxLength = 300 }
                }
            },

            // Tech Department
            new IssueCategoryDto
            {
                Category = "TechDepartment",
                DisplayName = "TechDepartment",
                PermissionName = PermissionNames.Issue_Create_TechDepartment,
                SpecificFields = new List<FieldDto>
                {
                    new FieldDto { Name = "TerminalNumber", DisplayName = "Field_TerminalNumber", Type = "string", IsRequired = true, MaxLength = 100 },
                    new FieldDto { Name = "TerminalName", DisplayName = "Field_TerminalName", Type = "string", IsRequired = true, MaxLength = 150 },
                    new FieldDto { Name = "AgentId", DisplayName = "Field_AgentId", Type = "number", IsRequired = true },
                    new FieldDto { Name = "AgentNumber", DisplayName = "Field_AgentNumber", Type = "string", IsRequired = true, MaxLength = 50 },
                    new FieldDto { Name = "IssueDescription", DisplayName = "Field_IssueDescription", Type = "string", IsRequired = false, MaxLength = 500 },
                    new FieldDto { Name = "IssueGroup", DisplayName = "Field_IssueGroup", Type = "string", IsRequired = false, MaxLength = 100 },
                    new FieldDto { Name = "TerminalLocation", DisplayName = "Field_TerminalLocation", Type = "string", IsRequired = false, MaxLength = 200 },
                    new FieldDto { Name = "City", DisplayName = "Field_City", Type = "string", IsRequired = false, MaxLength = 100 }
                }
            },

            // ATM Issues
            new IssueCategoryDto
            {
                Category = "AtmIssues",
                DisplayName = "ATM Issues",
                PermissionName = PermissionNames.Issue_Create_TechDepartment,
                SpecificFields = new List<FieldDto>
                {
                    new FieldDto { Name = "ATMNumber", DisplayName = "Field_ATMNumber", Type = "string", IsRequired = false, MaxLength = 50 },
                    new FieldDto { Name = "Reason", DisplayName = "Field_Reason", Type = "string", IsRequired = false, MaxLength = 500 },
                    new FieldDto { Name = "IssuingBank", DisplayName = "Field_IssuingBank", Type = "string", IsRequired = false, MaxLength = 100 },
                    new FieldDto { Name = "Amount", DisplayName = "Field_Amount", Type = "number", IsRequired = false },
                    new FieldDto { Name = "PhoneNumber", DisplayName = "Field_PhoneNumber", Type = "string", IsRequired = false, MaxLength = 20 },
                    new FieldDto { Name = "SubCategoryId", DisplayName = "Field_SubCategoryId", Type = "number", IsRequired = true },
                    new FieldDto { Name = "TenantId", DisplayName = "Field_TenantId", Type = "number", IsRequired = false }
                }
            },

            // Payvand Wallet
            new IssueCategoryDto
            {
                Category = "PayvandWallet",
                DisplayName = "Payvand Wallet",
                PermissionName = PermissionNames.Issue_Create_TechDepartment,
                SpecificFields = new List<FieldDto>
                {
                    new FieldDto { Name = "WrongNumber", DisplayName = "Field_WrongNumber", Type = "string", IsRequired = false, MaxLength = 255 },
                    new FieldDto { Name = "RightNumber", DisplayName = "Field_RightNumber", Type = "string", IsRequired = false, MaxLength = 255 },
                    new FieldDto { Name = "ServiceId", DisplayName = "Field_Service", Type = "number", IsRequired = true },
                    new FieldDto { Name = "Amount", DisplayName = "Field_Amount", Type = "decimal", IsRequired = false },
                    new FieldDto { Name = "SubCategoryId", DisplayName = "Field_SubCategory", Type = "number", IsRequired = true },
                    new FieldDto { Name = "TenantId", DisplayName = "Field_TenantId", Type = "number", IsRequired = false }
                }
            },

            // Payvand Card
            new IssueCategoryDto
            {
                Category = "PayvandCard",
                DisplayName = "Payvand Card",
                PermissionName = PermissionNames.Issue_Create_TechDepartment,
                SpecificFields = new List<FieldDto>
                {
                    new FieldDto { Name = "WrongNumber", DisplayName = "Field_WrongNumber", Type = "string", IsRequired = false, MaxLength = 255 },
                    new FieldDto { Name = "RightNumber", DisplayName = "Field_RightNumber", Type = "string", IsRequired = false, MaxLength = 255 },
                    new FieldDto { Name = "SubCategoryId", DisplayName = "Field_SubCategory", Type = "number", IsRequired = true },
                    new FieldDto { Name = "TenantId", DisplayName = "Field_TenantId", Type = "number", IsRequired = false }
                }
            }
        };
    }
}