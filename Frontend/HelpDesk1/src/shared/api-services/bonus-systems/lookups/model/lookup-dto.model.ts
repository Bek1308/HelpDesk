import { IBudgetTypeDto, IPagedResultDto, IPeriodTypeDto, IWeekdayDto } from "../interface/lookup-dto.interface";



export class PeriodTypeDto implements IPeriodTypeDto {
    id: number;
    name: string;
    description: string | undefined;
    quantity: number;
    creationTime: string;
    lastModificationTime: string | undefined;
    creatorUserId: number | undefined;
    creatorUserName: string | undefined;
    tenantId: number | undefined;

    constructor(data?: IPeriodTypeDto) {
        if (data) Object.assign(this, data);
    }

    static fromJS(data: any): PeriodTypeDto {
        return new PeriodTypeDto(data);
    }

    toJSON(): any {
        return { ...this };
    }
}

export class BudgetTypeDto implements IBudgetTypeDto {
    id: number;
    name: string;
    description: string | undefined;
    creationTime: string;
    lastModificationTime: string | undefined;
    creatorUserId: number | undefined;
    creatorUserName: string | undefined;
    tenantId: number | undefined;

    constructor(data?: IBudgetTypeDto) {
        if (data) Object.assign(this, data);
    }

    static fromJS(data: any): BudgetTypeDto {
        return new BudgetTypeDto(data);
    }

    toJSON(): any {
        return { ...this };
    }
}

export class WeekdayDto implements IWeekdayDto {
    id: number;
    name: string;
    creationTime: string;
    lastModificationTime: string | undefined;
    creatorUserId: number | undefined;
    creatorUserName: string | undefined;
    tenantId: number | undefined;

    constructor(data?: IWeekdayDto) {
        if (data) Object.assign(this, data);
    }

    static fromJS(data: any): WeekdayDto {
        return new WeekdayDto(data);
    }

    toJSON(): any {
        return { ...this };
    }
}

export class PagedResultDto<T> implements IPagedResultDto<T> {
    items: T[];
    totalCount: number;

    constructor(data?: IPagedResultDto<T>) {
        if (data) {
            this.items = data.items;
            this.totalCount = data.totalCount;
        }
    }

    static fromJS<T>(data: any, itemCreator: (item: any) => T): PagedResultDto<T> {
        const result = new PagedResultDto<T>();
        result.items = (data.items || []).map(itemCreator);
        result.totalCount = data.totalCount;
        return result;
    }
}