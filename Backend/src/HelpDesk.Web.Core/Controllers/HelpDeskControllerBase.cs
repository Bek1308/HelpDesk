using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace HelpDesk.Controllers
{
    public abstract class HelpDeskControllerBase : AbpController
    {
        protected HelpDeskControllerBase()
        {
            LocalizationSourceName = HelpDeskConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
