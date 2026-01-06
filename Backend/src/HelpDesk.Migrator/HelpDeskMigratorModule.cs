using Abp.Events.Bus;
using Abp.Modules;
using Abp.Reflection.Extensions;
using HelpDesk.Configuration;
using HelpDesk.EntityFrameworkCore;
using HelpDesk.Migrator.DependencyInjection;
using Castle.MicroKernel.Registration;
using Microsoft.Extensions.Configuration;

namespace HelpDesk.Migrator;

[DependsOn(typeof(HelpDeskEntityFrameworkModule))]
public class HelpDeskMigratorModule : AbpModule
{
    private readonly IConfigurationRoot _appConfiguration;

    public HelpDeskMigratorModule(HelpDeskEntityFrameworkModule abpProjectNameEntityFrameworkModule)
    {
        abpProjectNameEntityFrameworkModule.SkipDbSeed = true;

        _appConfiguration = AppConfigurations.Get(
            typeof(HelpDeskMigratorModule).GetAssembly().GetDirectoryPathOrNull()
        );
    }

    public override void PreInitialize()
    {
        Configuration.DefaultNameOrConnectionString = _appConfiguration.GetConnectionString(
            HelpDeskConsts.ConnectionStringName
        );

        Configuration.BackgroundJobs.IsJobExecutionEnabled = false;
        Configuration.ReplaceService(
            typeof(IEventBus),
            () => IocManager.IocContainer.Register(
                Component.For<IEventBus>().Instance(NullEventBus.Instance)
            )
        );
    }

    public override void Initialize()
    {
        IocManager.RegisterAssemblyByConvention(typeof(HelpDeskMigratorModule).GetAssembly());
        ServiceCollectionRegistrar.Register(IocManager);
    }
}
