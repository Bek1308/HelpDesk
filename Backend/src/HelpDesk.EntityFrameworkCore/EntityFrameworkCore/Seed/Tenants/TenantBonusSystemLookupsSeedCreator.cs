using Abp.EntityFrameworkCore;
using HelpDesk.BonusSystem.Lookups;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HelpDesk.EntityFrameworkCore.Seed.Tenants
{
    public class TenantBonusSystemLookupsSeedCreator
    {
        private readonly HelpDeskDbContext _context;
        private readonly int _tenantId;

        public TenantBonusSystemLookupsSeedCreator(HelpDeskDbContext context, int tenantId)
        {
            _context = context;
            _tenantId = tenantId;
        }

        public void Create()
        {
            CreatePeriodTypes();
            CreateWeekdays();
            CreateBudgetTypes();
        }

        private void CreatePeriodTypes()
        {
            var existing = _context.PeriodTypes.IgnoreQueryFilters().Any(pt => pt.TenantId == _tenantId);
            if (existing) return;

            var periodTypes = new[]
            {
                new PeriodType { TenantId = _tenantId, Name = "daily",       Description = "Расчёт каждый день", Quantity = 1 },
                new PeriodType { TenantId = _tenantId, Name = "weekly",      Description = "Каждую неделю (1 неделя)", Quantity = 1 },
                new PeriodType { TenantId = _tenantId, Name = "biweekly",    Description = "Каждые 2 недели", Quantity = 2 },
                new PeriodType { TenantId = _tenantId, Name = "monthly",     Description = "Каждый месяц (1 месяц)", Quantity = 1 },
                new PeriodType { TenantId = _tenantId, Name = "bimonthly",   Description = "Каждые 2 месяца", Quantity = 2 },
                new PeriodType { TenantId = _tenantId, Name = "quarterly",   Description = "Каждый квартал (3 месяца)", Quantity = 3 },
                new PeriodType { TenantId = _tenantId, Name = "half_yearly", Description = "Каждое полугодие (6 месяцев)", Quantity = 6 },
                new PeriodType { TenantId = _tenantId, Name = "yearly",      Description = "Каждый год (12 месяцев)", Quantity = 12 }
            };

            _context.PeriodTypes.AddRange(periodTypes);
            _context.SaveChanges();
        }

        private void CreateWeekdays()
        {
            var existing = _context.Weekdays.IgnoreQueryFilters().Any(w => w.TenantId == _tenantId);
            if (existing) return;

            var weekdays = new[]
            {
                new Weekday { TenantId = _tenantId, Name = "monday" },
                new Weekday { TenantId = _tenantId, Name = "tuesday" },
                new Weekday { TenantId = _tenantId, Name = "wednesday" },
                new Weekday { TenantId = _tenantId, Name = "thursday" },
                new Weekday { TenantId = _tenantId, Name = "friday" },
                new Weekday { TenantId = _tenantId, Name = "saturday" },
                new Weekday { TenantId = _tenantId, Name = "sunday" }
            };

            _context.Weekdays.AddRange(weekdays);
            _context.SaveChanges();
        }

        private void CreateBudgetTypes()
        {
            var existing = _context.BudgetTypes.IgnoreQueryFilters().Any(bt => bt.TenantId == _tenantId);
            if (existing) return;

            var budgetTypes = new[]
            {
                new BudgetType
                {
                    TenantId = _tenantId,
                    Name = "fixed",
                    Description = "Каждому пользователю выплачивается фиксированная сумма"
                },
                new BudgetType
                {
                    TenantId = _tenantId,
                    Name = "per_point",
                    Description = "Каждый балл имеет фиксированную стоимость. Пример: 1 балл = 2 сомони"
                },
                new BudgetType
                {
                    TenantId = _tenantId,
                    Name = "total_distribution",
                    Description = "Общая сумма распределяется пропорционально набранным баллам"
                }
            };

            _context.BudgetTypes.AddRange(budgetTypes);
            _context.SaveChanges();
        }
    }
}