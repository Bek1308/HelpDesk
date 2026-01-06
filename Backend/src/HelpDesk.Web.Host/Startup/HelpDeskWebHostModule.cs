using Abp.Modules;
using Abp.Reflection.Extensions;
using HelpDesk.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace HelpDesk.Web.Host.Startup
{
    [DependsOn(
       typeof(HelpDeskWebCoreModule))]
    public class HelpDeskWebHostModule : AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public HelpDeskWebHostModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(HelpDeskWebHostModule).GetAssembly());
        }
    }
}
