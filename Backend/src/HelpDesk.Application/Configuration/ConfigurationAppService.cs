using Abp.Authorization;
using Abp.Runtime.Session;
using HelpDesk.Configuration.Dto;
using System.Threading.Tasks;

namespace HelpDesk.Configuration;

[AbpAuthorize]
public class ConfigurationAppService : HelpDeskAppServiceBase, IConfigurationAppService
{
    public async Task ChangeUiTheme(ChangeUiThemeInput input)
    {
        await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), AppSettingNames.UiTheme, input.Theme);
    }
}
