export interface IIssuesDto {
    id: number;
    title: string;
    issueCategory: string;
    description: string;
    priorityId: number;
    priorityName: string;
    issueStatusId: number;
    issueStatusName: string;
    reportedBy: number;
    reportedByName: string;
    isResolved: boolean;
    deadline?: Date;
    resolvedTime?: Date;
    creationTime: Date;
    lastModificationTime?: Date;
    tenantId?: number;
    clientFullName?: string; // Yangi maydon
    gender?: string; // Yangi maydon
    assigneeUserIds: number[];
    callCenterData?: ICallCenterIssueQueryDto;
    repairData?: IRepairIssueQueryDto;
    techDepartmentData?: ITechDepartmentIssueQueryDto;
    atmData?: IATMIssueQueryDto; // Yangi maydon
    payvandWalletData?: IPayvandWalletIssueQueryDto; // Yangi maydon
    payvandCardData?: IPayvandCardIssueQueryDto; // Yangi maydon
    issuesClaims?: IIssuesClaimsDto[];
}

export interface IIssuesDtoPagedResultDto {
    items: IIssuesDto[] | undefined;
    totalCount: number;
}

export interface ICreateIssuesDto {
    title: string;
    issueCategory: string;
    description: string;
    priorityId: number;
    issueStatusId: number;
    deadline?: Date;
    isResolved: boolean;
    clientFullName?: string; // Yangi maydon
    gender?: string; // Yangi maydon
    assigneeUserIds: number[];
    callCenterData?: ICallCenterIssueCommandDto;
    repairData?: IRepairIssueCommandDto;
    techDepartmentData?: ITechDepartmentIssueCommandDto;
    atmData?: IATMIssueCommandDto; // Yangi maydon
    payvandWalletData?: IPayvandWalletIssueCommandDto; // Yangi maydon
    payvandCardData?: IPayvandCardIssueCommandDto; // Yangi maydon
    issuesClaims?: ICreateIssuesClaimsDto[];
}

export interface IEditIssuesDto extends ICreateIssuesDto {
    id: number;
    resolvedTime?: Date;
    issuesClaims?: IEditIssuesClaimsDto[];
}

export interface ICallCenterIssueQueryDto {
    subCategoryId: number;
    subCategoryName: string;
    serviceId: number;
    serviceName: string;
    wrongNumber: string;
    rightNumber: string;
    terminalNumber: string;
    sum: number;
    cancelledSum: number;
    subscriber: string;
}

export interface ICallCenterIssueCommandDto {
    subCategoryId: number;
    serviceId: number;
    wrongNumber: string;
    rightNumber: string;
    terminalNumber: string;
    sum: number;
    cancelledSum: number;
    subscriber: string;
}

export interface IRepairIssueQueryDto {
    agentFullName: string;
    agentNumber: string;
    equipment: string;
    serialNumber: string;
    issueDescription: string;
    workAmount: number;
    replacementParts: string;
}

export interface IRepairIssueCommandDto {
    agentFullName: string;
    agentNumber: string;
    equipment: string;
    serialNumber: string;
    issueDescription: string;
    workAmount: number;
    replacementParts: string;
}

export interface ITechDepartmentIssueQueryDto {
    terminalNumber: string;
    terminalName: string;
    agentId: number;
    agentNumber: string;
    issueDescription: string;
    issueGroupId?: number;
    issueGroupName?: string;
    terminalLocation: string;
    cityId?: number;
    cityName?: string;
}

export interface ITechDepartmentIssueCommandDto {
    terminalNumber: string;
    terminalName: string;
    agentId: number;
    agentNumber: string;
    issueDescription: string;
    issueGroupId?: number;
    terminalLocation: string;
    cityId?: number;
}

export interface IATMIssueQueryDto {
    atmNumber: string;
    reason: string;
    issuingBank: string;
    amount: number;
    phoneNumber: string;
    subCategoryId: number;
    subCategoryName: string;
}

export interface IATMIssueCommandDto {
    atmNumber: string;
    reason: string;
    issuingBank: string;
    amount: number;
    phoneNumber: string;
    subCategoryId: number;
}

export interface IPayvandWalletIssueQueryDto {
    wrongNumber: string;
    rightNumber: string;
    serviceId: number;
    serviceName: string;
    amount: number;
    subCategoryId: number;
    subCategoryName: string;
}

export interface IPayvandWalletIssueCommandDto {
    wrongNumber: string;
    rightNumber: string;
    serviceId: number;
    amount: number;
    subCategoryId: number;
}

export interface IPayvandCardIssueQueryDto {
    wrongNumber: string;
    rightNumber: string;
    subCategoryId: number;
    subCategoryName: string;
}

export interface IPayvandCardIssueCommandDto {
    wrongNumber: string;
    rightNumber: string;
    subCategoryId: number;
}

export interface IIssuesClaimsDto {
    id?: number;
    claimKey: string;
    claimValue: string;
}

export interface IEditIssuesClaimsDto extends IIssuesClaimsDto {
    // id, claimKey, claimValue IIssuesClaimsDto dan meros olinadi
}

export interface ICreateIssuesClaimsDto extends IIssuesClaimsDto {
    // id, claimKey, claimValue IIssuesClaimsDto dan meros olinadi
}

export interface IGetAllIssuesInput {
    keyword?: string;
    title?: string;
    issueCategory?: string;
    description?: string;
    priorityId?: number;
    issueStatusId?: number;
    reportedBy?: number;
    isResolved?: boolean;
    deadlineStart?: Date;
    deadlineEnd?: Date;
    resolvedTimeStart?: Date;
    resolvedTimeEnd?: Date;
    tenantId?: number;
    assigneeUserId?: number;
    claimKey?: string;
    claimValue?: string;
    subCategoryId?: number;
    subCategoryName?: string;
    serviceId?: number;
    serviceName?: string;
    wrongNumber?: string;
    rightNumber?: string;
    terminalNumber?: string;
    sum?: number;
    cancelledSum?: number;
    subscriber?: string;
    agentFullName?: string;
    agentNumber?: string;
    equipment?: string;
    serialNumber?: string;
    repairIssueDescription?: string;
    workAmount?: number;
    replacementParts?: string;
    techTerminalNumber?: string;
    terminalName?: string;
    agentId?: number;
    techAgentNumber?: string;
    techIssueDescription?: string;
    issueGroupId?: number;
    issueGroupName?: string;
    terminalLocation?: string;
    cityId?: number;
    cityName?: string;
    creationTimeStart?: Date;
    creationTimeEnd?: Date;
    lastModificationTimeStart?: Date;
    lastModificationTimeEnd?: Date;
    skipCount?: number;
    maxResultCount?: number;
    sorting?: string;
}