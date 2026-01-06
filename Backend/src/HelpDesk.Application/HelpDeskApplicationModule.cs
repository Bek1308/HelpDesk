using Abp.AutoMapper;
using Abp.Dependency;
using Abp.Modules;
using Abp.Reflection.Extensions;
using HelpDesk.Application.Localization;
using HelpDesk.Authorization;

namespace HelpDesk;

[DependsOn(
    typeof(HelpDeskCoreModule),
    typeof(AbpAutoMapperModule))]
public class HelpDeskApplicationModule : AbpModule
{
    public override void PreInitialize()
    {
        Configuration.Authorization.Providers.Add<HelpDeskAuthorizationProvider>();
        // ILocalizedMessageService ni ro'yxatdan o'tkazish
        IocManager.Register<ILocalizedMessageService, LocalizedMessageService>(DependencyLifeStyle.Transient);
    }

    public override void Initialize()
    {
        var thisAssembly = typeof(HelpDeskApplicationModule).GetAssembly();

        IocManager.RegisterAssemblyByConvention(thisAssembly);

        Configuration.Modules.AbpAutoMapper().Configurators.Add(
            // Scan the assembly for classes which inherit from AutoMapper.Profile
            cfg => cfg.AddMaps(thisAssembly)
        );

        Configuration.Modules.AbpAutoMapper().Configurators.Add(
            // Scan the assembly for classes which inherit from AutoMapper.Profile
            cfg => cfg.AddProfile(new HelpDeskAutoMapperProfile())
        );
    }
}
