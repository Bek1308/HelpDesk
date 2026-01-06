using Abp.Authorization;
using HelpDesk.Authorization.Roles;
using HelpDesk.Authorization.Users;

namespace HelpDesk.Authorization;

public class PermissionChecker : PermissionChecker<Role, User>
{
    public PermissionChecker(UserManager userManager)
        : base(userManager)
    {
    }
}
