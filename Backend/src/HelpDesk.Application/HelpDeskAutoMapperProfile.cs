using AutoMapper;
using HelpDesk.Authorization.Users;
using HelpDesk.Category;
using HelpDesk.Category.Dto;
using HelpDesk.Cities.Dto;
using HelpDesk.Issues;
using HelpDesk.Issues.Dto;
using HelpDesk.Repairs;
using HelpDesk.TechDepartment;
using HelpDesk.Users.Dto;
using Issue = HelpDesk.Issues.Issues;
namespace HelpDesk
{
    public class HelpDeskAutoMapperProfile : Profile
    {
        public HelpDeskAutoMapperProfile()
        {
            // User mappings
            CreateMap<UserDto, User>()
                .ForMember(x => x.Roles, opt => opt.Ignore())
                .ForMember(x => x.CreationTime, opt => opt.Ignore());
            CreateMap<CreateUserDto, User>()
                .ForMember(x => x.Roles, opt => opt.Ignore());


            CreateMap<IssuesClaims, IssuesClaimsDto>();
            CreateMap<CreateIssuesClaimsDto, IssuesClaims>();
            // Category mappings
            CreateMap<CategoryDto, Categories>().ReverseMap();

            // CallCenter mappings
            CreateMap<CallCenterIssue, CallCenterIssueQueryDto>()
                .ForMember(dest => dest.SubCategoryId, opt => opt.MapFrom(src => src.SubCategoryId))
                .ForMember(dest => dest.ServiceId, opt => opt.MapFrom(src => src.ServiceId))
                .ForMember(dest => dest.WrongNumber, opt => opt.MapFrom(src => src.WrongNumber))
                .ForMember(dest => dest.RightNumber, opt => opt.MapFrom(src => src.RightNumber))
                .ForMember(dest => dest.TerminalNumber, opt => opt.MapFrom(src => src.TerminalNumber))
                .ForMember(dest => dest.Sum, opt => opt.MapFrom(src => src.Sum))
                .ForMember(dest => dest.CancelledSum, opt => opt.MapFrom(src => src.CancelledSum))
                .ForMember(dest => dest.Subscriber, opt => opt.MapFrom(src => src.Subscriber))

                // SubCategoryName, ServiceName, va StatusName maydonlari query uchun, lekin ularni MapToDtoWithSpecificData da qo'shamiz
                .ForMember(dest => dest.SubCategoryName, opt => opt.Ignore())
                .ForMember(dest => dest.ServiceName, opt => opt.Ignore());
     

            CreateMap<CallCenterIssueCommandDto, CallCenterIssue>()
                .ForMember(dest => dest.SubCategoryId, opt => opt.MapFrom(src => src.SubCategoryId))
                .ForMember(dest => dest.ServiceId, opt => opt.MapFrom(src => src.ServiceId))
                .ForMember(dest => dest.WrongNumber, opt => opt.MapFrom(src => src.WrongNumber))
                .ForMember(dest => dest.RightNumber, opt => opt.MapFrom(src => src.RightNumber))
                .ForMember(dest => dest.TerminalNumber, opt => opt.MapFrom(src => src.TerminalNumber))
                .ForMember(dest => dest.Sum, opt => opt.MapFrom(src => src.Sum))
                .ForMember(dest => dest.CancelledSum, opt => opt.MapFrom(src => src.CancelledSum))
                .ForMember(dest => dest.Subscriber, opt => opt.MapFrom(src => src.Subscriber))
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IssuesId, opt => opt.Ignore())
                .ForMember(dest => dest.TenantId, opt => opt.Ignore());

            // Repair mappings
            CreateMap<RepairIssue, RepairIssueQueryDto>()
                .ForMember(dest => dest.AgentFullName, opt => opt.MapFrom(src => src.AgentFullName))
                .ForMember(dest => dest.AgentNumber, opt => opt.MapFrom(src => src.AgentNumber))
                .ForMember(dest => dest.Equipment, opt => opt.MapFrom(src => src.Equipment))
                .ForMember(dest => dest.SerialNumber, opt => opt.MapFrom(src => src.SerialNumber))
                .ForMember(dest => dest.IssueDescription, opt => opt.MapFrom(src => src.IssueDescription))
                .ForMember(dest => dest.WorkAmount, opt => opt.MapFrom(src => src.WorkAmount))
                .ForMember(dest => dest.ReplacementParts, opt => opt.MapFrom(src => src.ReplacementParts));

