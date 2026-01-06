using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Uow;
using Abp.Localization;
using Abp.MultiTenancy;
using HelpDesk.EntityFrameworkCore.Seed.Host;
using HelpDesk.EntityFrameworkCore.Seed.Tenants;
using Microsoft.EntityFrameworkCore;
using System;
using System.Transactions;

namespace HelpDesk.EntityFrameworkCore.Seed;

public static class SeedHelper
{
    public static void SeedHostDb(IIocResolver iocResolver)
    {
        WithDbContext<HelpDeskDbContext>(iocResolver, SeedHostDb);
    }

    public static void SeedHostDb(HelpDeskDbContext context)
    {
        context.SuppressAutoSetTenantId = true;

        // Host seed
        new InitialHostDbBuilder(context).Create();

        // Default tenant seed (in host database).
        new DefaultTenantBuilder(context).Create();
        new TenantRoleAndUserBuilder(context, 1).Create();

        // ========================
        // IssuesCategoryLocalizationTextCreator seedini qo‘shish
        // ========================
        new IssuesCategoryLocalizationTextCreator(context).Create();
        new IssuesCategoryLocalizationTextCreator(context, 1).Create();
        new IssuesStatusesLocalizationTextCreator(context).Create();
        new BonusSystemLookupsSeedCreator(context).Create();
        new TenantBonusSystemLookupsSeedCreator(context, 1).Create();


    }

    private static void WithDbContext<TDbContext>(IIocResolver iocResolver, Action<TDbContext> contextAction)
        where TDbContext : DbContext
    {
        using (var uowManager = iocResolver.ResolveAsDisposable<IUnitOfWorkManager>())
        {
            using (var uow = uowManager.Object.Begin(TransactionScopeOption.Suppress))
            {
                var context = uowManager.Object.Current.GetDbContext<TDbContext>(MultiTenancySides.Host);

                contextAction(context);

                uow.Complete();
            }
        }
    }
}
