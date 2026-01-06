using Abp;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Localization;
using Abp.Runtime.Session;
using Abp.UI;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace HelpDesk.Application.Localization
{
    public class LocalizedMessageService : ILocalizedMessageService
    {
        private readonly IRepository<ApplicationLanguageText, long> _repository;
        private readonly IAbpSession _abpSession;

        public LocalizedMessageService(
            IRepository<ApplicationLanguageText, long> repository,
            IAbpSession abpSession)
        {
            _repository = repository;
            _abpSession = abpSession;
        }

        public string L(string key)
        {
            var language = CultureInfo.CurrentUICulture.Name ?? "en"; // Cookie'dan tilni olish, default 'en'
            var source = "HelpDesk"; // Default source nomi

            var text = _repository.FirstOrDefault(t => t.Key == key && t.LanguageName == language && t.Source == source && t.TenantId == _abpSession.TenantId);

            if (text != null)
            {
                return text.Value;
            }

            // Agar til topilmasa, default tilni sinab ko'rish
            text = _repository.FirstOrDefault(t => t.Key == key && t.LanguageName == "en" && t.Source == source && t.TenantId == _abpSession.TenantId);

            if (text != null)
            {
                return text.Value;
            }

            return key;
        }

        public async Task<string> LAsync(string key)
        {
            var language = CultureInfo.CurrentUICulture.Name ?? "en";
            var source = "HelpDesk";

            var text = await _repository.FirstOrDefaultAsync(t => t.Key == key && t.LanguageName == language && t.Source == source && t.TenantId == _abpSession.TenantId);

            if (text != null)
            {
                return text.Value;
            }

            text = await _repository.FirstOrDefaultAsync(t => t.Key == key && t.LanguageName == "en" && t.Source == source && t.TenantId == _abpSession.TenantId);

            if (text != null)
            {
                return text.Value;
            }

            throw new UserFriendlyException($"Localized text for key '{key}' not found in language '{language}'.");
        }
    }

    public interface ILocalizedMessageService
    {
        string L(string key);
        Task<string> LAsync(string key);
    }
}