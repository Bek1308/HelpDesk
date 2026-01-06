// lookup-dto.interface.ts
export interface IPeriodTypeDto {
    id: number;
    name: string;
    description: string | undefined;
    quantity: number;
    creationTime: string;
    lastModificationTime: string | undefined;
    creatorUserId: number | undefined;
    creatorUserName: string | undefined;
    tenantId: number | undefined;
}

export interface IBudgetTypeDto {
    id: number;
    name: string;
    description: string | undefined;
    creationTime: string;
    lastModificationTime: string | undefined;
    creatorUserId: number | undefined;
    creatorUserName: string | undefined;
    tenantId: number | undefined;
}

export interface IWeekdayDto {
    id: number;
    name: string;
    creationTime: string;
    lastModificationTime: string | undefined;
    creatorUserId: number | undefined;
    creatorUserName: string | undefined;
    tenantId: number | undefined;
}

export interface IPagedResultDto<T> {
    items: T[];
    totalCount: number;
}