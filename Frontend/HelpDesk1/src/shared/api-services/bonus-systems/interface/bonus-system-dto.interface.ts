// src/shared/api-services/bonus-system/interface/bonus-system-dto.interface.ts

export interface IBonusSystemDto {
    id: number;
    name: string;
    description?: string;
    periodTypeId: number;
    periodTypeName?: string;
    periodStartDay?: number;
    periodStartWeekdayId?: number;
    periodStartWeekdayName?: string;
    budgetTypeId: number;
    budgetTypeName?: string;
    amount: number;
    isActive: boolean;
}

export interface IActionRuleDto {
    id: number;
    actionName: string;
    description?: string;
    conditionJson?: string;
    points: number;
    isActive: boolean;
}

export interface IBonusSystemWithRulesDto extends IBonusSystemDto {
    actionRules: IActionRuleDto[];
}

export interface ICreateBonusSystemDto {
    name: string;
    description?: string;
    periodTypeId: number;
    periodStartDay?: number;
    periodStartWeekdayId?: number;
    budgetTypeId: number;
    amount: number;
    isActive: boolean;
    actionRules: ICreateActionRuleDto[];
}

export interface ICreateActionRuleDto {
    actionName: string;
    description?: string;
    conditionJson?: string;
    points: number;
    isActive: boolean;
}

export interface IEditBonusSystemDto extends ICreateBonusSystemDto {
    id: number;
    actionRules: IEditActionRuleDto[];
}

export interface IEditActionRuleDto extends ICreateActionRuleDto {
    id: number;
}