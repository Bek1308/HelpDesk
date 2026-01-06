export interface ICallCenterIssuesDto {
    id: number;
    subCategoryId: number;
    subCategoryName: string;
    serviceId: number;
    serviceName: string;
    wrongNumber: number;
    rightNumber: number;
    terminalNumber : string;
    sum : string
    cancelledSum : string
    subscriber : string
    statusId: number;
    statusName: string;
    creationTime: Date;
    createdBy: number;
    creatorName: string;
    updatedAt: Date;
    updatedBy: number;
    updaterName: string;
}

export interface ICallCenterIssuesDtoPagedResultDto {
    items: ICallCenterIssuesDto[] | undefined;
    totalCount: number;
}

export interface ICreateCallCenterIssuesDto {
    subCategoryId: number;
    serviceId: number;
    wrongNumber: string;
    rightNumber: string;
    terminalNumber : string;
    sum : string
    cancelledSum : string
    subscriber : string
    statusId: number;
}
