using Abp.Authorization;
using Abp.Localization;
using Abp.MultiTenancy;

namespace HelpDesk.Authorization;

public class HelpDeskAuthorizationProvider : AuthorizationProvider
{
    public override void SetPermissions(IPermissionDefinitionContext context)
    {
        context.CreatePermission(PermissionNames.Pages_Users, L("Users"));
        context.CreatePermission(PermissionNames.Pages_Users_Activation, L("UsersActivation"));
        context.CreatePermission(PermissionNames.Pages_Roles, L("Roles"));
        context.CreatePermission(PermissionNames.Pages_Tenants, L("Tenants"), multiTenancySides: MultiTenancySides.Host);
        context.CreatePermission(PermissionNames.Pages_Categories, L("Categories"));
        context.CreatePermission(PermissionNames.Pages_SubCategories, L("SubCategories"));
        context.CreatePermission(PermissionNames.Pages_PriorityLevels, L("PriorityLevels"));    
        context.CreatePermission(PermissionNames.Pages_Services, L("Services"));
        context.CreatePermission(PermissionNames.Pages_IssueTypes, L("IssueTypes"));
        context.CreatePermission(PermissionNames.Pages_FaultGroups, L("FaultGroups"));
        context.CreatePermission(PermissionNames.Pages_CallCenterIssues, L("CallCenterIssues"));
        var issues = context.CreatePermission("Issues", L("Issues"));
        issues.CreateChildPermission(PermissionNames.Issue_Create_CallCenter, L("CreateCallCenterIssues"));
        issues.CreateChildPermission(PermissionNames.Issue_Create_Repair, L("CreateRepairIssues"));
        issues.CreateChildPermission(PermissionNames.Issue_Create_TechDepartment, L("CreateTechDepartmentIssues"));
        issues.CreateChildPermission(PermissionNames.Issues_Update, L("UpdateIssues"));
        issues.CreateChildPermission(PermissionNames.Issues_Delete, L("DeleteIssues"));
        issues.CreateChildPermission(PermissionNames.Issues_GetAll, L("GetAllIssues"));

    }

    private static ILocalizableString L(string name)
    {
        return new LocalizableString(name, HelpDeskConsts.LocalizationSourceName);
    }
}
