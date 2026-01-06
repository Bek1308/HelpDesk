using Abp.Localization;
using HelpDesk.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HelpDesk.EntityFrameworkCore.Seed.Host
{
    public class IssuesCategoryLocalizationTextCreator
    {
        private readonly HelpDeskDbContext _context;
        private readonly int? _tenantId;

        public IssuesCategoryLocalizationTextCreator(HelpDeskDbContext context, int? tenantId = null)
        {
            _context = context;
            _tenantId = tenantId; // null = host
        }

        public void Create()
        {
            CreateIssuesCategoryLocalizationTexts();
        }

        private void CreateIssuesCategoryLocalizationTexts()
        {
            var items = new[]
            {
                new { Key = "CallCenter", Tg = "Дархост ба Пардохт", Ru = "Заявка по платёжам", En = "Request for Payments" },
                new { Key = "Repair", Tg = "Дархост ба Таъмир", Ru = "Заявка по ремонту", En = "Request for Repair" },
                new { Key = "TechDepartment", Tg = "Дархост ба Шуъбаи Техникӣ", Ru = "Заявка по техническому отделу", En = "Request for Tech Department" }
            };

            foreach (var item in items)
            {
                // Tojik tili
                if (!_context.LanguageTexts.IgnoreQueryFilters()
                        .Any(lt => lt.LanguageName == "tg" && lt.Key == item.Key && lt.Source == "HelpDesk" && lt.TenantId == _tenantId))
                {
                    _context.LanguageTexts.Add(new ApplicationLanguageText
                    {
                        TenantId = _tenantId,
                        LanguageName = "tg",
                        Source = "HelpDesk",
                        Key = item.Key,
                        Value = item.Tg
                    });
                }

                // Rus tili
                if (!_context.LanguageTexts.IgnoreQueryFilters()
                        .Any(lt => lt.LanguageName == "ru" && lt.Key == item.Key && lt.Source == "HelpDesk" && lt.TenantId == _tenantId))
                {
                    _context.LanguageTexts.Add(new ApplicationLanguageText
                    {
                        TenantId = _tenantId,
                        LanguageName = "ru",
                        Source = "HelpDesk",
                        Key = item.Key,
                        Value = item.Ru
                    });
                }

                // Ingliz tili
                if (!_context.LanguageTexts.IgnoreQueryFilters()
                        .Any(lt => lt.LanguageName == "en" && lt.Key == item.Key && lt.Source == "HelpDesk" && lt.TenantId == _tenantId))
                {
                    _context.LanguageTexts.Add(new ApplicationLanguageText
                    {
                        TenantId = _tenantId,
                        LanguageName = "en",
                        Source = "HelpDesk",
                        Key = item.Key,
                        Value = item.En
                    });
                }
            }

            _context.SaveChanges();
        }
    }
}
