using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Runtime.Caching;
using Abp.Runtime.Session;
using Abp.UI;
using AutoMapper;
using HelpDesk.Application.Localization;
using HelpDesk.Authorization;
using HelpDesk.Authorization.Users;
using HelpDesk.Category;
using HelpDesk.Cities;
using HelpDesk.FaultGroups;
using HelpDesk.Issues.Definitions;
using HelpDesk.Issues.Dto;
using HelpDesk.Repairs;
using HelpDesk.Statuses;
using HelpDesk.TechDepartment;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using IssueStatus = HelpDesk.Statuses.IssuesStatuses;
using Priority = HelpDesk.PriorityLevels.PriorityLevels;
using Service = HelpDesk.Services.Services;

namespace HelpDesk.Issues
{
    [AbpAuthorize(PermissionNames.Issues)]
    public class IssueAppService : AsyncCrudAppService<Issues, IssuesDto, long, GetAllIssuesInput, CreateIssuesDto, EditIssuesDto>, IIssueAppService
    {
        private readonly IPermissionChecker _permissionChecker;
        private readonly IAbpSession _abpSession;
        private readonly IRepository<Issues, long> _issuesRepository;
        private readonly IRepository<IssuesAssignees, long> _assigneesRepository;
        private readonly IRepository<CallCenterIssue, long> _callCenterIssueRepository;
        private readonly IRepository<RepairIssue, long> _repairIssueRepository;
        private readonly IRepository<TechDepartmentIssue, long> _techDepartmentIssueRepository;
        private readonly IRepository<ATMIssue, long> _atmIssueRepository;
        private readonly IRepository<PayvandCardIssue, long>  _payvandCardIssueRepository;
        private readonly IRepository<PayvandWalletIssue, long> _payvandWalletIssueRepository;
        private readonly IRepository<IssuesClaims, long> _issuesClaimsRepository;
        private readonly IRepository<Priority, int> _priorityRepository;
        private readonly IRepository<IssueStatus, int> _issueStatusRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly IRepository<IssuesHistory, long> _issuesHistoryRepository;
        private readonly IRepository<FaultGroup, int> _faultGroupRepository;
        private readonly IRepository<City, int> _cityRepository;
        private readonly IRepository<SubCategories, int> _subCategoryRepository;
        private readonly IRepository<Service, int> _serviceRepository;
        private readonly ICacheManager _cacheManager;
        private readonly ILocalizedMessageService _localizedMessageService;

        private const string FilterCacheKey = "IssueFilters";

        public IssueAppService(
            IRepository<Issues, long> issuesRepository,
            IPermissionChecker permissionChecker,
            IAbpSession abpSession,
            ILocalizedMessageService localizedMessageService,
            IRepository<IssuesAssignees, long> assigneesRepository,
            IRepository<CallCenterIssue, long> callCenterIssueRepository,
            IRepository<RepairIssue, long> repairIssueRepository,
            IRepository<TechDepartmentIssue, long> techDepartmentIssueRepository,
            IRepository<PayvandCardIssue, long> payvandCardIssueRepository,
            IRepository<PayvandWalletIssue, long> payvandWalletIssueRepository,
            IRepository<ATMIssue, long> atmIssueRepository,
            IRepository<IssuesClaims, long> issuesClaimsRepository,
            IRepository<Priority, int> priorityRepository,
            IRepository<IssueStatus, int> issueStatusRepository,
            IRepository<User, long> userRepository,
            IRepository<IssuesHistory, long> issuesHistoryRepository,
            IRepository<FaultGroup, int> faultGroupRepository,
            IRepository<City, int> cityRepository,
            IRepository<SubCategories, int> subCategoryRepository,
            IRepository<Service, int> serviceRepository,
            ICacheManager cacheManager)
            : base(issuesRepository)
        {
            LocalizationSourceName = "HelpDesk";
            _permissionChecker = permissionChecker;
            _abpSession = abpSession;
            _issuesRepository = issuesRepository;
            _assigneesRepository = assigneesRepository;
            _callCenterIssueRepository = callCenterIssueRepository;
            _repairIssueRepository = repairIssueRepository;
            _techDepartmentIssueRepository = techDepartmentIssueRepository;
            _atmIssueRepository = atmIssueRepository;
            _payvandCardIssueRepository = payvandCardIssueRepository;
            _payvandWalletIssueRepository = payvandWalletIssueRepository;
            _issuesClaimsRepository = issuesClaimsRepository;
            _priorityRepository = priorityRepository;
            _issueStatusRepository = issueStatusRepository;
            _userRepository = userRepository;
            _issuesHistoryRepository = issuesHistoryRepository;
            _faultGroupRepository = faultGroupRepository;
            _cityRepository = cityRepository;
            _subCategoryRepository = subCategoryRepository;
            _serviceRepository = serviceRepository;
            _cacheManager = cacheManager;
            _localizedMessageService = localizedMessageService;
        }

        private async Task LogHistory(long issueId, string fieldName, string originalValue, string newValue, bool isCreation = false)
        {
            try
            {
                var userId = _abpSession.UserId ?? throw new UserFriendlyException(L("UserNotFound"));
                var user = await _userRepository.FirstOrDefaultAsync(u => u.Id == userId);
                var userName = user != null ? user.FullName : "Unknown";

                // JSON formatida xom ma'lumotlarni saqlash
                var historyData = new
                {
                    FieldName = fieldName,
                    OriginalValue = originalValue ?? "null",
                    NewValue = newValue ?? "null",
                    UserName = userName,
                    IsCreation = isCreation
                };
                string description = JsonSerializer.Serialize(historyData);

                var history = new IssuesHistory
                {
                    IssueId = issueId,
                    FieldName = fieldName,
                    OriginalValue = originalValue,
                    NewValue = newValue,
                    Description = description,
                    CreatedBy = userId,
                    CreationTime = DateTime.UtcNow
                };
                await _issuesHistoryRepository.InsertAsync(history);
            }
            catch (Exception ex)
            {
                Logger.Error($"Error logging history for issue {issueId}, field {fieldName}: {ex.Message}", ex);
                throw new UserFriendlyException(L("DatabaseError"));
            }
        }

        private async Task UpdateAssignees(long issueId, List<long> userIds)
        {
            var oldAssignees = await _assigneesRepository.GetAllListAsync(a => a.IssueId == issueId);
            foreach (var old in oldAssignees)
            {
                await _assigneesRepository.DeleteAsync(old);
            }

            foreach (var userId in userIds)
            {
                var assignee = new IssuesAssignees { IssueId = issueId, UserId = userId };
                await _assigneesRepository.InsertAsync(assignee);
            }
        }

        private void ValidateSpecificFields<T>(T input, List<FieldDto> specificFields) where T : class
        {
            if (specificFields != null)
            {
                foreach (var field in specificFields)
                {
                    var property = typeof(T).GetProperty(field.Name);
                    if (property == null) continue;

                    var value = property.GetValue(input)?.ToString();
                    if (field.IsRequired && string.IsNullOrEmpty(value))
                    {
                        throw new UserFriendlyException($"{field.DisplayName} majburiy maydon!");
                    }
                    if (field.MaxLength.HasValue && !string.IsNullOrEmpty(value) && value.Length > field.MaxLength.Value)
                    {
                        throw new UserFriendlyException($"{field.DisplayName} uzunligi {field.MaxLength} dan oshmasligi kerak!");
                    }
                }
            }
        }

