using Abp.EntityFrameworkCore;
using HelpDesk.BonusSystem.Lookups;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HelpDesk.EntityFrameworkCore.Seed.Host
{
    public class BonusSystemLookupsSeedCreator
    {
        private readonly HelpDeskDbContext _context;

        public BonusSystemLookupsSeedCreator(HelpDeskDbContext context)
        {
            _context = context;
        }

        public void Create()
        {
            CreatePeriodTypes();
            CreateWeekdays();
            CreateBudgetTypes();
        }

        private void CreatePeriodTypes()
        {
            var existing = _context.PeriodTypes.IgnoreQueryFilters().Any(pt => pt.TenantId == null);
            if (existing) return;

            var periodTypes = new[]
            {
                new PeriodType { TenantId = null, Name = "daily",       Description = "Расчёт каждый день", Quantity = 1 },
                new PeriodType { TenantId = null, Name = "weekly",      Description = "Каждую неделю (1 неделя)", Quantity = 1 },
                new PeriodType { TenantId = null, Name = "biweekly",    Description = "Каждые 2 недели", Quantity = 2 },
                new PeriodType { TenantId = null, Name = "monthly",     Description = "Каждый месяц (1 месяц)", Quantity = 1 },
                new PeriodType { TenantId = null, Name = "bimonthly",   Description = "Каждые 2 месяца", Quantity = 2 },
                new PeriodType { TenantId = null, Name = "quarterly",   Description = "Каждый квартал (3 месяца)", Quantity = 3 },
                new PeriodType { TenantId = null, Name = "half_yearly", Description = "Каждое полугодие (6 месяцев)", Quantity = 6 },
                new PeriodType { TenantId = null, Name = "yearly",      Description = "Каждый год (12 месяцев)", Quantity = 12 }
            };

            _context.PeriodTypes.AddRange(periodTypes);
            _context.SaveChanges();
        }

        private void CreateWeekdays()
        {
            var existing = _context.Weekdays.IgnoreQueryFilters().Any(w => w.TenantId == null);
            if (existing) return;

            var weekdays = new[]
            {
                new Weekday { TenantId = null, Name = "monday" },
                new Weekday { TenantId = null, Name = "tuesday" },
                new Weekday { TenantId = null, Name = "wednesday" },
                new Weekday { TenantId = null, Name = "thursday" },
                new Weekday { TenantId = null, Name = "friday" },
                new Weekday { TenantId = null, Name = "saturday" },
                new Weekday { TenantId = null, Name = "sunday" }
            };

            _context.Weekdays.AddRange(weekdays);
            _context.SaveChanges();
        }

        private void CreateBudgetTypes()
        {
            var existing = _context.BudgetTypes.IgnoreQueryFilters().Any(bt => bt.TenantId == null);
            if (existing) return;

            var budgetTypes = new[]
            {
                new BudgetType
                {
                    TenantId = null,
                    Name = "fixed",
                    Description = "Каждому пользователю выплачивается фиксированная сумма"
                },
                new BudgetType
                {
                    TenantId = null,
                    Name = "per_point",
                    Description = "Каждый балл имеет фиксированную стоимость. Пример: 1 балл = 2 сум"
                },
                new BudgetType
                {
                    TenantId = null,
                    Name = "total_distribution",
                    Description = "Общая сумма распределяется пропорционально набранным баллам"
                }
            };

            _context.BudgetTypes.AddRange(budgetTypes);
            _context.SaveChanges();
        }
    }
}