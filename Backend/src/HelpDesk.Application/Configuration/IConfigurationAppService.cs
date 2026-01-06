using HelpDesk.Configuration.Dto;
using System.Threading.Tasks;

namespace HelpDesk.Configuration;

public interface IConfigurationAppService
{
    Task ChangeUiTheme(ChangeUiThemeInput input);
}