        private IQueryable<Issues> ApplySorting(IQueryable<Issues> query, IPagedAndSortedResultRequest input)
        {
            if (string.IsNullOrWhiteSpace(input.Sorting))
            {
                return query.OrderBy(e => e.Id);
            }

            var sortParts = input.Sorting.Split(' ');
            var property = sortParts[0].ToLower();
            var direction = sortParts.Length > 1 && sortParts[1].ToLower() == "desc" ? "desc" : "asc";

            IQueryable<Issues> sortedQuery = property switch
            {
                // IssuesDto fields
                "id" => direction == "desc" ? query.OrderByDescending(e => e.Id) : query.OrderBy(e => e.Id),
                "title" => direction == "desc" ? query.OrderByDescending(e => e.Title) : query.OrderBy(e => e.Title),
                "issuecategory" => direction == "desc" ? query.OrderByDescending(e => e.IssueCategory) : query.OrderBy(e => e.IssueCategory),
                "description" => direction == "desc" ? query.OrderByDescending(e => e.Description) : query.OrderBy(e => e.Description),
                "priorityid" => direction == "desc" ? query.OrderByDescending(e => e.PriorityId) : query.OrderBy(e => e.PriorityId),
                "priorityname" => direction == "desc"
                    ? query.Join(_priorityRepository.GetAll(), i => i.PriorityId, p => p.Id, (i, p) => new { Issue = i, PriorityName = p.Title })
                           .OrderByDescending(x => x.PriorityName).Select(x => x.Issue)
                    : query.Join(_priorityRepository.GetAll(), i => i.PriorityId, p => p.Id, (i, p) => new { Issue = i, PriorityName = p.Title })
                           .OrderBy(x => x.PriorityName).Select(x => x.Issue),
                "issuestatusid" => direction == "desc" ? query.OrderByDescending(e => e.IssueStatusId) : query.OrderBy(e => e.IssueStatusId),
                "issuestatusname" => direction == "desc"
                    ? query.Join(_issueStatusRepository.GetAll(), i => i.IssueStatusId, s => s.Id, (i, s) => new { Issue = i, StatusName = s.Title })
                           .OrderByDescending(x => x.StatusName).Select(x => x.Issue)
                    : query.Join(_issueStatusRepository.GetAll(), i => i.IssueStatusId, s => s.Id, (i, s) => new { Issue = i, StatusName = s.Title })
                           .OrderBy(x => x.StatusName).Select(x => x.Issue),
                "reportedby" => direction == "desc" ? query.OrderByDescending(e => e.ReportedBy) : query.OrderBy(e => e.ReportedBy),
                "reportedbyname" => direction == "desc"
                    ? query.Join(_userRepository.GetAll(), i => i.ReportedBy, u => u.Id, (i, u) => new { Issue = i, UserName = u.FullName })
                           .OrderByDescending(x => x.UserName).Select(x => x.Issue)
                    : query.Join(_userRepository.GetAll(), i => i.ReportedBy, u => u.Id, (i, u) => new { Issue = i, UserName = u.FullName })
                           .OrderBy(x => x.UserName).Select(x => x.Issue),
                "isresolved" => direction == "desc" ? query.OrderByDescending(e => e.IsResolved) : query.OrderBy(e => e.IsResolved),
                "deadline" => direction == "desc" ? query.OrderByDescending(e => e.Deadline) : query.OrderBy(e => e.Deadline),
                "resolvedtime" => direction == "desc" ? query.OrderByDescending(e => e.ResolvedTime) : query.OrderBy(e => e.ResolvedTime),
                "creationtime" => direction == "desc" ? query.OrderByDescending(e => e.CreationTime) : query.OrderBy(e => e.CreationTime),
                "lastmodificationtime" => direction == "desc" ? query.OrderByDescending(e => e.LastModificationTime) : query.OrderBy(e => e.LastModificationTime),
                "tenantid" => direction == "desc" ? query.OrderByDescending(e => e.TenantId) : query.OrderBy(e => e.TenantId),

                // CallCenterIssueQueryDto fields
                "callcenterdata.subcategoryid" => direction == "desc"
                    ? query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, SubCategoryId = c.SubCategoryId })
                           .OrderByDescending(x => x.SubCategoryId).Select(x => x.Issue)
                    : query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, SubCategoryId = c.SubCategoryId })
                           .OrderBy(x => x.SubCategoryId).Select(x => x.Issue),
                "callcenterdata.subcategoryname" => direction == "desc"
                    ? query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, SubCategoryId = c.SubCategoryId })
                           .Join(_subCategoryRepository.GetAll(), x => x.SubCategoryId, sc => sc.Id, (x, sc) => new { Issue = x.Issue, SubCategoryName = sc.Title })
                           .OrderByDescending(x => x.SubCategoryName).Select(x => x.Issue)
                    : query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, SubCategoryId = c.SubCategoryId })
                           .Join(_subCategoryRepository.GetAll(), x => x.SubCategoryId, sc => sc.Id, (x, sc) => new { Issue = x.Issue, SubCategoryName = sc.Title })
                           .OrderBy(x => x.SubCategoryName).Select(x => x.Issue),
                "callcenterdata.serviceid" => direction == "desc"
                    ? query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, ServiceId = c.ServiceId })
                           .OrderByDescending(x => x.ServiceId).Select(x => x.Issue)
                    : query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, ServiceId = c.ServiceId })
                           .OrderBy(x => x.ServiceId).Select(x => x.Issue),
                "callcenterdata.servicename" => direction == "desc"
                    ? query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, ServiceId = c.ServiceId })
                           .Join(_serviceRepository.GetAll(), x => x.ServiceId, s => s.Id, (x, s) => new { Issue = x.Issue, ServiceName = s.Name })
                           .OrderByDescending(x => x.ServiceName).Select(x => x.Issue)
                    : query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, ServiceId = c.ServiceId })
                           .Join(_serviceRepository.GetAll(), x => x.ServiceId, s => s.Id, (x, s) => new { Issue = x.Issue, ServiceName = s.Name })
                           .OrderBy(x => x.ServiceName).Select(x => x.Issue),
                "callcenterdata.wrongnumber" => direction == "desc"
                    ? query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, WrongNumber = c.WrongNumber })
                           .OrderByDescending(x => x.WrongNumber).Select(x => x.Issue)
                    : query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, WrongNumber = c.WrongNumber })
                           .OrderBy(x => x.WrongNumber).Select(x => x.Issue),
                "callcenterdata.rightnumber" => direction == "desc"
                    ? query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, RightNumber = c.RightNumber })
                           .OrderByDescending(x => x.RightNumber).Select(x => x.Issue)
                    : query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, RightNumber = c.RightNumber })
                           .OrderBy(x => x.RightNumber).Select(x => x.Issue),
                "callcenterdata.terminalnumber" => direction == "desc"
                    ? query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, TerminalNumber = c.TerminalNumber })
                           .OrderByDescending(x => x.TerminalNumber).Select(x => x.Issue)
                    : query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, TerminalNumber = c.TerminalNumber })
                           .OrderBy(x => x.TerminalNumber).Select(x => x.Issue),
                "callcenterdata.sum" => direction == "desc"
                    ? query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, Sum = c.Sum })
                           .OrderByDescending(x => x.Sum).Select(x => x.Issue)
                    : query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, Sum = c.Sum })
                           .OrderBy(x => x.Sum).Select(x => x.Issue),
                "callcenterdata.cancelledsum" => direction == "desc"
                    ? query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, CancelledSum = c.CancelledSum })
                           .OrderByDescending(x => x.CancelledSum).Select(x => x.Issue)
                    : query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, CancelledSum = c.CancelledSum })
                           .OrderBy(x => x.CancelledSum).Select(x => x.Issue),
                "callcenterdata.subscriber" => direction == "desc"
                    ? query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, Subscriber = c.Subscriber })
                           .OrderByDescending(x => x.Subscriber).Select(x => x.Issue)
                    : query.Join(_callCenterIssueRepository.GetAll(), i => i.Id, c => c.IssuesId, (i, c) => new { Issue = i, Subscriber = c.Subscriber })
                           .OrderBy(x => x.Subscriber).Select(x => x.Issue),

                // RepairIssueQueryDto fields
                "repairdata.agentfullname" => direction == "desc"
                    ? query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, AgentFullName = r.AgentFullName })
                           .OrderByDescending(x => x.AgentFullName).Select(x => x.Issue)
                    : query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, AgentFullName = r.AgentFullName })
                           .OrderBy(x => x.AgentFullName).Select(x => x.Issue),
                "repairdata.agentnumber" => direction == "desc"
                    ? query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, AgentNumber = r.AgentNumber })
                           .OrderByDescending(x => x.AgentNumber).Select(x => x.Issue)
                    : query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, AgentNumber = r.AgentNumber })
                           .OrderBy(x => x.AgentNumber).Select(x => x.Issue),
                "repairdata.equipment" => direction == "desc"
                    ? query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, Equipment = r.Equipment })
                           .OrderByDescending(x => x.Equipment).Select(x => x.Issue)
                    : query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, Equipment = r.Equipment })
                           .OrderBy(x => x.Equipment).Select(x => x.Issue),
                "repairdata.serialnumber" => direction == "desc"
                    ? query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, SerialNumber = r.SerialNumber })
                           .OrderByDescending(x => x.SerialNumber).Select(x => x.Issue)
                    : query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, SerialNumber = r.SerialNumber })
                           .OrderBy(x => x.SerialNumber).Select(x => x.Issue),
                "repairdata.issuedescription" => direction == "desc"
                    ? query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, IssueDescription = r.IssueDescription })
                           .OrderByDescending(x => x.IssueDescription).Select(x => x.Issue)
                    : query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, IssueDescription = r.IssueDescription })
                           .OrderBy(x => x.IssueDescription).Select(x => x.Issue),
                "repairdata.workamount" => direction == "desc"
                    ? query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, WorkAmount = r.WorkAmount })
                           .OrderByDescending(x => x.WorkAmount).Select(x => x.Issue)
                    : query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, WorkAmount = r.WorkAmount })
                           .OrderBy(x => x.WorkAmount).Select(x => x.Issue),
                "repairdata.replacementparts" => direction == "desc"
                    ? query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, ReplacementParts = r.ReplacementParts })
                           .OrderByDescending(x => x.ReplacementParts).Select(x => x.Issue)
                    : query.Join(_repairIssueRepository.GetAll(), i => i.Id, r => r.IssuesId, (i, r) => new { Issue = i, ReplacementParts = r.ReplacementParts })
                           .OrderBy(x => x.ReplacementParts).Select(x => x.Issue),

                // TechDepartmentIssueQueryDto fields
                "techdepartmentdata.terminalnumber" => direction == "desc"
                    ? query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, TerminalNumber = t.TerminalNumber })
                           .OrderByDescending(x => x.TerminalNumber).Select(x => x.Issue)
                    : query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, TerminalNumber = t.TerminalNumber })
                           .OrderBy(x => x.TerminalNumber).Select(x => x.Issue),
                "techdepartmentdata.terminalname" => direction == "desc"
                    ? query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, TerminalName = t.TerminalName })
                           .OrderByDescending(x => x.TerminalName).Select(x => x.Issue)
                    : query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, TerminalName = t.TerminalName })
                           .OrderBy(x => x.TerminalName).Select(x => x.Issue),
                "techdepartmentdata.agentid" => direction == "desc"
                    ? query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, AgentId = t.AgentId })
                           .OrderByDescending(x => x.AgentId).Select(x => x.Issue)
                    : query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, AgentId = t.AgentId })
                           .OrderBy(x => x.AgentId).Select(x => x.Issue),
                "techdepartmentdata.agentnumber" => direction == "desc"
                    ? query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, AgentNumber = t.AgentNumber })
                           .OrderByDescending(x => x.AgentNumber).Select(x => x.Issue)
                    : query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, AgentNumber = t.AgentNumber })
                           .OrderBy(x => x.AgentNumber).Select(x => x.Issue),
                "techdepartmentdata.issuedescription" => direction == "desc"
                    ? query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, IssueDescription = t.IssueDescription })
                           .OrderByDescending(x => x.IssueDescription).Select(x => x.Issue)
                    : query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, IssueDescription = t.IssueDescription })
                           .OrderBy(x => x.IssueDescription).Select(x => x.Issue),
                "techdepartmentdata.issuegroupid" => direction == "desc"
                    ? query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, IssueGroupId = t.IssueGroupId })
                           .OrderByDescending(x => x.IssueGroupId).Select(x => x.Issue)
                    : query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, IssueGroupId = t.IssueGroupId })
                           .OrderBy(x => x.IssueGroupId).Select(x => x.Issue),
                "techdepartmentdata.issuegroupname" => direction == "desc"
                    ? query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, IssueGroupId = t.IssueGroupId })
                           .Join(_faultGroupRepository.GetAll(), x => x.IssueGroupId, fg => fg.Id, (x, fg) => new { Issue = x.Issue, IssueGroupName = fg.Title })
                           .OrderByDescending(x => x.IssueGroupName).Select(x => x.Issue)
                    : query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, IssueGroupId = t.IssueGroupId })
                           .Join(_faultGroupRepository.GetAll(), x => x.IssueGroupId, fg => fg.Id, (x, fg) => new { Issue = x.Issue, IssueGroupName = fg.Title })
                           .OrderBy(x => x.IssueGroupName).Select(x => x.Issue),
                "techdepartmentdata.terminallocation" => direction == "desc"
                    ? query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, TerminalLocation = t.TerminalLocation })
                           .OrderByDescending(x => x.TerminalLocation).Select(x => x.Issue)
                    : query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, TerminalLocation = t.TerminalLocation })
                           .OrderBy(x => x.TerminalLocation).Select(x => x.Issue),
                "techdepartmentdata.cityid" => direction == "desc"
                    ? query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, CityId = t.CityId })
                           .OrderByDescending(x => x.CityId).Select(x => x.Issue)
                    : query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, CityId = t.CityId })
                           .OrderBy(x => x.CityId).Select(x => x.Issue),
                "techdepartmentdata.cityname" => direction == "desc"
                    ? query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, CityId = t.CityId })
                           .Join(_cityRepository.GetAll(), x => x.CityId, c => c.Id, (x, c) => new { Issue = x.Issue, CityName = c.Name })
                           .OrderByDescending(x => x.CityName).Select(x => x.Issue)
                    : query.Join(_techDepartmentIssueRepository.GetAll(), i => i.Id, t => t.IssuesId, (i, t) => new { Issue = i, CityId = t.CityId })
                           .Join(_cityRepository.GetAll(), x => x.CityId, c => c.Id, (x, c) => new { Issue = x.Issue, CityName = c.Name })
                           .OrderBy(x => x.CityName).Select(x => x.Issue),

                // IssuesClaimsDto fields
                "issuesclaims.claimkey" => direction == "desc"
                    ? query.Join(_issuesClaimsRepository.GetAll(), i => i.Id, c => c.IssueId, (i, c) => new { Issue = i, ClaimKey = c.ClaimKey })
                           .OrderByDescending(x => x.ClaimKey).Select(x => x.Issue)
                    : query.Join(_issuesClaimsRepository.GetAll(), i => i.Id, c => c.IssueId, (i, c) => new { Issue = i, ClaimKey = c.ClaimKey })
                           .OrderBy(x => x.ClaimKey).Select(x => x.Issue),
                "issuesclaims.claimvalue" => direction == "desc"
                    ? query.Join(_issuesClaimsRepository.GetAll(), i => i.Id, c => c.IssueId, (i, c) => new { Issue = i, ClaimValue = c.ClaimValue })
                           .OrderByDescending(x => x.ClaimValue).Select(x => x.Issue)
                    : query.Join(_issuesClaimsRepository.GetAll(), i => i.Id, c => c.IssueId, (i, c) => new { Issue = i, ClaimValue = c.ClaimValue })
                           .OrderBy(x => x.ClaimValue).Select(x => x.Issue),

                // AssigneeUserIds (sorting by count of assignees)
                "assigneeuserids" => direction == "desc"
                    ? query.GroupJoin(_assigneesRepository.GetAll(), i => i.Id, a => a.IssueId, (i, a) => new { Issue = i, AssigneeCount = a.Count() })
                           .OrderByDescending(x => x.AssigneeCount).Select(x => x.Issue)
                    : query.GroupJoin(_assigneesRepository.GetAll(), i => i.Id, a => a.IssueId, (i, a) => new { Issue = i, AssigneeCount = a.Count() })
                           .OrderBy(x => x.AssigneeCount).Select(x => x.Issue),

                _ => query.OrderBy(e => e.Id)
            };

            return sortedQuery;
        }

        private IQueryable<IssueWithDetails> CreateFilteredQuery(GetAllIssuesInput input)
        {
            var query = from issue in _issuesRepository.GetAll()
                        .Include(i => i.IssuesClaims)
                        .Include(i => i.CallCenterIssue)
                        .Include(i => i.RepairIssue)
                        .Include(i => i.TechDepartmentIssue)
                        join priority in _priorityRepository.GetAll() on issue.PriorityId equals priority.Id into priorityGroup
                        from priority in priorityGroup.DefaultIfEmpty()
                        join status in _issueStatusRepository.GetAll() on issue.IssueStatusId equals status.Id into statusGroup
                        from status in statusGroup.DefaultIfEmpty()
                        join user in _userRepository.GetAll() on issue.ReportedBy equals user.Id into userGroup
                        from user in userGroup.DefaultIfEmpty()
                        select new IssueWithDetails
                        {
                            Issue = issue,
                            Priority = priority ?? new Priority { Title = "Unknown" },
                            Status = status ?? new IssueStatus { Title = "Unknown" },
                        };

            // Keyword qidiruvi va boshqa filtrlar
            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(x =>
                    EF.Functions.Like(x.Issue.Title, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Issue.Description, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Issue.IssueCategory, $"%{input.Keyword}%") ||
                    x.Issue.Id.ToString().Contains(input.Keyword) ||
                    x.Issue.IssuesClaims.Any(c => EF.Functions.Like(c.ClaimKey, $"%{input.Keyword}%") || EF.Functions.Like(c.ClaimValue, $"%{input.Keyword}%")));
            }

            // Mavjud filtrlar
            if (!string.IsNullOrWhiteSpace(input.Title))
                query = query.Where(x => EF.Functions.Like(x.Issue.Title, $"%{input.Title}%"));
            if (!string.IsNullOrWhiteSpace(input.IssueCategory))
                query = query.Where(x => x.Issue.IssueCategory == input.IssueCategory);
            if (!string.IsNullOrWhiteSpace(input.Description))
                query = query.Where(x => EF.Functions.Like(x.Issue.Description, $"%{input.Description}%"));
            if (input.PriorityId.HasValue)
                query = query.Where(x => x.Issue.PriorityId == input.PriorityId.Value);
            if (input.IssueStatusId.HasValue)
                query = query.Where(x => x.Issue.IssueStatusId == input.IssueStatusId.Value);
            if (input.ReportedBy.HasValue)
                query = query.Where(x => x.Issue.ReportedBy == input.ReportedBy.Value);
            if (input.IsResolved.HasValue)
                query = query.Where(x => x.Issue.IsResolved == input.IsResolved.Value);
            if (input.DeadlineStart.HasValue)
                query = query.Where(x => x.Issue.Deadline >= input.DeadlineStart.Value);
            if (input.DeadlineEnd.HasValue)
                query = query.Where(x => x.Issue.Deadline <= input.DeadlineEnd.Value);
            if (input.ResolvedTimeStart.HasValue)
                query = query.Where(x => x.Issue.ResolvedTime >= input.ResolvedTimeStart.Value);
            if (input.ResolvedTimeEnd.HasValue)
                query = query.Where(x => x.Issue.ResolvedTime <= input.ResolvedTimeEnd.Value);
            if (input.TenantId.HasValue)
                query = query.Where(x => x.Issue.TenantId == input.TenantId.Value);
            if (!string.IsNullOrWhiteSpace(input.ClaimKey))
                query = query.Where(x => x.Issue.IssuesClaims.Any(c => EF.Functions.Like(c.ClaimKey, $"%{input.ClaimKey}%")));
            if (!string.IsNullOrWhiteSpace(input.ClaimValue))
                query = query.Where(x => x.Issue.IssuesClaims.Any(c => EF.Functions.Like(c.ClaimValue, $"%{input.ClaimValue}%")));
            if (input.AssigneeUserId.HasValue)
            {
                query = query.Join(
                    _assigneesRepository.GetAll(),
                    x => x.Issue.Id,
                    assignee => assignee.IssueId,
                    (x, assignee) => new { IssueWithDetails = x, Assignee = assignee }
                ).Where(x => x.Assignee.UserId == input.AssigneeUserId.Value)
                 .Select(x => x.IssueWithDetails);
            }

            // Yangi diapazon filtrlar
            if (input.CreationTimeStart.HasValue)
                query = query.Where(x => x.Issue.CreationTime >= input.CreationTimeStart.Value);
            if (input.CreationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.CreationTime <= input.CreationTimeEnd.Value);
            if (input.LastModificationTimeStart.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue && x.Issue.LastModificationTime.Value >= input.LastModificationTimeStart.Value);
            if (input.LastModificationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue && x.Issue.LastModificationTime.Value <= input.LastModificationTimeEnd.Value);

            return query;
        }

        [AbpAuthorize(PermissionNames.Issues_GetAll)]
        public override async Task<PagedResultDto<IssuesDto>> GetAllAsync(GetAllIssuesInput input)
        {
            input = await LoadFiltersFromSession(input);
            await SaveFiltersToSession(input);

            var query = CreateFilteredQuery(input);
            var items = await ApplySorting(query.Select(x => x.Issue), input).PageBy(input).ToListAsync();
            var totalCount = await query.CountAsync();
            var dtos = new List<IssuesDto>();

            foreach (var item in items)
            {
                var dto = await MapToDtoWithSpecificData(item);
                dtos.Add(dto);
            }

            return new PagedResultDto<IssuesDto>(totalCount, dtos);
        }

        public override async Task<IssuesDto> GetAsync(EntityDto<long> input)
        {
            var issue = await _issuesRepository.GetAll()
                .Include(i => i.IssuesClaims)
                .FirstOrDefaultAsync(i => i.Id == input.Id);

            if (issue == null)
                throw new UserFriendlyException(L("IssueNotFound", input.Id));

           
            return await MapToDtoWithSpecificData(issue);
        }

        [AbpAuthorize(PermissionNames.Issues_GetAll)]
        public async Task<PagedResultDto<IssuesDto>> GetAllCallCenterIssuesAsync(GetAllIssuesInput input)
        {
            input = await LoadFiltersFromSession(input);
            await SaveFiltersToSession(input);

            // Umumiy filtrlar uchun CreateFilteredQuery dan foydalanamiz
            var baseQuery = CreateFilteredQuery(input);

            // CallCenter maxsus JOIN va filtrlar
            var query = baseQuery
                .Join(
                    _callCenterIssueRepository.GetAll(),
                    x => x.Issue.Id,
                    callCenter => callCenter.IssuesId,
                    (x, callCenter) => new { IssueWithDetails = x, CallCenter = callCenter }
                )
                .Join(
                    _subCategoryRepository.GetAll(),
                    x => x.CallCenter.SubCategoryId,
                    subCategory => subCategory.Id,
                    (x, subCategory) => new { x.IssueWithDetails, x.CallCenter, SubCategory = subCategory }
                )
                .Join(
                    _serviceRepository.GetAll(),
                    x => x.CallCenter.ServiceId,
                    service => service.Id,
                    (x, service) => new CallCenterIssueWithDetails
                    {
                        Issue = x.IssueWithDetails.Issue,
                        CallCenter = x.CallCenter,
                        SubCategoryName = x.SubCategory.Title,
                        ServiceName = service.Name
                    }
                );

            // CallCenter maxsus filtrlar
            if (input.SubCategoryId.HasValue)
                query = query.Where(x => x.CallCenter.SubCategoryId == input.SubCategoryId.Value);
            if (input.ServiceId.HasValue)
                query = query.Where(x => x.CallCenter.ServiceId == input.ServiceId.Value);
            if (!string.IsNullOrWhiteSpace(input.WrongNumber))
                query = query.Where(x => EF.Functions.Like(x.CallCenter.WrongNumber, $"%{input.WrongNumber}%"));
            if (!string.IsNullOrWhiteSpace(input.RightNumber))
                query = query.Where(x => EF.Functions.Like(x.CallCenter.RightNumber, $"%{input.RightNumber}%"));
            if (!string.IsNullOrWhiteSpace(input.CallCenterTerminalNumber))
                query = query.Where(x => EF.Functions.Like(x.CallCenter.TerminalNumber, $"%{input.CallCenterTerminalNumber}%"));
            if (input.Sum.HasValue)
                query = query.Where(x => x.CallCenter.Sum == input.Sum.Value);
            if (input.CancelledSum.HasValue)
                query = query.Where(x => x.CallCenter.CancelledSum == input.CancelledSum.Value);
            if (!string.IsNullOrWhiteSpace(input.Subscriber))
                query = query.Where(x => EF.Functions.Like(x.CallCenter.Subscriber, $"%{input.Subscriber}%"));

            var totalCount = await query.CountAsync();
            var items = await ApplySorting(query.Select(x => x.Issue), input).PageBy(input).ToListAsync();
            var dtos = new List<IssuesDto>();

            foreach (var item in items)
            {
                var dto = await MapToDtoWithSpecificData(item);
                dtos.Add(dto);
            }

            return new PagedResultDto<IssuesDto>(totalCount, dtos);
        }

        [AbpAuthorize(PermissionNames.Issues_GetAll)]
        public async Task<PagedResultDto<IssuesDto>> GetAllRepairIssuesAsync(GetAllIssuesInput input)
        {
            input = await LoadFiltersFromSession(input);
            await SaveFiltersToSession(input);

            var baseQuery = CreateFilteredQuery(input);

            var query = baseQuery
                .Join(
                    _repairIssueRepository.GetAll(),
                    x => x.Issue.Id,
                    repair => repair.IssuesId,
                    (x, repair) => new RepairIssueWithDetails { Issue = x.Issue, Repair = repair }
                );

            if (!string.IsNullOrWhiteSpace(input.AgentFullName))
                query = query.Where(x => EF.Functions.Like(x.Repair.AgentFullName, $"%{input.AgentFullName}%"));
            if (!string.IsNullOrWhiteSpace(input.AgentNumber))
                query = query.Where(x => EF.Functions.Like(x.Repair.AgentNumber, $"%{input.AgentNumber}%"));
            if (!string.IsNullOrWhiteSpace(input.Equipment))
                query = query.Where(x => EF.Functions.Like(x.Repair.Equipment, $"%{input.Equipment}%"));
            if (!string.IsNullOrWhiteSpace(input.SerialNumber))
                query = query.Where(x => EF.Functions.Like(x.Repair.SerialNumber, $"%{input.SerialNumber}%"));
            if (!string.IsNullOrWhiteSpace(input.RepairIssueDescription))
                query = query.Where(x => EF.Functions.Like(x.Repair.IssueDescription, $"%{input.RepairIssueDescription}%"));
            if (input.WorkAmount.HasValue)
                query = query.Where(x => x.Repair.WorkAmount == input.WorkAmount.Value);
            if (!string.IsNullOrWhiteSpace(input.ReplacementParts))
                query = query.Where(x => EF.Functions.Like(x.Repair.ReplacementParts, $"%{input.ReplacementParts}%"));

            var totalCount = await query.CountAsync();
            var items = await ApplySorting(query.Select(x => x.Issue), input).PageBy(input).ToListAsync();
            var dtos = new List<IssuesDto>();

            foreach (var item in items)
            {
                var dto = await MapToDtoWithSpecificData(item);
                dtos.Add(dto);
            }

            return new PagedResultDto<IssuesDto>(totalCount, dtos);
        }

        [AbpAuthorize(PermissionNames.Issues_GetAll)]
        public async Task<PagedResultDto<IssuesDto>> GetAllTechDepartmentIssuesAsync(GetAllIssuesInput input)
        {
            // 1. Filtrlarni sessiyadan yuklab olish
            input = await LoadFiltersFromSession(input);
            await SaveFiltersToSession(input);

            // 2. Umumiy filtrlar (status, category, date, user va hokazo)
            var baseQuery = CreateFilteredQuery(input);

            // 3. TechDepartment uchun JOIN
            var query = baseQuery
                .Join(
                    _techDepartmentIssueRepository.GetAll()
                        .Include(t => t.IssueGroup)
                        .Include(t => t.City),
                    issueWithDetails => issueWithDetails.Issue.Id,
                    tech => tech.IssuesId,
                    (x, tech) => new TechDepartmentIssueWithDetails
                    {
                        Issue = x.Issue,
                        TechDepartment = tech
                    }
                );

            // 4. Keyword bo‘yicha qidiruv
            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(x =>
                    EF.Functions.Like(x.Issue.Title, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Issue.Description, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Issue.IssueCategory, $"%{input.Keyword}%") ||
                    x.Issue.Id.ToString().Contains(input.Keyword) ||
                    EF.Functions.Like(x.TechDepartment.TerminalNumber, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.TechDepartment.TerminalName, $"%{input.Keyword}%") ||
                    x.TechDepartment.AgentId.ToString().Contains(input.Keyword) ||
                    EF.Functions.Like(x.TechDepartment.AgentNumber, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.TechDepartment.IssueDescription, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.TechDepartment.TerminalLocation, $"%{input.Keyword}%") ||
                    x.Issue.IssuesClaims.Any(c =>
                        EF.Functions.Like(c.ClaimKey, $"%{input.Keyword}%") ||
                        EF.Functions.Like(c.ClaimValue, $"%{input.Keyword}%")
                    )
                );
            }

            // 5. Maxsus TechDepartment filtrlar
            if (!string.IsNullOrWhiteSpace(input.TechTerminalNumber))
                query = query.Where(x => EF.Functions.Like(x.TechDepartment.TerminalNumber, $"%{input.TechTerminalNumber}%"));

            if (!string.IsNullOrWhiteSpace(input.TerminalName))
                query = query.Where(x => EF.Functions.Like(x.TechDepartment.TerminalName, $"%{input.TerminalName}%"));

            if (input.AgentId.HasValue)
                query = query.Where(x => x.TechDepartment.AgentId == input.AgentId.Value);

            if (!string.IsNullOrWhiteSpace(input.TechAgentNumber))
                query = query.Where(x => EF.Functions.Like(x.TechDepartment.AgentNumber, $"%{input.TechAgentNumber}%"));

            if (!string.IsNullOrWhiteSpace(input.TechIssueDescription))
                query = query.Where(x => EF.Functions.Like(x.TechDepartment.IssueDescription, $"%{input.TechIssueDescription}%"));

            if (input.IssueGroupId.HasValue)
                query = query.Where(x => x.TechDepartment.IssueGroupId == input.IssueGroupId.Value);

            if (!string.IsNullOrWhiteSpace(input.TerminalLocation))
                query = query.Where(x => EF.Functions.Like(x.TechDepartment.TerminalLocation, $"%{input.TerminalLocation}%"));

            if (input.CityId.HasValue)
                query = query.Where(x => x.TechDepartment.CityId == input.CityId.Value);

            // 6. Sana bo‘yicha filtrlar (diapazon)
            if (input.CreationTimeStart.HasValue)
                query = query.Where(x => x.Issue.CreationTime >= input.CreationTimeStart.Value);

            if (input.CreationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.CreationTime <= input.CreationTimeEnd.Value);

            if (input.LastModificationTimeStart.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue &&
                                         x.Issue.LastModificationTime.Value >= input.LastModificationTimeStart.Value);

            if (input.LastModificationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue &&
                                         x.Issue.LastModificationTime.Value <= input.LastModificationTimeEnd.Value);

            // 7. Hisoblash va map qilish
            var totalCount = await query.CountAsync();

            var items = await ApplySorting(query.Select(x => x.Issue), input)
                .PageBy(input)
                .ToListAsync();

            var dtos = new List<IssuesDto>();
            foreach (var item in items)
            {
                var dto = await MapToDtoWithSpecificData(item);
                dtos.Add(dto);
            }

            return new PagedResultDto<IssuesDto>(totalCount, dtos);
        }

        [AbpAuthorize(PermissionNames.Issues_GetAll)]
        public async Task<PagedResultDto<IssuesDto>> GetAllATMIssuesAsync(GetAllIssuesInput input)
        {
            // 1. Filtrlarni sessiyadan yuklab olish
            input = await LoadFiltersFromSession(input);
            await SaveFiltersToSession(input);

            // 2. Umumiy filtrlar (status, category, date, user va hokazo)
            var baseQuery = CreateFilteredQuery(input);

            // 3. TechDepartment uchun JOIN
            var query = baseQuery
                .Join(
                    _atmIssueRepository.GetAll()
                        .Include(t => t.SubCategories),
                    issueWithDetails => issueWithDetails.Issue.Id,
                    atm => atm.IssuesId,
                    (x, atm) => new ATMIssueWithDetails
                    {
                        Issue = x.Issue,
                        ATMIssue = atm
                    }
                );

            // 4. Keyword bo‘yicha qidiruv
            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(x =>
                    EF.Functions.Like(x.Issue.Title, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Issue.Description, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Issue.IssueCategory, $"%{input.Keyword}%") ||
                    x.Issue.Id.ToString().Contains(input.Keyword) ||
                    EF.Functions.Like(x.ATMIssue.ATMNumber, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.ATMIssue.Reason, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.ATMIssue.IssuingBank, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.ATMIssue.Amount.ToString(), $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.ATMIssue.PhoneNumber, $"%{input.Keyword}%") ||
                    x.Issue.IssuesClaims.Any(c =>
                        EF.Functions.Like(c.ClaimKey, $"%{input.Keyword}%") ||
                        EF.Functions.Like(c.ClaimValue, $"%{input.Keyword}%")
                    )
                );
            }

        

            if (input.SubCategoryId.HasValue)
                query = query.Where(x => x.ATMIssue.SubCategoryId == input.SubCategoryId.Value);

            // 6. Sana bo‘yicha filtrlar (diapazon)
            if (input.CreationTimeStart.HasValue)
                query = query.Where(x => x.Issue.CreationTime >= input.CreationTimeStart.Value);

            if (input.CreationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.CreationTime <= input.CreationTimeEnd.Value);

            if (input.LastModificationTimeStart.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue &&
                                         x.Issue.LastModificationTime.Value >= input.LastModificationTimeStart.Value);

            if (input.LastModificationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue &&
                                         x.Issue.LastModificationTime.Value <= input.LastModificationTimeEnd.Value);

            // 7. Hisoblash va map qilish
            var totalCount = await query.CountAsync();

            var items = await ApplySorting(query.Select(x => x.Issue), input)
                .PageBy(input)
                .ToListAsync();

            var dtos = new List<IssuesDto>();
            foreach (var item in items)
            {
                var dto = await MapToDtoWithSpecificData(item);
                dtos.Add(dto);
            }

            return new PagedResultDto<IssuesDto>(totalCount, dtos);
        }

        [AbpAuthorize(PermissionNames.Issues_GetAll)]
        public async Task<PagedResultDto<IssuesDto>> GetAllPayvandWalletIssuesAsync(GetAllIssuesInput input)
        {
            // 1. Filtrlarni sessiyadan yuklab olish
            input = await LoadFiltersFromSession(input);
            await SaveFiltersToSession(input);

            // 2. Umumiy filtrlar (status, category, date, user va hokazo)
            var baseQuery = CreateFilteredQuery(input);

            // 3. PayvandWallet uchun JOIN
            var query = baseQuery
                .Join(
                    _payvandWalletIssueRepository.GetAll(),
                    x => x.Issue.Id,
                    payvandWallet => payvandWallet.IssuesId,
                    (x, payvandWallet) => new { IssueWithDetails = x, PayvandWallet = payvandWallet }
                )
                .Join(
                    _subCategoryRepository.GetAll(),
                    x => x.PayvandWallet.SubCategoryId,
                    subCategory => subCategory.Id,
                    (x, subCategory) => new { x.IssueWithDetails, x.PayvandWallet, SubCategory = subCategory }
                )
                .Join(
                    _serviceRepository.GetAll(),
                    x => x.PayvandWallet.ServiceId,
                    service => service.Id,
                    (x, service) => new PayvandWalletIssueWithDetails
                    {
                        Issue = x.IssueWithDetails.Issue,
                        PayvandWallet = x.PayvandWallet,
                        SubCategoryName = x.SubCategory.Title,
                        ServiceName = service.Name
                    }
                );

            // 4. Keyword bo‘yicha qidiruv
            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(x =>
                    EF.Functions.Like(x.Issue.Title, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Issue.Description, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Issue.IssueCategory, $"%{input.Keyword}%") ||
                    x.Issue.Id.ToString().Contains(input.Keyword) ||
                    EF.Functions.Like(x.PayvandWallet.WrongNumber, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.PayvandWallet.RightNumber, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.PayvandWallet.Amount.ToString(), $"%{input.Keyword}%") ||
                    x.Issue.IssuesClaims.Any(c =>
                        EF.Functions.Like(c.ClaimKey, $"%{input.Keyword}%") ||
                        EF.Functions.Like(c.ClaimValue, $"%{input.Keyword}%")
                    )
                );
            }

            // 5. Maxsus PayvandWallet filtrlar
            if (!string.IsNullOrWhiteSpace(input.WrongNumber))
                query = query.Where(x => EF.Functions.Like(x.PayvandWallet.WrongNumber, $"%{input.WrongNumber}%"));
            if (!string.IsNullOrWhiteSpace(input.RightNumber))
                query = query.Where(x => EF.Functions.Like(x.PayvandWallet.RightNumber, $"%{input.RightNumber}%"));
            if (input.ServiceId.HasValue)
                query = query.Where(x => x.PayvandWallet.ServiceId == input.ServiceId.Value);
            if (input.SubCategoryId.HasValue)
                query = query.Where(x => x.PayvandWallet.SubCategoryId == input.SubCategoryId.Value);
            if (input.Sum.HasValue)
                query = query.Where(x => x.PayvandWallet.Amount == input.Sum.Value);

            // 6. Sana bo‘yicha filtrlar (diapazon)
            if (input.CreationTimeStart.HasValue)
                query = query.Where(x => x.Issue.CreationTime >= input.CreationTimeStart.Value);
            if (input.CreationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.CreationTime <= input.CreationTimeEnd.Value);
            if (input.LastModificationTimeStart.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue &&
                                         x.Issue.LastModificationTime.Value >= input.LastModificationTimeStart.Value);
            if (input.LastModificationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue &&
                                         x.Issue.LastModificationTime.Value <= input.LastModificationTimeEnd.Value);

            // 7. Hisoblash va map qilish
            var totalCount = await query.CountAsync();

            var items = await ApplySorting(query.Select(x => x.Issue), input)
                .PageBy(input)
                .ToListAsync();

            var dtos = new List<IssuesDto>();
            foreach (var item in items)
            {
                var dto = await MapToDtoWithSpecificData(item);
                dtos.Add(dto);
            }

            return new PagedResultDto<IssuesDto>(totalCount, dtos);
        }

        [AbpAuthorize(PermissionNames.Issues_GetAll)]
        public async Task<PagedResultDto<IssuesDto>> GetAllPayvandCardIssuesAsync(GetAllIssuesInput input)
        {
            // 1. Filtrlarni sessiyadan yuklab olish
            input = await LoadFiltersFromSession(input);
            await SaveFiltersToSession(input);

            // 2. Umumiy filtrlar (status, category, date, user va hokazo)
            var baseQuery = CreateFilteredQuery(input);

            // 3. PayvandCard uchun JOIN
            var query = baseQuery
                .Join(
                    _payvandCardIssueRepository.GetAll(),
                    x => x.Issue.Id,
                    payvandCard => payvandCard.IssuesId,
                    (x, payvandCard) => new { IssueWithDetails = x, PayvandCard = payvandCard }
                )
                .Join(
                    _subCategoryRepository.GetAll(),
                    x => x.PayvandCard.SubCategoryId,
                    subCategory => subCategory.Id,
                    (x, subCategory) => new PayvandCardIssueWithDetails
                    {
                        Issue = x.IssueWithDetails.Issue,
                        PayvandCard = x.PayvandCard,
                        SubCategoryName = subCategory.Title
                    }
                );

            // 4. Keyword bo‘yicha qidiruv
            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                query = query.Where(x =>
                    EF.Functions.Like(x.Issue.Title, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Issue.Description, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Issue.IssueCategory, $"%{input.Keyword}%") ||
                    x.Issue.Id.ToString().Contains(input.Keyword) ||
                    EF.Functions.Like(x.PayvandCard.WrongNumber, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.PayvandCard.RightNumber, $"%{input.Keyword}%") ||
                    x.Issue.IssuesClaims.Any(c =>
                        EF.Functions.Like(c.ClaimKey, $"%{input.Keyword}%") ||
                        EF.Functions.Like(c.ClaimValue, $"%{input.Keyword}%")
                    )
                );
            }

            // 5. Maxsus PayvandCard filtrlar
            if (!string.IsNullOrWhiteSpace(input.WrongNumber))
                query = query.Where(x => EF.Functions.Like(x.PayvandCard.WrongNumber, $"%{input.WrongNumber}%"));
            if (!string.IsNullOrWhiteSpace(input.RightNumber))
                query = query.Where(x => EF.Functions.Like(x.PayvandCard.RightNumber, $"%{input.RightNumber}%"));
            if (input.SubCategoryId.HasValue)
                query = query.Where(x => x.PayvandCard.SubCategoryId == input.SubCategoryId.Value);

            // 6. Sana bo‘yicha filtrlar (diapazon)
            if (input.CreationTimeStart.HasValue)
                query = query.Where(x => x.Issue.CreationTime >= input.CreationTimeStart.Value);
            if (input.CreationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.CreationTime <= input.CreationTimeEnd.Value);
            if (input.LastModificationTimeStart.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue &&
                                         x.Issue.LastModificationTime.Value >= input.LastModificationTimeStart.Value);
            if (input.LastModificationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue &&
                                         x.Issue.LastModificationTime.Value <= input.LastModificationTimeEnd.Value);

            // 7. Hisoblash va map qilish
            var totalCount = await query.CountAsync();

            var items = await ApplySorting(query.Select(x => x.Issue), input)
                .PageBy(input)
                .ToListAsync();

            var dtos = new List<IssuesDto>();
            foreach (var item in items)
            {
                var dto = await MapToDtoWithSpecificData(item);
                dtos.Add(dto);
            }

            return new PagedResultDto<IssuesDto>(totalCount, dtos);
        }
        public async Task<PagedResultDto<IssuesDto>> GetMyIssuesAsync(GetAllIssuesInput input)
        {
            var currentUserId = _abpSession.UserId ?? throw new UserFriendlyException(L("UserNotFound"));
            var query = CreateFilteredQuery(input)
                .Where(x => x.Issue.ReportedBy == currentUserId);

            // Keyword qidiruvi hamma maydonlar bo'yicha (CreateFilteredQuery dagi kabi)
            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                var keywordQuery = from issue in _issuesRepository.GetAll()
                                  .Include(i => i.IssuesClaims)
                                  .Include(i => i.CallCenterIssue)
                                  .Include(i => i.RepairIssue)
                                  .Include(i => i.TechDepartmentIssue)
                                   where issue.ReportedBy == currentUserId
                                   select issue;

                keywordQuery = keywordQuery.Where(x =>
                    EF.Functions.Like(x.Title, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Description, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.IssueCategory, $"%{input.Keyword}%") ||
                    x.Id.ToString().Contains(input.Keyword) ||
                    x.IssuesClaims.Any(c => EF.Functions.Like(c.ClaimKey, $"%{input.Keyword}%") || EF.Functions.Like(c.ClaimValue, $"%{input.Keyword}%")) ||
                    (x.CallCenterIssue != null && (
                        EF.Functions.Like(x.CallCenterIssue.WrongNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.CallCenterIssue.RightNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.CallCenterIssue.TerminalNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.CallCenterIssue.Subscriber, $"%{input.Keyword}%"))) ||
                    (x.RepairIssue != null && (
                        EF.Functions.Like(x.RepairIssue.AgentFullName, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.RepairIssue.AgentNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.RepairIssue.Equipment, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.RepairIssue.SerialNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.RepairIssue.IssueDescription, $"%{input.Keyword}%"))) ||
                    (x.TechDepartmentIssue != null && (
                        EF.Functions.Like(x.TechDepartmentIssue.TerminalNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.TechDepartmentIssue.TerminalName, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.TechDepartmentIssue.AgentNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.TechDepartmentIssue.IssueDescription, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.TechDepartmentIssue.TerminalLocation, $"%{input.Keyword}%")))
                );

                query = query.Where(x => keywordQuery.Any(k => k.Id == x.Issue.Id));
            }

            var totalCount = await query.CountAsync();
            var items = await ApplySorting(query.Select(x => x.Issue), input).PageBy(input).ToListAsync();
            var dtos = new List<IssuesDto>();

            foreach (var item in items)
            {
                var dto = await MapToDtoWithSpecificData(item);
                dtos.Add(dto);
            }

            return new PagedResultDto<IssuesDto>(totalCount, dtos);
        }

        public async Task<PagedResultDto<IssuesDto>> GetAssignedToMeAsync(GetAllIssuesInput input)
        {
            var currentUserId = _abpSession.UserId ?? throw new UserFriendlyException(L("UserNotFound"));
            var query = CreateFilteredQuery(input)
                .Join(
                    _assigneesRepository.GetAll(),
                    x => x.Issue.Id,
                    assignee => assignee.IssueId,
                    (x, assignee) => new { IssueWithDetails = x, Assignee = assignee }
                )
                .Where(x => x.Assignee.UserId == currentUserId && !x.IssueWithDetails.Issue.IsResolved)
                .Select(x => x.IssueWithDetails);

            // Keyword qidiruvi hamma maydonlar bo'yicha
            if (!string.IsNullOrWhiteSpace(input.Keyword))
            {
                var keywordQuery = from issue in _issuesRepository.GetAll()
                                  .Include(i => i.IssuesClaims)
                                  .Include(i => i.CallCenterIssue)
                                  .Include(i => i.RepairIssue)
                                  .Include(i => i.TechDepartmentIssue)
                                   join assignee in _assigneesRepository.GetAll() on issue.Id equals assignee.IssueId
                                   where assignee.UserId == currentUserId && !issue.IsResolved
                                   select issue;

                keywordQuery = keywordQuery.Where(x =>
                    EF.Functions.Like(x.Title, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.Description, $"%{input.Keyword}%") ||
                    EF.Functions.Like(x.IssueCategory, $"%{input.Keyword}%") ||
                    x.Id.ToString().Contains(input.Keyword) ||
                    x.IssuesClaims.Any(c => EF.Functions.Like(c.ClaimKey, $"%{input.Keyword}%") || EF.Functions.Like(c.ClaimValue, $"%{input.Keyword}%")) ||
                    (x.CallCenterIssue != null && (
                        EF.Functions.Like(x.CallCenterIssue.WrongNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.CallCenterIssue.RightNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.CallCenterIssue.TerminalNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.CallCenterIssue.Subscriber, $"%{input.Keyword}%"))) ||
                    (x.RepairIssue != null && (
                        EF.Functions.Like(x.RepairIssue.AgentFullName, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.RepairIssue.AgentNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.RepairIssue.Equipment, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.RepairIssue.SerialNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.RepairIssue.IssueDescription, $"%{input.Keyword}%"))) ||
                    (x.TechDepartmentIssue != null && (
                        EF.Functions.Like(x.TechDepartmentIssue.TerminalNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.TechDepartmentIssue.TerminalName, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.TechDepartmentIssue.AgentNumber, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.TechDepartmentIssue.IssueDescription, $"%{input.Keyword}%") ||
                        EF.Functions.Like(x.TechDepartmentIssue.TerminalLocation, $"%{input.Keyword}%"))));

                query = query.Where(x => keywordQuery.Any(k => k.Id == x.Issue.Id));
            }

            // Yangi diapazon filtrlar
            if (input.CreationTimeStart.HasValue)
                query = query.Where(x => x.Issue.CreationTime >= input.CreationTimeStart.Value);
            if (input.CreationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.CreationTime <= input.CreationTimeEnd.Value);
            if (input.LastModificationTimeStart.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue && x.Issue.LastModificationTime.Value >= input.LastModificationTimeStart.Value);
            if (input.LastModificationTimeEnd.HasValue)
                query = query.Where(x => x.Issue.LastModificationTime.HasValue && x.Issue.LastModificationTime.Value <= input.LastModificationTimeEnd.Value);

            var totalCount = await query.CountAsync();
            var items = await ApplySorting(query.Select(x => x.Issue), input).PageBy(input).ToListAsync();
            var dtos = new List<IssuesDto>();

            foreach (var item in items)
            {
                var dto = await MapToDtoWithSpecificData(item);
                dtos.Add(dto);
            }

            return new PagedResultDto<IssuesDto>(totalCount, dtos);
        }

        public override async Task<IssuesDto> CreateAsync(CreateIssuesDto input)
        {
            try
            {
                if (_abpSession.UserId == null)
                    throw new UserFriendlyException(L("UserNotFound"));

                
                if (input.IssueCategory != "Classic")
                {
                    if (!IssueCategoryDefinitions.Categories.Any(c => c.Category == input.IssueCategory))
                        throw new UserFriendlyException(L("InvalidIssueCategory", input.IssueCategory));
                }

                if (input.IssueStatusId == null || input.IssueStatusId == 0)
                {
                    var defaultStatus = await _issueStatusRepository
                        .FirstOrDefaultAsync(s => s.Title == "New" && s.TenantId == _abpSession.TenantId);

                    if (defaultStatus == null)
                    {
                        throw new UserFriendlyException("Default Issue Status not found for this tenant.");
                    }

                    input.IssueStatusId = defaultStatus.Id;
                }

                var issue = new Issues
                {
                    Title = input.Title,
                    IssueCategory = input.IssueCategory,
                    Description = input.Description,
                    PriorityId = input.PriorityId,
                    IssueStatusId = input.IssueStatusId,
                    ReportedBy = _abpSession.UserId.Value,
                    Deadline = input.Deadline,
                    IsResolved = input.IsResolved,
                    ClientFullName = input.ClientFullName,
                    Gender = input.Gender,
                    TenantId = _abpSession.TenantId
                };

                var specificFields = IssueCategoryDefinitions.Categories
                    .FirstOrDefault(c => c.Category == input.IssueCategory)?.SpecificFields;

                if (input.IssueCategory == "CallCenter")
                {
                    if (input.CallCenterData == null)
                        throw new UserFriendlyException(L("ValidationError", "CallCenterData is required"));
                    ValidateSpecificFields(input.CallCenterData, specificFields);
                    var callCenterIssue = new CallCenterIssue
                    {
                        SubCategoryId = input.CallCenterData.SubCategoryId,
                        ServiceId = input.CallCenterData.ServiceId,
                        WrongNumber = input.CallCenterData.WrongNumber,
                        RightNumber = input.CallCenterData.RightNumber,
                        TerminalNumber = input.CallCenterData.TerminalNumber,
                        Sum = input.CallCenterData.Sum,
                        CancelledSum = input.CallCenterData.CancelledSum,
                        Subscriber = input.CallCenterData.Subscriber,
                        TenantId = _abpSession.TenantId
                    };
                    issue.CallCenterIssue = callCenterIssue;
                }
                else if (input.IssueCategory == "Repair")
                {
                    if (input.RepairData == null)
                        throw new UserFriendlyException(L("ValidationError", "RepairData is required"));
                    ValidateSpecificFields(input.RepairData, specificFields);
                    var repairIssue = new RepairIssue
                    {
                        AgentFullName = input.RepairData.AgentFullName,
                        AgentNumber = input.RepairData.AgentNumber,
                        Equipment = input.RepairData.Equipment,
                        SerialNumber = input.RepairData.SerialNumber,
                        IssueDescription = input.RepairData.IssueDescription,
                        WorkAmount = input.RepairData.WorkAmount,
                        ReplacementParts = input.RepairData.ReplacementParts,
                        TenantId = _abpSession.TenantId
                    };
                    issue.RepairIssue = repairIssue;
                }
                else if (input.IssueCategory == "TechDepartment")
                {
                    if (input.TechDepartmentData == null)
                        throw new UserFriendlyException(L("ValidationError", "TechDepartmentData is required"));
                    ValidateSpecificFields(input.TechDepartmentData, specificFields);
                    var techDepartmentIssue = new TechDepartmentIssue
                    {
                        TerminalNumber = input.TechDepartmentData.TerminalNumber,
                        TerminalName = input.TechDepartmentData.TerminalName,
                        AgentId = input.TechDepartmentData.AgentId,
                        AgentNumber = input.TechDepartmentData.AgentNumber,
                        IssueDescription = input.TechDepartmentData.IssueDescription,
                        IssueGroupId = input.TechDepartmentData.IssueGroupId,
                        TerminalLocation = input.TechDepartmentData.TerminalLocation,
                        CityId = input.TechDepartmentData.CityId,
                        TenantId = _abpSession.TenantId
                    };
                    issue.TechDepartmentIssue = techDepartmentIssue;
                }
                else if (input.IssueCategory == "AtmIssues")
                {
                    if (input.ATMData == null)
                        throw new UserFriendlyException(L("ValidationError", "ATMData is required"));
                    ValidateSpecificFields(input.ATMData, specificFields);
                    var atmIssue = new ATMIssue
                    {
                        ATMNumber = input.ATMData.ATMNumber,
                        Reason = input.ATMData.Reason,
                        IssuingBank = input.ATMData.IssuingBank,
                        Amount = input.ATMData.Amount,
                        PhoneNumber = input.ATMData.PhoneNumber,
                        SubCategoryId = input.ATMData.SubCategoryId,
                        TenantId = _abpSession.TenantId
                    };
                    issue.ATMIssue = atmIssue;
                }
                else if (input.IssueCategory == "PayvandWallet")
                {
                    if (input.PayvandWalletData == null)
                        throw new UserFriendlyException(L("ValidationError", "PayvandWalletData is required"));
                    ValidateSpecificFields(input.PayvandWalletData, specificFields);
                    var payvandWalletIssue = new PayvandWalletIssue
                    {
                        WrongNumber = input.PayvandWalletData.WrongNumber,
                        RightNumber = input.PayvandWalletData.RightNumber,
                        ServiceId = input.PayvandWalletData.ServiceId,
                        Amount = input.PayvandWalletData.Amount,
                        SubCategoryId = input.PayvandWalletData.SubCategoryId,
                        TenantId = _abpSession.TenantId
                    };
                    issue.PayvandWalletIssue = payvandWalletIssue;
                }
                else if (input.IssueCategory == "PayvandCard")
                {
                    if (input.PayvandCardData == null)
                        throw new UserFriendlyException(L("ValidationError", "PayvandCardData is required"));
                    ValidateSpecificFields(input.PayvandCardData, specificFields);
                    var payvandCardIssue = new PayvandCardIssue
                    {
                        WrongNumber = input.PayvandCardData.WrongNumber,
                        RightNumber = input.PayvandCardData.RightNumber,
                        SubCategoryId = input.PayvandCardData.SubCategoryId,
                        TenantId = _abpSession.TenantId
                    };
                    issue.PayvandCardIssue = payvandCardIssue;
                }

                var issueId = await _issuesRepository.InsertAndGetIdAsync(issue);

                // Tarixga yozish
                await LogHistory(issueId, "Issue", null, "Created", true);

                if (input.IssueCategory == "CallCenter")
                {
                    var subCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == input.CallCenterData.SubCategoryId);
                    var service = await _serviceRepository.FirstOrDefaultAsync(s => s.Id == input.CallCenterData.ServiceId);

                    await LogHistory(issueId, "CallCenter.SubCategoryId", null, subCategory?.Title ?? input.CallCenterData.SubCategoryId.ToString(), true);
                    await LogHistory(issueId, "CallCenter.ServiceId", null, service?.Name ?? input.CallCenterData.ServiceId.ToString(), true);
                    await LogHistory(issueId, "CallCenter.WrongNumber", null, input.CallCenterData.WrongNumber, true);
                    await LogHistory(issueId, "CallCenter.RightNumber", null, input.CallCenterData.RightNumber, true);
                    await LogHistory(issueId, "CallCenter.TerminalNumber", null, input.CallCenterData.TerminalNumber, true);
                    await LogHistory(issueId, "CallCenter.Sum", null, input.CallCenterData.Sum.ToString(), true);
                    await LogHistory(issueId, "CallCenter.CancelledSum", null, input.CallCenterData.CancelledSum.ToString(), true);
                    await LogHistory(issueId, "CallCenter.Subscriber", null, input.CallCenterData.Subscriber, true);
                }
                else if (input.IssueCategory == "Repair")
                {
                    await LogHistory(issueId, "Repair.AgentFullName", null, input.RepairData.AgentFullName, true);
                    await LogHistory(issueId, "Repair.AgentNumber", null, input.RepairData.AgentNumber, true);
                    await LogHistory(issueId, "Repair.Equipment", null, input.RepairData.Equipment, true);
                    await LogHistory(issueId, "Repair.SerialNumber", null, input.RepairData.SerialNumber, true);
                    await LogHistory(issueId, "Repair.IssueDescription", null, input.RepairData.IssueDescription, true);
                    await LogHistory(issueId, "Repair.WorkAmount", null, input.RepairData.WorkAmount.ToString(), true);
                    await LogHistory(issueId, "Repair.ReplacementParts", null, input.RepairData.ReplacementParts, true);
                }
                else if (input.IssueCategory == "TechDepartment")
                {
                    var faultGroup = await _faultGroupRepository.FirstOrDefaultAsync(fg => fg.Id == input.TechDepartmentData.IssueGroupId);
                    var city = await _cityRepository.FirstOrDefaultAsync(c => c.Id == input.TechDepartmentData.CityId);
                    await LogHistory(issueId, "TechDepartment.TerminalNumber", null, input.TechDepartmentData.TerminalNumber, true);
                    await LogHistory(issueId, "TechDepartment.TerminalName", null, input.TechDepartmentData.TerminalName, true);
                    await LogHistory(issueId, "TechDepartment.AgentId", null, input.TechDepartmentData.AgentId.ToString(), true);
                    await LogHistory(issueId, "TechDepartment.AgentNumber", null, input.TechDepartmentData.AgentNumber, true);
                    await LogHistory(issueId, "TechDepartment.IssueDescription", null, input.TechDepartmentData.IssueDescription, true);
                    await LogHistory(issueId, "TechDepartment.IssueGroupId", null, faultGroup?.Title ?? input.TechDepartmentData.IssueGroupId.ToString(), true);
                    await LogHistory(issueId, "TechDepartment.TerminalLocation", null, input.TechDepartmentData.TerminalLocation, true);
                    await LogHistory(issueId, "TechDepartment.CityId", null, city?.Name ?? input.TechDepartmentData.CityId.ToString(), true);
                }
                else if (input.IssueCategory == "AtmIssues")
                {
                    var subCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == input.ATMData.SubCategoryId);
                    await LogHistory(issueId, "AtmIssues.ATMNumber", null, input.ATMData.ATMNumber, true);
                    await LogHistory(issueId, "AtmIssues.Reason", null, input.ATMData.Reason, true);
                    await LogHistory(issueId, "AtmIssues.IssuingBank", null, input.ATMData.IssuingBank, true);
                    await LogHistory(issueId, "AtmIssues.Amount", null, input.ATMData.Amount.ToString(), true);
                    await LogHistory(issueId, "AtmIssues.PhoneNumber", null, input.ATMData.PhoneNumber, true);
                    await LogHistory(issueId, "AtmIssues.SubCategoryId", null, subCategory?.Title ?? input.ATMData.SubCategoryId.ToString(), true);
                }
                else if (input.IssueCategory == "PayvandWallet")
                {
                    var subCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == input.PayvandWalletData.SubCategoryId);
                    var service = await _serviceRepository.FirstOrDefaultAsync(s => s.Id == input.PayvandWalletData.ServiceId);
                    await LogHistory(issueId, "PayvandWallet.WrongNumber", null, input.PayvandWalletData.WrongNumber, true);
                    await LogHistory(issueId, "PayvandWallet.RightNumber", null, input.PayvandWalletData.RightNumber, true);
                    await LogHistory(issueId, "PayvandWallet.ServiceId", null, service?.Name ?? input.PayvandWalletData.ServiceId.ToString(), true);
                    await LogHistory(issueId, "PayvandWallet.Amount", null, input.PayvandWalletData.Amount.ToString(), true);
                    await LogHistory(issueId, "PayvandWallet.SubCategoryId", null, subCategory?.Title ?? input.PayvandWalletData.SubCategoryId.ToString(), true);
                }
                else if (input.IssueCategory == "PayvandCard")
                {
                    var subCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == input.PayvandCardData.SubCategoryId);
                    await LogHistory(issueId, "PayvandCard.WrongNumber", null, input.PayvandCardData.WrongNumber, true);
                    await LogHistory(issueId, "PayvandCard.RightNumber", null, input.PayvandCardData.RightNumber, true);
                    await LogHistory(issueId, "PayvandCard.SubCategoryId", null, subCategory?.Title ?? input.PayvandCardData.SubCategoryId.ToString(), true);
                }

                if (input.AssigneeUserIds != null && input.AssigneeUserIds.Any())
                {
                    await UpdateAssignees(issueId, input.AssigneeUserIds);
                    await LogHistory(issueId, "Assignees", null, string.Join(", ", input.AssigneeUserIds), true);
                }

                if (input.IssuesClaims != null && input.IssuesClaims.Any())
                {
                    foreach (var claim in input.IssuesClaims)
                    {
                        var issueClaim = new IssuesClaims
                        {
                            IssueId = issueId,
                            ClaimKey = claim.ClaimKey,
                            ClaimValue = claim.ClaimValue
                        };
                        await _issuesClaimsRepository.InsertAsync(issueClaim);
                        await LogHistory(issueId, $"IssuesClaims.{claim.ClaimKey}", null, claim.ClaimValue, true);
                    }
                }

                return await MapToDtoWithSpecificData(issue);
            }
            catch (UserFriendlyException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.Error($"Error creating issue: {ex.Message}", ex);
                throw new UserFriendlyException(L("DatabaseError"));
            }
        }

        public override async Task<IssuesDto> UpdateAsync(EditIssuesDto input)
        {
            try
            {
                var issue = await _issuesRepository.FirstOrDefaultAsync(input.Id);
                if (issue == null)
                    throw new UserFriendlyException(L("IssueNotFound", input.Id));

                if (!IssueCategoryDefinitions.Categories.Any(c => c.Category == input.IssueCategory))
                    throw new UserFriendlyException(L("InvalidIssueCategory", input.IssueCategory));

                var originalIssue = ObjectMapper.Map<Issues>(issue);

                if (issue.Title != input.Title)
                {
                    await LogHistory(issue.Id, "Title", issue.Title, input.Title);
                    issue.Title = input.Title;
                }
                if (issue.IssueCategory != input.IssueCategory)
                {
                    await LogHistory(issue.Id, "IssueCategory", issue.IssueCategory, input.IssueCategory);
                    issue.IssueCategory = input.IssueCategory;
                }
                if (issue.Description != input.Description)
                {
                    await LogHistory(issue.Id, "Description", issue.Description, input.Description);
                    issue.Description = input.Description;
                }
                if (issue.PriorityId != input.PriorityId)
                {
                    await LogHistory(issue.Id, "PriorityId", issue.PriorityId.ToString(), input.PriorityId.ToString());
                    issue.PriorityId = input.PriorityId;
                }
                if (issue.IssueStatusId != input.IssueStatusId)
                {
                    await LogHistory(issue.Id, "IssueStatusId", issue.IssueStatusId.ToString(), input.IssueStatusId.ToString());
                    issue.IssueStatusId = input.IssueStatusId;
                }
                if (issue.Deadline != input.Deadline)
                {
                    await LogHistory(issue.Id, "Deadline", issue.Deadline?.ToString(), input.Deadline?.ToString());
                    issue.Deadline = input.Deadline;
                }
                if (issue.IsResolved != input.IsResolved)
                {
                    await LogHistory(issue.Id, "IsResolved", issue.IsResolved.ToString(), input.IsResolved.ToString());
                    issue.IsResolved = input.IsResolved;
                }
                if (issue.ResolvedTime != input.ResolvedTime)
                {
                    await LogHistory(issue.Id, "ResolvedTime", issue.ResolvedTime?.ToString(), input.ResolvedTime?.ToString());
                    issue.ResolvedTime = input.ResolvedTime;
                }

                var specificFields = IssueCategoryDefinitions.Categories
                    .FirstOrDefault(c => c.Category == input.IssueCategory)?.SpecificFields;

                if (input.IssueCategory == "CallCenter")
                {
                    if (input.CallCenterData == null)
                        throw new UserFriendlyException(L("ValidationError", "CallCenterData is required"));
                    ValidateSpecificFields(input.CallCenterData, specificFields);
                    var callCenterIssue = await _callCenterIssueRepository.FirstOrDefaultAsync(c => c.IssuesId == input.Id);
                    if (callCenterIssue != null)
                    {
                        var oldSubCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == callCenterIssue.SubCategoryId);
                        var newSubCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == input.CallCenterData.SubCategoryId);
                        var oldService = await _serviceRepository.FirstOrDefaultAsync(s => s.Id == callCenterIssue.ServiceId);
                        var newService = await _serviceRepository.FirstOrDefaultAsync(s => s.Id == input.CallCenterData.ServiceId);

                        if (callCenterIssue.SubCategoryId != input.CallCenterData.SubCategoryId)
                        {
                            await LogHistory(input.Id, "CallCenter.SubCategoryId", oldSubCategory?.Title ?? callCenterIssue.SubCategoryId.ToString(), newSubCategory?.Title ?? input.CallCenterData.SubCategoryId.ToString());
                            callCenterIssue.SubCategoryId = input.CallCenterData.SubCategoryId;
                        }
                        if (callCenterIssue.ServiceId != input.CallCenterData.ServiceId)
                        {
                            await LogHistory(input.Id, "CallCenter.ServiceId", oldService?.Name ?? callCenterIssue.ServiceId.ToString(), newService?.Name ?? input.CallCenterData.ServiceId.ToString());
                            callCenterIssue.ServiceId = input.CallCenterData.ServiceId;
                        }
                        if (callCenterIssue.WrongNumber != input.CallCenterData.WrongNumber)
                        {
                            await LogHistory(input.Id, "CallCenter.WrongNumber", callCenterIssue.WrongNumber, input.CallCenterData.WrongNumber);
                            callCenterIssue.WrongNumber = input.CallCenterData.WrongNumber;
                        }
                        if (callCenterIssue.RightNumber != input.CallCenterData.RightNumber)
                        {
                            await LogHistory(input.Id, "CallCenter.RightNumber", callCenterIssue.RightNumber, input.CallCenterData.RightNumber);
                            callCenterIssue.RightNumber = input.CallCenterData.RightNumber;
                        }
                        if (callCenterIssue.TerminalNumber != input.CallCenterData.TerminalNumber)
                        {
                            await LogHistory(input.Id, "CallCenter.TerminalNumber", callCenterIssue.TerminalNumber, input.CallCenterData.TerminalNumber);
                            callCenterIssue.TerminalNumber = input.CallCenterData.TerminalNumber;
                        }
                        if (callCenterIssue.Sum != input.CallCenterData.Sum)
                        {
                            await LogHistory(input.Id, "CallCenter.Sum", callCenterIssue.Sum.ToString(), input.CallCenterData.Sum.ToString());
                            callCenterIssue.Sum = input.CallCenterData.Sum;
                        }
                        if (callCenterIssue.CancelledSum != input.CallCenterData.CancelledSum)
                        {
                            await LogHistory(input.Id, "CallCenter.CancelledSum", callCenterIssue.CancelledSum.ToString(), input.CallCenterData.CancelledSum.ToString());
                            callCenterIssue.CancelledSum = input.CallCenterData.CancelledSum;
                        }
                        if (callCenterIssue.Subscriber != input.CallCenterData.Subscriber)
                        {
                            await LogHistory(input.Id, "CallCenter.Subscriber", callCenterIssue.Subscriber, input.CallCenterData.Subscriber);
                            callCenterIssue.Subscriber = input.CallCenterData.Subscriber;
                        }

                        await _callCenterIssueRepository.UpdateAsync(callCenterIssue);
                    }
                    else
                    {
                        var newCallCenterIssue = new CallCenterIssue
                        {
                            IssuesId = input.Id,
                            SubCategoryId = input.CallCenterData.SubCategoryId,
                            ServiceId = input.CallCenterData.ServiceId,
                            WrongNumber = input.CallCenterData.WrongNumber,
                            RightNumber = input.CallCenterData.RightNumber,
                            TerminalNumber = input.CallCenterData.TerminalNumber,
                            Sum = input.CallCenterData.Sum,
                            CancelledSum = input.CallCenterData.CancelledSum,
                            Subscriber = input.CallCenterData.Subscriber,
                            TenantId = _abpSession.TenantId
                        };
                        await _callCenterIssueRepository.InsertAsync(newCallCenterIssue);
                        await LogHistory(input.Id, "CallCenter", null, "Created", true);
                    }
                }
                else
                {
                    if (await _callCenterIssueRepository.FirstOrDefaultAsync(c => c.IssuesId == input.Id) != null)
                    {
                        await LogHistory(input.Id, "CallCenter", "Exists", "Removed");
                        await _callCenterIssueRepository.DeleteAsync(c => c.IssuesId == input.Id);
                    }
                }

                if (input.IssueCategory == "Repair")
                {
                    if (input.RepairData == null)
                        throw new UserFriendlyException(L("ValidationError", "RepairData is required"));
                    ValidateSpecificFields(input.RepairData, specificFields);
                    var repairIssue = await _repairIssueRepository.FirstOrDefaultAsync(r => r.IssuesId == input.Id);
                    if (repairIssue != null)
                    {
                        if (repairIssue.AgentFullName != input.RepairData.AgentFullName)
                        {
                            await LogHistory(input.Id, "Repair.AgentFullName", repairIssue.AgentFullName, input.RepairData.AgentFullName);
                            repairIssue.AgentFullName = input.RepairData.AgentFullName;
                        }
                        if (repairIssue.AgentNumber != input.RepairData.AgentNumber)
                        {
                            await LogHistory(input.Id, "Repair.AgentNumber", repairIssue.AgentNumber, input.RepairData.AgentNumber);
                            repairIssue.AgentNumber = input.RepairData.AgentNumber;
                        }
                        if (repairIssue.Equipment != input.RepairData.Equipment)
                        {
                            await LogHistory(input.Id, "Repair.Equipment", repairIssue.Equipment, input.RepairData.Equipment);
                            repairIssue.Equipment = input.RepairData.Equipment;
                        }
                        if (repairIssue.SerialNumber != input.RepairData.SerialNumber)
                        {
                            await LogHistory(input.Id, "Repair.SerialNumber", repairIssue.SerialNumber, input.RepairData.SerialNumber);
                            repairIssue.SerialNumber = input.RepairData.SerialNumber;
                        }
                        if (repairIssue.IssueDescription != input.RepairData.IssueDescription)
                        {
                            await LogHistory(input.Id, "Repair.IssueDescription", repairIssue.IssueDescription, input.RepairData.IssueDescription);
                            repairIssue.IssueDescription = input.RepairData.IssueDescription;
                        }
                        if (repairIssue.WorkAmount != input.RepairData.WorkAmount)
                        {
                            await LogHistory(input.Id, "Repair.WorkAmount", repairIssue.WorkAmount.ToString(), input.RepairData.WorkAmount.ToString());
                            repairIssue.WorkAmount = input.RepairData.WorkAmount;
                        }
                        if (repairIssue.ReplacementParts != input.RepairData.ReplacementParts)
                        {
                            await LogHistory(input.Id, "Repair.ReplacementParts", repairIssue.ReplacementParts, input.RepairData.ReplacementParts);
                            repairIssue.ReplacementParts = input.RepairData.ReplacementParts;
                        }
                        await _repairIssueRepository.UpdateAsync(repairIssue);
                    }
                    else
                    {
                        var newRepairIssue = new RepairIssue
                        {
                            IssuesId = input.Id,
                            AgentFullName = input.RepairData.AgentFullName,
                            AgentNumber = input.RepairData.AgentNumber,
                            Equipment = input.RepairData.Equipment,
                            SerialNumber = input.RepairData.SerialNumber,
                            IssueDescription = input.RepairData.IssueDescription,
                            WorkAmount = input.RepairData.WorkAmount,
                            ReplacementParts = input.RepairData.ReplacementParts,
                            TenantId = _abpSession.TenantId
                        };
                        await _repairIssueRepository.InsertAsync(newRepairIssue);
                        await LogHistory(input.Id, "Repair", null, "Created", true);
                    }
                }
                else
                {
                    if (await _repairIssueRepository.FirstOrDefaultAsync(r => r.IssuesId == input.Id) != null)
                    {
                        await LogHistory(input.Id, "Repair", "Exists", "Removed");
                        await _repairIssueRepository.DeleteAsync(r => r.IssuesId == input.Id);
                    }
                }

                if (input.IssueCategory == "TechDepartment")
                {
                    if (input.TechDepartmentData == null)
                        throw new UserFriendlyException(L("ValidationError", "TechDepartmentData is required"));
                    ValidateSpecificFields(input.TechDepartmentData, specificFields);
                    var techDepartmentIssue = await _techDepartmentIssueRepository.FirstOrDefaultAsync(t => t.IssuesId == input.Id);
                    if (techDepartmentIssue != null)
                    {
                        var oldFaultGroup = await _faultGroupRepository.FirstOrDefaultAsync(fg => fg.Id == techDepartmentIssue.IssueGroupId);
                        var newFaultGroup = await _faultGroupRepository.FirstOrDefaultAsync(fg => fg.Id == input.TechDepartmentData.IssueGroupId);
                        var oldCity = await _cityRepository.FirstOrDefaultAsync(c => c.Id == techDepartmentIssue.CityId);
                        var newCity = await _cityRepository.FirstOrDefaultAsync(c => c.Id == input.TechDepartmentData.CityId);

                        if (techDepartmentIssue.TerminalNumber != input.TechDepartmentData.TerminalNumber)
                        {
                            await LogHistory(input.Id, "TechDepartment.TerminalNumber", techDepartmentIssue.TerminalNumber, input.TechDepartmentData.TerminalNumber);
                            techDepartmentIssue.TerminalNumber = input.TechDepartmentData.TerminalNumber;
                        }
                        if (techDepartmentIssue.TerminalName != input.TechDepartmentData.TerminalName)
                        {
                            await LogHistory(input.Id, "TechDepartment.TerminalName", techDepartmentIssue.TerminalName, input.TechDepartmentData.TerminalName);
                            techDepartmentIssue.TerminalName = input.TechDepartmentData.TerminalName;
                        }
                        if (techDepartmentIssue.AgentId != input.TechDepartmentData.AgentId)
                        {
                            await LogHistory(input.Id, "TechDepartment.AgentId", techDepartmentIssue.AgentId.ToString(), input.TechDepartmentData.AgentId.ToString());
                            techDepartmentIssue.AgentId = input.TechDepartmentData.AgentId;
                        }
                        if (techDepartmentIssue.AgentNumber != input.TechDepartmentData.AgentNumber)
                        {
                            await LogHistory(input.Id, "TechDepartment.AgentNumber", techDepartmentIssue.AgentNumber, input.TechDepartmentData.AgentNumber);
                            techDepartmentIssue.AgentNumber = input.TechDepartmentData.AgentNumber;
                        }
                        if (techDepartmentIssue.IssueDescription != input.TechDepartmentData.IssueDescription)
                        {
                            await LogHistory(input.Id, "TechDepartment.IssueDescription", techDepartmentIssue.IssueDescription, input.TechDepartmentData.IssueDescription);
                            techDepartmentIssue.IssueDescription = input.TechDepartmentData.IssueDescription;
                        }
                        if (techDepartmentIssue.IssueGroupId != input.TechDepartmentData.IssueGroupId)
                        {
                            await LogHistory(input.Id, "TechDepartment.IssueGroupId", oldFaultGroup?.Title ?? techDepartmentIssue.IssueGroupId.ToString(), newFaultGroup?.Title ?? input.TechDepartmentData.IssueGroupId.ToString());
                            techDepartmentIssue.IssueGroupId = input.TechDepartmentData.IssueGroupId;
                        }
                        if (techDepartmentIssue.TerminalLocation != input.TechDepartmentData.TerminalLocation)
                        {
                            await LogHistory(input.Id, "TechDepartment.TerminalLocation", techDepartmentIssue.TerminalLocation, input.TechDepartmentData.TerminalLocation);
                            techDepartmentIssue.TerminalLocation = input.TechDepartmentData.TerminalLocation;
                        }
                        if (techDepartmentIssue.CityId != input.TechDepartmentData.CityId)
                        {
                            await LogHistory(input.Id, "TechDepartment.CityId", oldCity?.Name ?? techDepartmentIssue.CityId.ToString(), newCity?.Name ?? input.TechDepartmentData.CityId.ToString());
                            techDepartmentIssue.CityId = input.TechDepartmentData.CityId;
                        }
                        await _techDepartmentIssueRepository.UpdateAsync(techDepartmentIssue);
                    }
                    else
                    {
                        var newTechDepartmentIssue = new TechDepartmentIssue
                        {
                            IssuesId = input.Id,
                            TerminalNumber = input.TechDepartmentData.TerminalNumber,
                            TerminalName = input.TechDepartmentData.TerminalName,
                            AgentId = input.TechDepartmentData.AgentId,
                            AgentNumber = input.TechDepartmentData.AgentNumber,
                            IssueDescription = input.TechDepartmentData.IssueDescription,
                            IssueGroupId = input.TechDepartmentData.IssueGroupId,
                            TerminalLocation = input.TechDepartmentData.TerminalLocation,
                            CityId = input.TechDepartmentData.CityId,
                            TenantId = _abpSession.TenantId
                        };
                        await _techDepartmentIssueRepository.InsertAsync(newTechDepartmentIssue);
                        await LogHistory(input.Id, "TechDepartment", null, "Created", true);
                    }
                }
                else
                {
                    if (await _techDepartmentIssueRepository.FirstOrDefaultAsync(t => t.IssuesId == input.Id) != null)
                    {
                        await LogHistory(input.Id, "TechDepartment", "Exists", "Removed");
                        await _techDepartmentIssueRepository.DeleteAsync(t => t.IssuesId == input.Id);
                    }
                }

                if (input.IssueCategory == "AtmIssues")
                {
                    if (input.ATMData == null)
                        throw new UserFriendlyException(L("ValidationError", "ATMData is required"));
                    ValidateSpecificFields(input.ATMData, specificFields);
                    var atmIssue = await _atmIssueRepository.FirstOrDefaultAsync(a => a.IssuesId == input.Id);
                    if (atmIssue != null)
                    {
                        var oldSubCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == atmIssue.SubCategoryId);
                        var newSubCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == input.ATMData.SubCategoryId);

                        if (atmIssue.ATMNumber != input.ATMData.ATMNumber)
                        {
                            await LogHistory(input.Id, "AtmIssues.ATMNumber", atmIssue.ATMNumber, input.ATMData.ATMNumber);
                            atmIssue.ATMNumber = input.ATMData.ATMNumber;
                        }
                        if (atmIssue.Reason != input.ATMData.Reason)
                        {
                            await LogHistory(input.Id, "AtmIssues.Reason", atmIssue.Reason, input.ATMData.Reason);
                            atmIssue.Reason = input.ATMData.Reason;
                        }
                        if (atmIssue.IssuingBank != input.ATMData.IssuingBank)
                        {
                            await LogHistory(input.Id, "AtmIssues.IssuingBank", atmIssue.IssuingBank, input.ATMData.IssuingBank);
                            atmIssue.IssuingBank = input.ATMData.IssuingBank;
                        }
                        if (atmIssue.Amount != input.ATMData.Amount)
                        {
                            await LogHistory(input.Id, "AtmIssues.Amount", atmIssue.Amount.ToString(), input.ATMData.Amount.ToString());
                            atmIssue.Amount = input.ATMData.Amount;
                        }
                        if (atmIssue.PhoneNumber != input.ATMData.PhoneNumber)
                        {
                            await LogHistory(input.Id, "AtmIssues.PhoneNumber", atmIssue.PhoneNumber, input.ATMData.PhoneNumber);
                            atmIssue.PhoneNumber = input.ATMData.PhoneNumber;
                        }
                        if (atmIssue.SubCategoryId != input.ATMData.SubCategoryId)
                        {
                            await LogHistory(input.Id, "AtmIssues.SubCategoryId", oldSubCategory?.Title ?? atmIssue.SubCategoryId.ToString(), newSubCategory?.Title ?? input.ATMData.SubCategoryId.ToString());
                            atmIssue.SubCategoryId = input.ATMData.SubCategoryId;
                        }
                        await _atmIssueRepository.UpdateAsync(atmIssue);
                    }
                    else
                    {
                        var newAtmIssue = new ATMIssue
                        {
                            IssuesId = input.Id,
                            ATMNumber = input.ATMData.ATMNumber,
                            Reason = input.ATMData.Reason,
                            IssuingBank = input.ATMData.IssuingBank,
                            Amount = input.ATMData.Amount,
                            PhoneNumber = input.ATMData.PhoneNumber,
                            SubCategoryId = input.ATMData.SubCategoryId,
                            TenantId = _abpSession.TenantId
                        };
                        await _atmIssueRepository.InsertAsync(newAtmIssue);
                        await LogHistory(input.Id, "AtmIssues", null, "Created", true);
                    }
                }
                else
                {
                    if (await _atmIssueRepository.FirstOrDefaultAsync(a => a.IssuesId == input.Id) != null)
                    {
                        await LogHistory(input.Id, "AtmIssues", "Exists", "Removed");
                        await _atmIssueRepository.DeleteAsync(a => a.IssuesId == input.Id);
                    }
                }

                if (input.IssueCategory == "PayvandWallet")
                {
                    if (input.PayvandWalletData == null)
                        throw new UserFriendlyException(L("ValidationError", "PayvandWalletData is required"));
                    ValidateSpecificFields(input.PayvandWalletData, specificFields);
                    var payvandWalletIssue = await _payvandWalletIssueRepository.FirstOrDefaultAsync(p => p.IssuesId == input.Id);
                    if (payvandWalletIssue != null)
                    {
                        var oldSubCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == payvandWalletIssue.SubCategoryId);
                        var newSubCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == input.PayvandWalletData.SubCategoryId);
                        var oldService = await _serviceRepository.FirstOrDefaultAsync(s => s.Id == payvandWalletIssue.ServiceId);
                        var newService = await _serviceRepository.FirstOrDefaultAsync(s => s.Id == input.PayvandWalletData.ServiceId);

                        if (payvandWalletIssue.WrongNumber != input.PayvandWalletData.WrongNumber)
                        {
                            await LogHistory(input.Id, "PayvandWallet.WrongNumber", payvandWalletIssue.WrongNumber, input.PayvandWalletData.WrongNumber);
                            payvandWalletIssue.WrongNumber = input.PayvandWalletData.WrongNumber;
                        }
                        if (payvandWalletIssue.RightNumber != input.PayvandWalletData.RightNumber)
                        {
                            await LogHistory(input.Id, "PayvandWallet.RightNumber", payvandWalletIssue.RightNumber, input.PayvandWalletData.RightNumber);
                            payvandWalletIssue.RightNumber = input.PayvandWalletData.RightNumber;
                        }
                        if (payvandWalletIssue.ServiceId != input.PayvandWalletData.ServiceId)
                        {
                            await LogHistory(input.Id, "PayvandWallet.ServiceId", oldService?.Name ?? payvandWalletIssue.ServiceId.ToString(), newService?.Name ?? input.PayvandWalletData.ServiceId.ToString());
                            payvandWalletIssue.ServiceId = input.PayvandWalletData.ServiceId;
                        }
                        if (payvandWalletIssue.Amount != input.PayvandWalletData.Amount)
                        {
                            await LogHistory(input.Id, "PayvandWallet.Amount", payvandWalletIssue.Amount.ToString(), input.PayvandWalletData.Amount.ToString());
                            payvandWalletIssue.Amount = input.PayvandWalletData.Amount;
                        }
                        if (payvandWalletIssue.SubCategoryId != input.PayvandWalletData.SubCategoryId)
                        {
                            await LogHistory(input.Id, "PayvandWallet.SubCategoryId", oldSubCategory?.Title ?? payvandWalletIssue.SubCategoryId.ToString(), newSubCategory?.Title ?? input.PayvandWalletData.SubCategoryId.ToString());
                            payvandWalletIssue.SubCategoryId = input.PayvandWalletData.SubCategoryId;
                        }
                        await _payvandWalletIssueRepository.UpdateAsync(payvandWalletIssue);
                    }
                    else
                    {
                        var newPayvandWalletIssue = new PayvandWalletIssue
                        {
                            IssuesId = input.Id,
                            WrongNumber = input.PayvandWalletData.WrongNumber,
                            RightNumber = input.PayvandWalletData.RightNumber,
                            ServiceId = input.PayvandWalletData.ServiceId,
                            Amount = input.PayvandWalletData.Amount,
                            SubCategoryId = input.PayvandWalletData.SubCategoryId,
                            TenantId = _abpSession.TenantId
                        };
                        await _payvandWalletIssueRepository.InsertAsync(newPayvandWalletIssue);
                        await LogHistory(input.Id, "PayvandWallet", null, "Created", true);
                    }
                }
                else
                {
                    if (await _payvandWalletIssueRepository.FirstOrDefaultAsync(p => p.IssuesId == input.Id) != null)
                    {
                        await LogHistory(input.Id, "PayvandWallet", "Exists", "Removed");
                        await _payvandWalletIssueRepository.DeleteAsync(p => p.IssuesId == input.Id);
                    }
                }

                if (input.IssueCategory == "PayvandCard")
                {
                    if (input.PayvandCardData == null)
                        throw new UserFriendlyException(L("ValidationError", "PayvandCardData is required"));
                    ValidateSpecificFields(input.PayvandCardData, specificFields);
                    var payvandCardIssue = await _payvandCardIssueRepository.FirstOrDefaultAsync(p => p.IssuesId == input.Id);
                    if (payvandCardIssue != null)
                    {
                        var oldSubCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == payvandCardIssue.SubCategoryId);
                        var newSubCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == input.PayvandCardData.SubCategoryId);

                        if (payvandCardIssue.WrongNumber != input.PayvandCardData.WrongNumber)
                        {
                            await LogHistory(input.Id, "PayvandCard.WrongNumber", payvandCardIssue.WrongNumber, input.PayvandCardData.WrongNumber);
                            payvandCardIssue.WrongNumber = input.PayvandCardData.WrongNumber;
                        }
                        if (payvandCardIssue.RightNumber != input.PayvandCardData.RightNumber)
                        {
                            await LogHistory(input.Id, "PayvandCard.RightNumber", payvandCardIssue.RightNumber, input.PayvandCardData.RightNumber);
                            payvandCardIssue.RightNumber = input.PayvandCardData.RightNumber;
                        }
                        if (payvandCardIssue.SubCategoryId != input.PayvandCardData.SubCategoryId)
                        {
                            await LogHistory(input.Id, "PayvandCard.SubCategoryId", oldSubCategory?.Title ?? payvandCardIssue.SubCategoryId.ToString(), newSubCategory?.Title ?? input.PayvandCardData.SubCategoryId.ToString());
                            payvandCardIssue.SubCategoryId = input.PayvandCardData.SubCategoryId;
                        }
                        await _payvandCardIssueRepository.UpdateAsync(payvandCardIssue);
                    }
                    else
                    {
                        var newPayvandCardIssue = new PayvandCardIssue
                        {
                            IssuesId = input.Id,
                            WrongNumber = input.PayvandCardData.WrongNumber,
                            RightNumber = input.PayvandCardData.RightNumber,
                            SubCategoryId = input.PayvandCardData.SubCategoryId,
                            TenantId = _abpSession.TenantId
                        };
                        await _payvandCardIssueRepository.InsertAsync(newPayvandCardIssue);
                        await LogHistory(input.Id, "PayvandCard", null, "Created", true);
                    }
                }
                else
                {
                    if (await _payvandCardIssueRepository.FirstOrDefaultAsync(p => p.IssuesId == input.Id) != null)
                    {
                        await LogHistory(input.Id, "PayvandCard", "Exists", "Removed");
                        await _payvandCardIssueRepository.DeleteAsync(p => p.IssuesId == input.Id);
                    }
                }

                var oldAssignees = await _assigneesRepository.GetAllListAsync(a => a.IssueId == input.Id);
                var oldAssigneeIds = oldAssignees.Select(a => a.UserId).ToList();
                var newAssigneeIds = input.AssigneeUserIds ?? new List<long>();
                if (!oldAssigneeIds.OrderBy(x => x).SequenceEqual(newAssigneeIds.OrderBy(x => x)))
                {
                    await LogHistory(input.Id, "Assignees", string.Join(", ", oldAssigneeIds), string.Join(", ", newAssigneeIds));
                }
                await UpdateAssignees(input.Id, input.AssigneeUserIds);
                await _issuesRepository.UpdateAsync(issue);

                var existingClaims = await _issuesClaimsRepository.GetAllListAsync(c => c.IssueId == input.Id);
                var inputClaimIds = input.IssuesClaims?.Select(c => c.Id).ToList() ?? new List<long>();

                if (input.IssuesClaims != null && input.IssuesClaims.Any())
                {
                    foreach (var inputClaim in input.IssuesClaims)
                    {
                        var existingClaim = existingClaims.FirstOrDefault(c => c.Id == inputClaim.Id);
                        if (existingClaim != null)
                        {
                            if (existingClaim.ClaimKey != inputClaim.ClaimKey || existingClaim.ClaimValue != inputClaim.ClaimValue)
                            {
                                await LogHistory(input.Id, $"IssuesClaims.{existingClaim.ClaimKey}", existingClaim.ClaimValue, inputClaim.ClaimValue);
                                existingClaim.ClaimKey = inputClaim.ClaimKey;
                                existingClaim.ClaimValue = inputClaim.ClaimValue;
                                await _issuesClaimsRepository.UpdateAsync(existingClaim);
                            }
                        }
                        else
                        {
                            var newClaim = new IssuesClaims
                            {
                                IssueId = input.Id,
                                ClaimKey = inputClaim.ClaimKey,
                                ClaimValue = inputClaim.ClaimValue
                            };
                            await _issuesClaimsRepository.InsertAsync(newClaim);
                            await LogHistory(input.Id, $"IssuesClaims.{inputClaim.ClaimKey}", null, inputClaim.ClaimValue, true);
                        }
                    }
                }

                var claimsToDelete = existingClaims.Where(c => !inputClaimIds.Contains(c.Id)).ToList();
                foreach (var claimToDelete in claimsToDelete)
                {
                    await LogHistory(input.Id, $"IssuesClaims.{claimToDelete.ClaimKey}", claimToDelete.ClaimValue, null);
                    await _issuesClaimsRepository.DeleteAsync(claimToDelete);
                }

                return await MapToDtoWithSpecificData(issue);
            }
            catch (UserFriendlyException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.Error($"Error updating issue {input.Id}: {ex.Message}", ex);
                throw new UserFriendlyException(L("DatabaseError"));
            }
        }

        private async Task<IssuesDto> MapToDtoWithSpecificData(Issues issue)
        {
            try
            {
                var dto = ObjectMapper.Map<IssuesDto>(issue);
                var priority = await _priorityRepository.FirstOrDefaultAsync(p => p.Id == issue.PriorityId);
                var status = await _issueStatusRepository.FirstOrDefaultAsync(s => s.Id == issue.IssueStatusId);
                var user = await _userRepository.FirstOrDefaultAsync(u => u.Id == issue.ReportedBy);

                //dto.IssueCategory = _localizedMessageService.L(issue.IssueCategory);
                dto.PriorityName = _localizedMessageService.L(priority?.Title);
                dto.IssueStatusName = _localizedMessageService.L(status?.Title);
                dto.ReportedByName = user?.FullName;
                dto.Id = issue.Id;
                dto.Title = issue.Title;

                if (issue.IssueCategory == "CallCenter")
                {
                    var callCenterIssue = await _callCenterIssueRepository.FirstOrDefaultAsync(c => c.IssuesId == issue.Id);
                    if (callCenterIssue != null)
                    {
                        var callCenterDto = ObjectMapper.Map<CallCenterIssueQueryDto>(callCenterIssue);
                        var subCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == callCenterIssue.SubCategoryId);
                        var service = await _serviceRepository.FirstOrDefaultAsync(s => s.Id == callCenterIssue.ServiceId);
                        callCenterDto.SubCategoryName = _localizedMessageService.L(subCategory?.Title);
                        callCenterDto.ServiceName = _localizedMessageService.L(service?.Name);
                        dto.CallCenterData = callCenterDto;
                    }
                }
                else if (issue.IssueCategory == "Repair")
                {
                    var repairIssue = await _repairIssueRepository.FirstOrDefaultAsync(r => r.IssuesId == issue.Id);
                    if (repairIssue != null)
                        dto.RepairData = ObjectMapper.Map<RepairIssueQueryDto>(repairIssue);
                }
                else if (issue.IssueCategory == "TechDepartment")
                {
                    var techDepartmentIssue = await _techDepartmentIssueRepository.FirstOrDefaultAsync(t => t.IssuesId == issue.Id);
                    if (techDepartmentIssue != null)
                    {
                        var techDto = ObjectMapper.Map<TechDepartmentIssueQueryDto>(techDepartmentIssue);
                        var faultGroup = await _faultGroupRepository.FirstOrDefaultAsync(fg => fg.Id == techDepartmentIssue.IssueGroupId);
                        var city = await _cityRepository.FirstOrDefaultAsync(c => c.Id == techDepartmentIssue.CityId);
                        techDto.IssueGroupName = _localizedMessageService.L(faultGroup?.Title);
                        techDto.CityName = _localizedMessageService.L(city?.Name);
                        dto.TechDepartmentData = techDto;
                    }
                }
                else if (issue.IssueCategory == "AtmIssues")
                {
                    var atmIssue = await _atmIssueRepository.FirstOrDefaultAsync(a => a.IssuesId == issue.Id);
                    if (atmIssue != null)
                    {
                        var atmDto = ObjectMapper.Map<ATMIssueQueryDto>(atmIssue);
                        var subCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == atmIssue.SubCategoryId);
                        atmDto.SubCategoryName = _localizedMessageService.L(subCategory?.Title);
                        dto.ATMData = atmDto;
                    }
                }
                else if (issue.IssueCategory == "PayvandWallet")
                {
                    var payvandWalletIssue = await _payvandWalletIssueRepository.FirstOrDefaultAsync(p => p.IssuesId == issue.Id);
                    if (payvandWalletIssue != null)
                    {
                        var payvandWalletDto = ObjectMapper.Map<PayvandWalletIssueQueryDto>(payvandWalletIssue);
                        var subCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == payvandWalletIssue.SubCategoryId);
                        var service = await _serviceRepository.FirstOrDefaultAsync(s => s.Id == payvandWalletIssue.ServiceId);
                        payvandWalletDto.SubCategoryName = _localizedMessageService.L(subCategory?.Title);
                        payvandWalletDto.ServiceName = _localizedMessageService.L(service?.Name);
                        dto.PayvandWalletData = payvandWalletDto;
                    }
                }
                else if (issue.IssueCategory == "PayvandCard")
                {
                    var payvandCardIssue = await _payvandCardIssueRepository.FirstOrDefaultAsync(p => p.IssuesId == issue.Id);
                    if (payvandCardIssue != null)
                    {
                        var payvandCardDto = ObjectMapper.Map<PayvandCardIssueQueryDto>(payvandCardIssue);
                        var subCategory = await _subCategoryRepository.FirstOrDefaultAsync(sc => sc.Id == payvandCardIssue.SubCategoryId);
                        payvandCardDto.SubCategoryName = _localizedMessageService.L(subCategory?.Title);
                        dto.PayvandCardData = payvandCardDto;
                    }
                }

                dto.AssigneeUserIds = (await _assigneesRepository.GetAllListAsync(a => a.IssueId == issue.Id))
                    .Select(a => a.UserId).ToList();
                dto.IssuesClaims = (await _issuesClaimsRepository.GetAllListAsync(c => c.IssueId == issue.Id))
                    .Select(c => ObjectMapper.Map<IssuesClaimsDto>(c)).ToList();

                return dto;
            }
            catch (AutoMapper.AutoMapperMappingException ex)
            {
                Logger.Error($"AutoMapper error mapping issue {issue.Id}: {ex.Message}", ex);
                throw new UserFriendlyException(L("MappingError"));
            }
            catch (Exception ex)
            {
                Logger.Error($"Error mapping issue {issue.Id} to DTO: {ex.Message}", ex);
                throw new UserFriendlyException(L("DatabaseError"));
            }
        }

        [AbpAuthorize(PermissionNames.Issues_GetAll)]
        public async Task ClearSessionFiltersAsync()
        {
            if (_abpSession.UserId.HasValue)
            {
                var key = $"{FilterCacheKey}_{_abpSession.UserId}";
                await _cacheManager.GetCache(FilterCacheKey).RemoveAsync(key);
            }
        }

        private async Task<GetAllIssuesInput> LoadFiltersFromSession(GetAllIssuesInput input)
        {
            if (input != null && (
                !string.IsNullOrWhiteSpace(input.Keyword) ||
                !string.IsNullOrWhiteSpace(input.Title) ||
                !string.IsNullOrWhiteSpace(input.IssueCategory) ||
                !string.IsNullOrWhiteSpace(input.Description) ||
                input.PriorityId.HasValue ||
                input.IssueStatusId.HasValue ||
                input.ReportedBy.HasValue ||
                input.IsResolved.HasValue ||
                input.DeadlineStart.HasValue ||
                input.DeadlineEnd.HasValue ||
                input.ResolvedTimeStart.HasValue ||
                input.ResolvedTimeEnd.HasValue ||
                input.TenantId.HasValue ||
                input.AssigneeUserId.HasValue ||
                !string.IsNullOrWhiteSpace(input.ClaimKey) ||
                !string.IsNullOrWhiteSpace(input.ClaimValue) ||
                input.SubCategoryId.HasValue ||
                input.ServiceId.HasValue ||
                !string.IsNullOrWhiteSpace(input.WrongNumber) ||
                !string.IsNullOrWhiteSpace(input.RightNumber) ||
                !string.IsNullOrWhiteSpace(input.CallCenterTerminalNumber) ||
                input.Sum.HasValue ||                  
                input.CancelledSum.HasValue ||         
                !string.IsNullOrWhiteSpace(input.Subscriber) ||
                !string.IsNullOrWhiteSpace(input.AgentFullName) ||
                !string.IsNullOrWhiteSpace(input.AgentNumber) ||
                !string.IsNullOrWhiteSpace(input.Equipment) ||
                !string.IsNullOrWhiteSpace(input.SerialNumber) ||
                !string.IsNullOrWhiteSpace(input.RepairIssueDescription) ||
                input.WorkAmount.HasValue ||
                !string.IsNullOrWhiteSpace(input.ReplacementParts) ||
                !string.IsNullOrWhiteSpace(input.TechTerminalNumber) ||
                !string.IsNullOrWhiteSpace(input.TerminalName) ||
                input.AgentId.HasValue ||
                !string.IsNullOrWhiteSpace(input.TechAgentNumber) ||
                !string.IsNullOrWhiteSpace(input.TechIssueDescription) ||
                input.IssueGroupId.HasValue ||
                !string.IsNullOrWhiteSpace(input.TerminalLocation) ||
                input.CityId.HasValue ||
                input.CreationTimeStart.HasValue || // Yangi maydon
                input.CreationTimeEnd.HasValue || // Yangi maydon
                input.LastModificationTimeStart.HasValue || // Yangi maydon
                input.LastModificationTimeEnd.HasValue || // Yangi maydon
                !string.IsNullOrWhiteSpace(input.Sorting)))
            {
                return input;
            }

            if (!_abpSession.UserId.HasValue)
            {
                return input ?? new GetAllIssuesInput();
            }

            var key = $"{FilterCacheKey}_{_abpSession.UserId}";
            var cache = _cacheManager.GetCache(FilterCacheKey);
            var filterJson = await cache.GetOrDefaultAsync(key) as string;

            if (string.IsNullOrEmpty(filterJson))
            {
                return input ?? new GetAllIssuesInput();
            }

            return JsonSerializer.Deserialize<GetAllIssuesInput>(filterJson) ?? input ?? new GetAllIssuesInput();
        }

        private async Task SaveFiltersToSession(GetAllIssuesInput input)
        {
            if (input == null || !_abpSession.UserId.HasValue)
            {
                return;
            }

            var key = $"{FilterCacheKey}_{_abpSession.UserId}";
            var filterJson = JsonSerializer.Serialize(input);
            var cache = _cacheManager.GetCache(FilterCacheKey);
            await cache.SetAsync(key, filterJson, new TimeSpan(0, 30, 0));
        }

        public async Task<IssueCategoriesResponseDto> GetIssueCategories()
        {
            var categories = new List<IssueCategoryDto>();
            foreach (var category in IssueCategoryDefinitions.Categories)
            {
                categories.Add(new IssueCategoryDto
                {
                    Category = category.Category,
                    DisplayName =_localizedMessageService.L(category.DisplayName),
                    PermissionName = category.PermissionName,
                    Permission = await _permissionChecker.IsGrantedAsync(category.PermissionName),
                    SpecificFields = category.SpecificFields
                });
            }

            return new IssueCategoriesResponseDto
            {
                CommonFields = IssueCategoryDefinitions.CommonFields,
                Categories = categories.Where(c => c.Permission).ToList()
            };
        }

        public class IssueWithDetails
        {
            public Issues Issue { get; set; }
            public Priority Priority { get; set; }
            public IssueStatus Status { get; set; }
            public User User { get; set; }
        }

        public class CallCenterIssueWithDetails
        {
            public Issues Issue { get; set; }
            public CallCenterIssue CallCenter { get; set; }
            public string SubCategoryName { get; set; }
            public string ServiceName { get; set; }
        }

        public class RepairIssueWithDetails
        {
            public Issues Issue { get; set; }
            public RepairIssue Repair { get; set; }
        }

        public class TechDepartmentIssueWithDetails
        {
            public Issues Issue { get; set; }
            public TechDepartmentIssue TechDepartment { get; set; }
        }
        public class ATMIssueWithDetails
        {
            public Issues Issue { get; set; }
            public ATMIssue ATMIssue { get; set; }
        }
        public class PayvandWalletIssueWithDetails
        {
            public Issues Issue { get; set; }
            public PayvandWalletIssue PayvandWallet { get; set; }
            public string SubCategoryName { get; set; }
            public string ServiceName { get; set; }
        }

        public class PayvandCardIssueWithDetails
        {
            public Issues Issue { get; set; }
            public PayvandCardIssue PayvandCard { get; set; }
            public string SubCategoryName { get; set; }
        }
    }

    public class GetAllIssuesInput : PagedAndSortedResultRequestDto
    {
        // Mavjud maydonlar (faqat o'zgartirilgan qismlar ko'rsatiladi)
        public string? Keyword { get; set; }
        public string? Title { get; set; }
        public string? IssueCategory { get; set; }
        public string? Description { get; set; }
        public int? PriorityId { get; set; }
        public int? IssueStatusId { get; set; }
        public long? ReportedBy { get; set; }
        public bool? IsResolved { get; set; }
        public DateTime? DeadlineStart { get; set; }
        public DateTime? DeadlineEnd { get; set; }
        public DateTime? ResolvedTimeStart { get; set; }
        public DateTime? ResolvedTimeEnd { get; set; }
        public int? TenantId { get; set; }
        public long? AssigneeUserId { get; set; }
        public string? ClaimKey { get; set; }
        public string? ClaimValue { get; set; }
        public int? SubCategoryId { get; set; }
        public int? ServiceId { get; set; }
        public string? WrongNumber { get; set; }
        public string? RightNumber { get; set; }
        public string? CallCenterTerminalNumber { get; set; }
        public decimal? Sum { get; set; }
        public decimal? CancelledSum { get; set; }
        public string? Subscriber { get; set; }
        public string? AgentFullName { get; set; }
        public string? AgentNumber { get; set; }
        public string? Equipment { get; set; }
        public string? SerialNumber { get; set; }
        public string? RepairIssueDescription { get; set; }
        public decimal? WorkAmount { get; set; }
        public string? ReplacementParts { get; set; }
        public string? TechTerminalNumber { get; set; }
        public string? TerminalName { get; set; }
        public long? AgentId { get; set; }
        public string? TechAgentNumber { get; set; }
        public string TechIssueDescription { get; set; }
        public int? IssueGroupId { get; set; }
        public string? TerminalLocation { get; set; }
        public int? CityId { get; set; }
        // Yangi diapazon maydonlari
        public DateTime? CreationTimeStart { get; set; }
        public DateTime? CreationTimeEnd { get; set; }
        public DateTime? LastModificationTimeStart { get; set; }
        public DateTime? LastModificationTimeEnd { get; set; }


    }

    public interface IIssueAppService : IAsyncCrudAppService<IssuesDto, long, GetAllIssuesInput, CreateIssuesDto, EditIssuesDto>
    {
        Task<IssueCategoriesResponseDto> GetIssueCategories();
        Task<PagedResultDto<IssuesDto>> GetMyIssuesAsync(GetAllIssuesInput input);
        Task<PagedResultDto<IssuesDto>> GetAssignedToMeAsync(GetAllIssuesInput input);
        Task<PagedResultDto<IssuesDto>> GetAllCallCenterIssuesAsync(GetAllIssuesInput input);
        Task<PagedResultDto<IssuesDto>> GetAllRepairIssuesAsync(GetAllIssuesInput input);
        Task<PagedResultDto<IssuesDto>> GetAllTechDepartmentIssuesAsync(GetAllIssuesInput input);
        Task<PagedResultDto<IssuesDto>> GetAllATMIssuesAsync(GetAllIssuesInput input);
        Task<PagedResultDto<IssuesDto>> GetAllPayvandWalletIssuesAsync(GetAllIssuesInput input);
        Task<PagedResultDto<IssuesDto>> GetAllPayvandCardIssuesAsync(GetAllIssuesInput input);
        Task ClearSessionFiltersAsync();
    }
}