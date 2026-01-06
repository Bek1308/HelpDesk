using Abp.AspNetCore;
using Abp.AspNetCore.TestBase;
using Abp.Modules;
using Abp.Reflection.Extensions;
using HelpDesk.EntityFrameworkCore;
using HelpDesk.Web.Startup;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

namespace HelpDesk.Web.Tests;

[DependsOn(
    typeof(HelpDeskWebMvcModule),
    typeof(AbpAspNetCoreTestBaseModule)
)]
public class HelpDeskWebTestModule : AbpModule
{
    public HelpDeskWebTestModule(HelpDeskEntityFrameworkModule abpProjectNameEntityFrameworkModule)
    {
        abpProjectNameEntityFrameworkModule.SkipDbContextRegistration = true;
    }

    public override void PreInitialize()
    {
        Configuration.UnitOfWork.IsTransactional = false; //EF Core InMemory DB does not support transactions.
    }

    public override void Initialize()
    {
        IocManager.RegisterAssemblyByConvention(typeof(HelpDeskWebTestModule).GetAssembly());
    }

    public override void PostInitialize()
    {
        IocManager.Resolve<ApplicationPartManager>()
            .AddApplicationPartsIfNotAddedBefore(typeof(HelpDeskWebMvcModule).Assembly);
    }
}