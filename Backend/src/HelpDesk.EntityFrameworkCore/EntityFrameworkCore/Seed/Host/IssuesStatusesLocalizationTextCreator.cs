using Abp.Localization;
using HelpDesk.EntityFrameworkCore;
using HelpDesk.Issues;
using HelpDesk.Statuses;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HelpDesk.EntityFrameworkCore.Seed.Host
{
    public class IssuesStatusesLocalizationTextCreator
    {
        private readonly HelpDeskDbContext _context;

        public IssuesStatusesLocalizationTextCreator(HelpDeskDbContext context)
        {
            _context = context;
        }

        public void Create()
        {
            // Avvalo host (null tenant) uchun
            CreateForTenant(null);

            // So‘ngra barcha mavjud tenantlar uchun
            var tenantIds = _context.Tenants
                .IgnoreQueryFilters()
                .Select(t => t.Id)
                .ToList();

            foreach (var tenantId in tenantIds)
            {
                CreateForTenant(tenantId);
            }

            _context.SaveChanges();
        }

        private void CreateForTenant(int? tenantId)
        {
            CreateIssuesStatuses(tenantId);
            CreateIssuesStatusesLocalizationTexts(tenantId);
        }

        private void CreateIssuesStatuses(int? tenantId)
        {
            var statuses = new[]
            {
                new { Title = "New" },
                new { Title = "InProgress" },
                new { Title = "Completed" }
            };

            foreach (var status in statuses)
            {
                if (!_context.IssuesStatuses.IgnoreQueryFilters()
                        .Any(s => s.Title == status.Title && s.TenantId == tenantId))
                {
                    _context.IssuesStatuses.Add(new IssuesStatuses
                    {
                        Title = status.Title,
                        TenantId = tenantId
                    });
                }
            }
        }

        private void CreateIssuesStatusesLocalizationTexts(int? tenantId)
        {
            var items = new[]
            {
                new { Key = "New", Tg = "Нав", Ru = "Новый", En = "New" },
                new { Key = "InProgress", Tg = "Дар раванд", Ru = "В процессе", En = "In Progress" },
                new { Key = "Completed", Tg = "Анҷом ёфт", Ru = "Завершено", En = "Completed" }
            };

            foreach (var item in items)
            {
                // Тоҷикча
                if (!_context.LanguageTexts.IgnoreQueryFilters()
                        .Any(lt => lt.LanguageName == "tg" && lt.Key == item.Key && lt.Source == "HelpDesk" && lt.TenantId == tenantId))
                {
                    _context.LanguageTexts.Add(new ApplicationLanguageText
                    {
                        TenantId = tenantId,
                        LanguageName = "tg",
                        Source = "HelpDesk",
                        Key = item.Key,
                        Value = item.Tg
                    });
                }

                // Русча
                if (!_context.LanguageTexts.IgnoreQueryFilters()
                        .Any(lt => lt.LanguageName == "ru" && lt.Key == item.Key && lt.Source == "HelpDesk" && lt.TenantId == tenantId))
                {
                    _context.LanguageTexts.Add(new ApplicationLanguageText
                    {
                        TenantId = tenantId,
                        LanguageName = "ru",
                        Source = "HelpDesk",
                        Key = item.Key,
                        Value = item.Ru
                    });
                }

                // Inglizча
                if (!_context.LanguageTexts.IgnoreQueryFilters()
                        .Any(lt => lt.LanguageName == "en" && lt.Key == item.Key && lt.Source == "HelpDesk" && lt.TenantId == tenantId))
                {
                    _context.LanguageTexts.Add(new ApplicationLanguageText
                    {
                        TenantId = tenantId,
                        LanguageName = "en",
                        Source = "HelpDesk",
                        Key = item.Key,
                        Value = item.En
                    });
                }
            }
        }
    }
}