            CreateMap<ATMIssue, ATMIssueQueryDto>()
                .ForMember(dest => dest.ATMNumber, opt => opt.MapFrom(src => src.ATMNumber))
                .ForMember(dest => dest.Reason, opt => opt.MapFrom(src => src.Reason))
                .ForMember(dest => dest.IssuingBank, opt => opt.MapFrom(src => src.IssuingBank))
                .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.Amount))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.SubCategoryId, opt => opt.MapFrom(src => src.SubCategoryId));


            CreateMap<RepairIssueCommandDto, RepairIssue>()
                .ForMember(dest => dest.AgentFullName, opt => opt.MapFrom(src => src.AgentFullName))
                .ForMember(dest => dest.AgentNumber, opt => opt.MapFrom(src => src.AgentNumber))
                .ForMember(dest => dest.Equipment, opt => opt.MapFrom(src => src.Equipment))
                .ForMember(dest => dest.SerialNumber, opt => opt.MapFrom(src => src.SerialNumber))
                .ForMember(dest => dest.IssueDescription, opt => opt.MapFrom(src => src.IssueDescription))
                .ForMember(dest => dest.WorkAmount, opt => opt.MapFrom(src => src.WorkAmount))
                .ForMember(dest => dest.ReplacementParts, opt => opt.MapFrom(src => src.ReplacementParts))
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IssuesId, opt => opt.Ignore())
                .ForMember(dest => dest.TenantId, opt => opt.Ignore());

            // TechDepartment mappings
            CreateMap<TechDepartmentIssue, TechDepartmentIssueQueryDto>()
                .ForMember(dest => dest.TerminalNumber, opt => opt.MapFrom(src => src.TerminalNumber))
                .ForMember(dest => dest.TerminalName, opt => opt.MapFrom(src => src.TerminalName))
                .ForMember(dest => dest.AgentId, opt => opt.MapFrom(src => src.AgentId))
                .ForMember(dest => dest.AgentNumber, opt => opt.MapFrom(src => src.AgentNumber))
                .ForMember(dest => dest.IssueDescription, opt => opt.MapFrom(src => src.IssueDescription))
                .ForMember(dest => dest.IssueGroupId, opt => opt.MapFrom(src => src.IssueGroupId))
                .ForMember(dest => dest.TerminalLocation, opt => opt.MapFrom(src => src.TerminalLocation))
                .ForMember(dest => dest.CityId, opt => opt.MapFrom(src => src.CityId))
                // IssueGroupName va CityName maydonlari query uchun, lekin ularni MapToDtoWithSpecificData da qo'shamiz
                .ForMember(dest => dest.IssueGroupName, opt => opt.Ignore())
                .ForMember(dest => dest.CityName, opt => opt.Ignore());

            CreateMap<TechDepartmentIssueCommandDto, TechDepartmentIssue>()
                .ForMember(dest => dest.TerminalNumber, opt => opt.MapFrom(src => src.TerminalNumber))
                .ForMember(dest => dest.TerminalName, opt => opt.MapFrom(src => src.TerminalName))
                .ForMember(dest => dest.AgentId, opt => opt.MapFrom(src => src.AgentId))
                .ForMember(dest => dest.AgentNumber, opt => opt.MapFrom(src => src.AgentNumber))
                .ForMember(dest => dest.IssueDescription, opt => opt.MapFrom(src => src.IssueDescription))
                .ForMember(dest => dest.IssueGroupId, opt => opt.MapFrom(src => src.IssueGroupId))
                .ForMember(dest => dest.TerminalLocation, opt => opt.MapFrom(src => src.TerminalLocation))
                .ForMember(dest => dest.CityId, opt => opt.MapFrom(src => src.CityId))
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IssuesId, opt => opt.Ignore())
                .ForMember(dest => dest.TenantId, opt => opt.Ignore());

            // Issues mappings
            CreateMap<Issue, IssuesDto>()
                .ForMember(dest => dest.CallCenterData, opt => opt.Ignore())
                .ForMember(dest => dest.RepairData, opt => opt.Ignore())
                .ForMember(dest => dest.TechDepartmentData, opt => opt.Ignore())
                .ForMember(dest => dest.AssigneeUserIds, opt => opt.Ignore())
                .ForMember(dest => dest.PriorityName, opt => opt.Ignore())
                .ForMember(dest => dest.IssueStatusName, opt => opt.Ignore())
                .ForMember(dest => dest.ReportedByName, opt => opt.Ignore());

            CreateMap<CreateIssuesDto, Issue>()
                .ForMember(dest => dest.CallCenterIssue, opt => opt.Ignore())
                .ForMember(dest => dest.RepairIssue, opt => opt.Ignore())
                .ForMember(dest => dest.TechDepartmentIssue, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.ResolvedTime, opt => opt.Ignore());

            CreateMap<Issue, CreateIssuesDto>()
                .ForMember(dest => dest.CallCenterData, opt => opt.Ignore())
                .ForMember(dest => dest.RepairData, opt => opt.Ignore())
                .ForMember(dest => dest.TechDepartmentData, opt => opt.Ignore())
                .ForMember(dest => dest.AssigneeUserIds, opt => opt.Ignore());

            CreateMap<EditIssuesDto, Issue>()
                .ForMember(dest => dest.CallCenterIssue, opt => opt.Ignore())
                .ForMember(dest => dest.RepairIssue, opt => opt.Ignore())
                .ForMember(dest => dest.TechDepartmentIssue, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore());

            CreateMap<Issue, EditIssuesDto>()
                .ForMember(dest => dest.CallCenterData, opt => opt.Ignore())
                .ForMember(dest => dest.RepairData, opt => opt.Ignore())
                .ForMember(dest => dest.TechDepartmentData, opt => opt.Ignore())
                .ForMember(dest => dest.AssigneeUserIds, opt => opt.Ignore());
            CreateMap<Issue, IssuesDto>()
                .ForMember(dest => dest.IssueStatusName, opt => opt.MapFrom(src => src.IssueStatus != null ? src.IssueStatus.Title : "Unknown"));
           
        }
    }
}