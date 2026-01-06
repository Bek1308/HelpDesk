// BonusSystemDto.cs
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using HelpDesk.BonusSystem;
using System.Collections.Generic;

namespace HelpDesk.BonusSystem.Dto
{
    [AutoMapFrom(typeof(BonusSystem))]
    public class BonusSystemDto : EntityDto<long>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int PeriodTypeId { get; set; }
        public string PeriodTypeName { get; set; }
        public int? PeriodStartDay { get; set; }
        public int? PeriodStartWeekdayId { get; set; }
        public string PeriodStartWeekdayName { get; set; }
        public int BudgetTypeId { get; set; }
        public string BudgetTypeName { get; set; }
        public decimal Amount { get; set; }
        public bool IsActive { get; set; } = true;
    }

    [AutoMapFrom(typeof(ActionRule))]
    public class ActionRuleDto : EntityDto<long>
    {
        public string ActionName { get; set; }
        public string Description { get; set; }
        public string ConditionJson { get; set; }
        public int Points { get; set; }
        public bool IsActive { get; set; } = true;
    }

    [AutoMapFrom(typeof(BonusSystem))]
    public class BonusSystemWithRulesDto : BonusSystemDto
    {
        public List<ActionRuleDto> ActionRules { get; set; }
    }

    // ACTIONRULES YO'Q!
    [AutoMapTo(typeof(BonusSystem))]
    public class CreateBonusSystemDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int PeriodTypeId { get; set; }
        public int? PeriodStartDay { get; set; }
        public int? PeriodStartWeekdayId { get; set; }
        public int BudgetTypeId { get; set; }
        public decimal Amount { get; set; }
        public bool IsActive { get; set; } = true;
        public List<CreateActionRuleDto> ActionRules { get; set; } // DTO da bor
    }

    [AutoMapTo(typeof(ActionRule))]
    public class CreateActionRuleDto
    {
        public string ActionName { get; set; }
        public string Description { get; set; }
        public string ConditionJson { get; set; }
        public int Points { get; set; }
        public bool IsActive { get; set; } = true;
    }

    [AutoMapTo(typeof(BonusSystem))]
    public class EditBonusSystemDto : EntityDto<long>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int PeriodTypeId { get; set; }
        public int? PeriodStartDay { get; set; }
        public int? PeriodStartWeekdayId { get; set; }
        public int BudgetTypeId { get; set; }
        public decimal Amount { get; set; }
        public bool IsActive { get; set; }
        public List<EditActionRuleDto> ActionRules { get; set; }
    }

    [AutoMapTo(typeof(ActionRule))]
    public class EditActionRuleDto : EntityDto<long>
    {
        public string ActionName { get; set; }
        public string Description { get; set; }
        public string ConditionJson { get; set; }
        public int Points { get; set; }
        public bool IsActive { get; set; }
    }
}