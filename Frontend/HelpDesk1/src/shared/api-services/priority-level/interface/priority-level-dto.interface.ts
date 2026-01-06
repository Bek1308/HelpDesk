export interface IPriorityLevelDto {
    id: number;
    title: string;
    percentage: number;
}

export interface IPriorityLevelPagedResultDto {
    items: IPriorityLevelDto[] | undefined;
    totalCount: number;
}

export interface ICreatePriorityLevelDto {
    title: string;
    percentage: number;
}