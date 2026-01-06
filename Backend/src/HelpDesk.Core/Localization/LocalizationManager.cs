using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Localization;
using Abp.Runtime.Session;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HelpDesk.Domain.Localization
{
    public class LocalizationManager : DomainService
    {
        private readonly IRepository<ApplicationLanguageText, long> _repository;
        private readonly IAbpSession _abpSession;

        public LocalizationManager(
            IRepository<ApplicationLanguageText, long> repository,
            IAbpSession abpSession)
        {
            _repository = repository;
            _abpSession = abpSession;
        }

        /// <summary>
        /// Delete all translations by key (for all languages).
        /// </summary>
        public async Task DeleteByKeyAsync(string key, string source = "HelpDesk")
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new Abp.UI.UserFriendlyException("Localization:KeyIsRequired");
            }

            var entities = await _repository.GetAllListAsync(t =>
                t.Key == key &&
                t.Source == source &&
                t.TenantId == _abpSession.TenantId
            );

            if (!entities.Any())
            {
                throw new Abp.UI.UserFriendlyException("Localization:KeyNotFound");
            }

            foreach (var entity in entities)
            {
                await _repository.DeleteAsync(entity);
            }
        }
    }
}
