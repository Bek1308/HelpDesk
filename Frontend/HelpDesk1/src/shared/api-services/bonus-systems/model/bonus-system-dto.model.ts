// src/shared/api-services/bonus-system/model/bonus-system-dto.model.ts

import {
    IBonusSystemDto,
    IActionRuleDto,
    IBonusSystemWithRulesDto,
    ICreateBonusSystemDto,
    ICreateActionRuleDto,
    IEditBonusSystemDto,
    IEditActionRuleDto
} from '../interface/bonus-system-dto.interface';

export class BonusSystemDto implements IBonusSystemDto {
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

    constructor(data?: IBonusSystemDto) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property)) {
                    (this as any)[property] = (data as any)[property];
                }
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data['id'];
            this.name = _data['name'];
            this.description = _data['description'];
            this.periodTypeId = _data['periodTypeId'];
            this.periodTypeName = _data['periodTypeName'];
            this.periodStartDay = _data['periodStartDay'];
            this.periodStartWeekdayId = _data['periodStartWeekdayId'];
            this.periodStartWeekdayName = _data['periodStartWeekdayName'];
            this.budgetTypeId = _data['budgetTypeId'];
            this.budgetTypeName = _data['budgetTypeName'];
            this.amount = _data['amount'];
            this.isActive = _data['isActive'];
        }
    }

    static fromJS(data: any): BonusSystemDto {
        data = typeof data === 'object' ? data : {};
        const result = new BonusSystemDto();
        result.init(data);
        return result;
    }

    toJSON(): any {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            periodTypeId: this.periodTypeId,
            periodTypeName: this.periodTypeName,
            periodStartDay: this.periodStartDay,
            periodStartWeekdayId: this.periodStartWeekdayId,
            periodStartWeekdayName: this.periodStartWeekdayName,
            budgetTypeId: this.budgetTypeId,
            budgetTypeName: this.budgetTypeName,
            amount: this.amount,
            isActive: this.isActive
        };
    }
}

export class ActionRuleDto implements IActionRuleDto {
    id: number;
    actionName: string;
    description?: string;
    conditionJson?: string;
    points: number;
    isActive: boolean;

    constructor(data?: IActionRuleDto) {
        if (data) Object.assign(this, data);
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data['id'];
            this.actionName = _data['actionName'];
            this.description = _data['description'];
            this.conditionJson = _data['conditionJson'];
            this.points = _data['points'];
            this.isActive = _data['isActive'];
        }
    }

    static fromJS(data: any): ActionRuleDto {
        data = typeof data === 'object' ? data : {};
        const result = new ActionRuleDto();
        result.init(data);
        return result;
    }

    toJSON(): any {
        return { ...this };
    }
}

export class BonusSystemWithRulesDto extends BonusSystemDto implements IBonusSystemWithRulesDto {
    actionRules: ActionRuleDto[];

    constructor(data?: IBonusSystemWithRulesDto) {
        super(data);
        if (data?.actionRules) {
            this.actionRules = data.actionRules.map(ActionRuleDto.fromJS);
        }
    }

    static fromJS(data: any): BonusSystemWithRulesDto {
        const result = new BonusSystemWithRulesDto();
        result.init(data);
        if (data?.actionRules) {
            result.actionRules = data.actionRules.map(ActionRuleDto.fromJS);
        }
        return result;
    }
}

export class CreateActionRuleDto implements ICreateActionRuleDto {
    actionName: string;
    description?: string;
    conditionJson?: string;
    points: number;
    isActive: boolean;

    constructor(data?: any) {
        if (data) {
            this.actionName = data.actionName;
            this.description = data.description;
            this.conditionJson = data.conditionJson;
            this.points = data.points;
            this.isActive = data.isActive ?? true;
        }
    }

    init(data?: any): void {
        if (data) {
            this.actionName = data.actionName;
            this.description = data.description;
            this.conditionJson = data.conditionJson;
            this.points = data.points;
            this.isActive = data.isActive ?? true;
        }
    }
}

export class CreateBonusSystemDto implements ICreateBonusSystemDto {
    name: string;
    description?: string;
    periodTypeId: number;
    periodStartDay?: number;
    periodStartWeekdayId?: number;
    budgetTypeId: number;
    amount: number;
    isActive: boolean;
    actionRules: CreateActionRuleDto[];

    constructor(data?: any) {
        if (data) {
            this.name = data.name;
            this.description = data.description;
            this.periodTypeId = data.periodTypeId;
            this.periodStartDay = data.periodStartDay;
            this.periodStartWeekdayId = data.periodStartWeekdayId;
            this.budgetTypeId = data.budgetTypeId;
            this.amount = data.amount;
            this.isActive = data.isActive ?? true;
            this.actionRules = (data.actionRules || []).map((x: any) => new CreateActionRuleDto(x));
        } else {
            this.actionRules = [];
        }
    }

    init(data?: any): void {
        if (data) {
            this.name = data.name;
            this.description = data.description;
            this.periodTypeId = data.periodTypeId;
            this.periodStartDay = data.periodStartDay;
            this.periodStartWeekdayId = data.periodStartWeekdayId;
            this.budgetTypeId = data.budgetTypeId;
            this.amount = data.amount;
            this.isActive = data.isActive ?? true;
            this.actionRules = (data.actionRules || []).map((x: any) => {
                const rule = new CreateActionRuleDto();
                rule.init(x);
                return rule;
            });
        }
    }
}

export class EditActionRuleDto extends CreateActionRuleDto implements IEditActionRuleDto {
    id: number;

    constructor(data?: any) {
        super(data);
        this.id = data?.id || 0;
    }
}

export class EditBonusSystemDto extends CreateBonusSystemDto implements IEditBonusSystemDto {
    id: number;
    actionRules: EditActionRuleDto[];

    constructor(data?: any) {
        super();
        if (data) {
            this.id = data.id;
            this.name = data.name;
            this.description = data.description;
            this.periodTypeId = data.periodTypeId;
            this.periodStartDay = data.periodStartDay;
            this.periodStartWeekdayId = data.periodStartWeekdayId;
            this.budgetTypeId = data.budgetTypeId;
            this.amount = data.amount;
            this.isActive = data.isActive;
            this.actionRules = (data.actionRules || []).map((x: any) => new EditActionRuleDto(x));
        } else {
            this.actionRules = [];
        }
    }
}