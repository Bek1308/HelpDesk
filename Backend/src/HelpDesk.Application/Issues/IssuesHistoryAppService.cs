using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using HelpDesk.Authorization.Users;
using HelpDesk.Issues.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace HelpDesk.Issues
{
    public class IssuesHistoryAppService : ApplicationService, IIssuesHistoryAppService
    {
        private readonly IRepository<IssuesHistory, long> _issuesHistoryRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly ILogger<IssuesHistoryAppService> _logger;

        public IssuesHistoryAppService(
            IRepository<IssuesHistory, long> issuesHistoryRepository,
            IRepository<User, long> userRepository,
            ILogger<IssuesHistoryAppService> logger,
            IAbpSession abpSession)
        {
            _issuesHistoryRepository = issuesHistoryRepository;
            _userRepository = userRepository;
            _logger = logger;
            AbpSession = abpSession;
            LocalizationSourceName = "HelpDesk"; // Localization source name
        }

        public async Task<PagedResultDto<IssuesHistoryDto>> GetHistoryByIssueIdAsync(GetHistoryByIssueInput input)
        {
            _logger.LogInformation("Starting GetHistoryByIssueIdAsync for IssueId: {IssueId}, Page: {SkipCount}/{MaxResultCount}, Sorting: {Sorting}, TenantId: {TenantId}",
                input.IssueId, input.SkipCount, input.MaxResultCount, input.Sorting, AbpSession.TenantId);

            // Input validation
            if (input.IssueId <= 0)
            {
                _logger.LogWarning("Invalid IssueId: {IssueId}", input.IssueId);
                throw new UserFriendlyException(L("InvalidIssueId"));
            }

            // Create query
            var query = CreateFilteredQuery(input);
            _logger.LogInformation("Query created for IssueId: {IssueId}", input.IssueId);

            // Check total count
            var totalCount = await query.CountAsync().ConfigureAwait(false);
            _logger.LogInformation("Total history records found: {TotalCount} for IssueId: {IssueId}", totalCount, input.IssueId);

            if (totalCount == 0)
            {
                _logger.LogWarning("No history records found for IssueId: {IssueId}. Checking Issues table...", input.IssueId);
                var issueExists = await _issuesHistoryRepository.GetAll()
                    .AnyAsync(h => h.IssueId == input.IssueId).ConfigureAwait(false);
                _logger.LogInformation("IssueId {IssueId} exists in IssuesHistory: {IssueExists}", input.IssueId, issueExists);
                return new PagedResultDto<IssuesHistoryDto>(0, new List<IssuesHistoryDto>());
            }

            // Apply sorting
            query = ApplySorting(query, input);
            _logger.LogInformation("Sorting applied: {Sorting}", input.Sorting ?? "CreationTime DESC");

            // Retrieve data
            var items = await query
                .PageBy(input)
                .ToListAsync()
                .ConfigureAwait(false);
            _logger.LogInformation("Retrieved {ItemCount} history items for IssueId: {IssueId}", items.Count, input.IssueId);

            // Map to DTOs and populate LocalizedDescription
            var dtos = items.Select(item =>
            {
                var dto = ObjectMapper.Map<IssuesHistoryDto>(item);
                var user = _userRepository.FirstOrDefault(u => u.Id == item.CreatedBy);
                dto.CreatorName = user != null ? $"{user.Name} {user.Surname}" : L("UnknownUser");

                // Parse Description and localize
                try
                {
                    if (!string.IsNullOrWhiteSpace(item.Description))
                    {
                        _logger.LogDebug("Parsing Description JSON for HistoryId: {HistoryId}, Description: {Description}", item.Id, item.Description);
                        var jsonDesc = JsonConvert.DeserializeObject<DescriptionJson>(item.Description, new JsonSerializerSettings
                        {
                            MissingMemberHandling = MissingMemberHandling.Ignore,
                            NullValueHandling = NullValueHandling.Ignore
                        });

                        if (jsonDesc != null && !string.IsNullOrWhiteSpace(jsonDesc.FieldName))
                        {
                            // Localize FieldName without 'Field_' prefix
                            var localizedFieldName = L(jsonDesc.FieldName);
                            _logger.LogDebug("Localized FieldName: {FieldName} -> {LocalizedFieldName}", jsonDesc.FieldName, localizedFieldName);

                            if (jsonDesc.IsCreation)
                            {
                                dto.LocalizedDescription = L("FieldCreatedDescription",
                                    localizedFieldName,
                                    jsonDesc.NewValue ?? L("NotAvailable"),
                                    jsonDesc.UserName ?? L("UnknownUser"));
                            }
                            else
                            {
                                dto.LocalizedDescription = L("FieldChangedDescription",
                                    localizedFieldName,
                                    jsonDesc.OriginalValue ?? L("NotAvailable"),
                                    jsonDesc.NewValue ?? L("NotAvailable"),
                                    jsonDesc.UserName ?? L("UnknownUser"));
                            }
                            _logger.LogDebug("LocalizedDescription set for HistoryId: {HistoryId}: {LocalizedDescription}", item.Id, dto.LocalizedDescription);
                        }
                        else
                        {
                            dto.LocalizedDescription = L("InvalidDescriptionFormat");
                            _logger.LogWarning("Invalid or missing JSON fields for HistoryId: {HistoryId}, Description: {Description}", item.Id, item.Description);
                        }
                    }
                    else
                    {
                        dto.LocalizedDescription = L("NoDescriptionAvailable");
                        _logger.LogWarning("Description is empty or null for HistoryId: {HistoryId}", item.Id);
                    }
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "JSON parse error for HistoryId: {HistoryId}, Description: {Description}", item.Id, item.Description);
                    dto.LocalizedDescription = L("ErrorProcessingDescription");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error for HistoryId: {HistoryId}, Description: {Description}", item.Id, item.Description);
                    dto.LocalizedDescription = L("ErrorProcessingDescription");
                }

                return dto;
            }).ToList();

            _logger.LogInformation("Returning {Count} history records for IssueId: {IssueId}", totalCount, input.IssueId);

            return new PagedResultDto<IssuesHistoryDto>(totalCount, dtos);
        }

        protected virtual IQueryable<IssuesHistory> CreateFilteredQuery(GetHistoryByIssueInput input)
        {
            var query = _issuesHistoryRepository.GetAll()
                .Where(h => h.IssueId == input.IssueId);

            // Tenant filter for multi-tenancy (optional)
            var tenantId = AbpSession.TenantId;
            if (tenantId.HasValue)
            {
                _logger.LogInformation("Applying TenantId filter: {TenantId}", tenantId);
                query = query.Where(h => h.TenantId == tenantId.Value || h.TenantId == null);
            }
            else
            {
                _logger.LogInformation("No TenantId filter applied (TenantId is null)");
            }

            return query;
        }

        protected virtual IQueryable<IssuesHistory> ApplySorting(IQueryable<IssuesHistory> query, GetHistoryByIssueInput input)
        {
            var sorting = string.IsNullOrWhiteSpace(input.Sorting) ? "CreationTime DESC" : input.Sorting;
            _logger.LogInformation("Applying sorting: {Sorting}", sorting);
            return query.OrderBy(sorting);
        }
    }

    public class DescriptionJson
    {
        public string FieldName { get; set; }
        public string OriginalValue { get; set; }
        public string NewValue { get; set; }
        public string UserName { get; set; }
        public bool IsCreation { get; set; }
    }
}