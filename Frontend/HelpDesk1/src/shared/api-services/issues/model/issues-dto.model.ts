import {
    IIssuesDto,
    IIssuesDtoPagedResultDto,
    ICreateIssuesDto,
    IEditIssuesDto,
    ICallCenterIssueQueryDto,
    ICallCenterIssueCommandDto,
    IRepairIssueQueryDto,
    IRepairIssueCommandDto,
    ITechDepartmentIssueQueryDto,
    ITechDepartmentIssueCommandDto,
    ICreateIssuesClaimsDto,
    IEditIssuesClaimsDto,
    IGetAllIssuesInput,
    IIssuesClaimsDto,
    IATMIssueQueryDto,
    IATMIssueCommandDto,
    IPayvandWalletIssueQueryDto,
    IPayvandWalletIssueCommandDto,
    IPayvandCardIssueQueryDto,
    IPayvandCardIssueCommandDto,
} from '../interface/issues-dto.interface';

export class IssuesDto implements IIssuesDto {
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
    callCenterData?: CallCenterIssueQueryDto;
    repairData?: RepairIssueQueryDto;
    techDepartmentData?: TechDepartmentIssueQueryDto;
    atmData?: ATMIssueQueryDto; // Yangi maydon
    payvandWalletData?: PayvandWalletIssueQueryDto; // Yangi maydon
    payvandCardData?: PayvandCardIssueQueryDto; // Yangi maydon
    issuesClaims?: IssuesClaimsDto[];

    constructor(data?: IIssuesDto) {
        if (data) {
            this.id = data.id;
            this.title = data.title || '';
            this.issueCategory = data.issueCategory || '';
            this.description = data.description || '';
            this.priorityId = data.priorityId || 0;
            this.priorityName = data.priorityName || '';
            this.issueStatusId = data.issueStatusId || 0;
            this.issueStatusName = data.issueStatusName || '';
            this.reportedBy = data.reportedBy || 0;
            this.reportedByName = data.reportedByName || '';
            this.isResolved = data.isResolved || false;
            this.deadline = data.deadline ? new Date(data.deadline) : undefined;
            this.resolvedTime = data.resolvedTime ? new Date(data.resolvedTime) : undefined;
            this.creationTime = data.creationTime ? new Date(data.creationTime) : new Date();
            this.lastModificationTime = data.lastModificationTime ? new Date(data.lastModificationTime) : undefined;
            this.tenantId = data.tenantId;
            this.clientFullName = data.clientFullName; // Yangi maydon
            this.gender = data.gender; // Yangi maydon
            this.assigneeUserIds = data.assigneeUserIds ? data.assigneeUserIds.slice() : [];
            this.callCenterData = data.callCenterData ? new CallCenterIssueQueryDto(data.callCenterData) : undefined;
            this.repairData = data.repairData ? new RepairIssueQueryDto(data.repairData) : undefined;
            this.techDepartmentData = data.techDepartmentData ? new TechDepartmentIssueQueryDto(data.techDepartmentData) : undefined;
            this.atmData = data.atmData ? new ATMIssueQueryDto(data.atmData) : undefined; // Yangi maydon
            this.payvandWalletData = data.payvandWalletData ? new PayvandWalletIssueQueryDto(data.payvandWalletData) : undefined; // Yangi maydon
            this.payvandCardData = data.payvandCardData ? new PayvandCardIssueQueryDto(data.payvandCardData) : undefined; // Yangi maydon
            this.issuesClaims = data.issuesClaims ? data.issuesClaims.map(item => new IssuesClaimsDto(item)) : undefined;
        } else {
            this.id = 0;
            this.title = '';
            this.issueCategory = '';
            this.description = '';
            this.priorityId = 0;
            this.priorityName = '';
            this.issueStatusId = 0;
            this.issueStatusName = '';
            this.reportedBy = 0;
            this.reportedByName = '';
            this.isResolved = false;
            this.creationTime = new Date();
            this.clientFullName = undefined; // Yangi maydon
            this.gender = undefined; // Yangi maydon
            this.assigneeUserIds = [];
        }
    }

    init(data?: any): void {
        if (data) {
            this.id = data.id ?? 0;
            this.title = data.title ?? '';
            this.issueCategory = data.issueCategory ?? '';
            this.description = data.description ?? '';
            this.priorityId = data.priorityId ?? 0;
            this.priorityName = data.priorityName ?? '';
            this.issueStatusId = data.issueStatusId ?? 0;
            this.issueStatusName = data.issueStatusName ?? '';
            this.reportedBy = data.reportedBy ?? 0;
            this.reportedByName = data.reportedByName ?? '';
            this.isResolved = data.isResolved ?? false;
            this.deadline = data.deadline ? new Date(data.deadline) : undefined;
            this.resolvedTime = data.resolvedTime ? new Date(data.resolvedTime) : undefined;
            this.creationTime = data.creationTime ? new Date(data.creationTime) : new Date();
            this.lastModificationTime = data.lastModificationTime ? new Date(data.lastModificationTime) : undefined;
            this.tenantId = data.tenantId;
            this.clientFullName = data.clientFullName; // Yangi maydon
            this.gender = data.gender; // Yangi maydon
            this.assigneeUserIds = data.assigneeUserIds ? data.assigneeUserIds.slice() : [];
            this.callCenterData = data.callCenterData ? CallCenterIssueQueryDto.fromJS(data.callCenterData) : undefined;
            this.repairData = data.repairData ? RepairIssueQueryDto.fromJS(data.repairData) : undefined;
            this.techDepartmentData = data.techDepartmentData ? TechDepartmentIssueQueryDto.fromJS(data.techDepartmentData) : undefined;
            this.atmData = data.atmData ? ATMIssueQueryDto.fromJS(data.atmData) : undefined; // Yangi maydon
            this.payvandWalletData = data.payvandWalletData ? PayvandWalletIssueQueryDto.fromJS(data.payvandWalletData) : undefined; // Yangi maydon
            this.payvandCardData = data.payvandCardData ? PayvandCardIssueQueryDto.fromJS(data.payvandCardData) : undefined; // Yangi maydon
            this.issuesClaims = data.issuesClaims ? data.issuesClaims.map((item: any) => IssuesClaimsDto.fromJS(item)) : undefined;
        }
    }

    static fromJS(data: any): IssuesDto {
        data = typeof data === 'object' ? data : {};
        const result = new IssuesDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.id = this.id;
        data.title = this.title;
        data.issueCategory = this.issueCategory;
        data.description = this.description;
        data.priorityId = this.priorityId;
        data.priorityName = this.priorityName;
        data.issueStatusId = this.issueStatusId;
        data.issueStatusName = this.issueStatusName;
        data.reportedBy = this.reportedBy;
        data.reportedByName = this.reportedByName;
        data.isResolved = this.isResolved;
        data.deadline = this.deadline ? this.deadline.toISOString() : undefined;
        data.resolvedTime = this.resolvedTime ? this.resolvedTime.toISOString() : undefined;
        data.creationTime = this.creationTime ? this.creationTime.toISOString() : undefined;
        data.lastModificationTime = this.lastModificationTime ? this.lastModificationTime.toISOString() : undefined;
        data.tenantId = this.tenantId;
        data.clientFullName = this.clientFullName; // Yangi maydon
        data.gender = this.gender; // Yangi maydon
        data.assigneeUserIds = this.assigneeUserIds ? this.assigneeUserIds.slice() : [];
        data.callCenterData = this.callCenterData ? this.callCenterData.toJSON() : undefined;
        data.repairData = this.repairData ? this.repairData.toJSON() : undefined;
        data.techDepartmentData = this.techDepartmentData ? this.techDepartmentData.toJSON() : undefined;
        data.atmData = this.atmData ? this.atmData.toJSON() : undefined; // Yangi maydon
        data.payvandWalletData = this.payvandWalletData ? this.payvandWalletData.toJSON() : undefined; // Yangi maydon
        data.payvandCardData = this.payvandCardData ? this.payvandCardData.toJSON() : undefined; // Yangi maydon
        data.issuesClaims = this.issuesClaims ? this.issuesClaims.map(item => item.toJSON()) : undefined;
        return data;
    }

    clone(): IssuesDto {
        const json = this.toJSON();
        const result = new IssuesDto();
        result.init(json);
        return result;
    }
}

export class IssuesDtoPagedResultDto implements IIssuesDtoPagedResultDto {
    items: IssuesDto[] | undefined;
    totalCount: number;

    constructor(data?: IIssuesDtoPagedResultDto) {
        if (data) {
            this.items = data.items ? data.items.map(item => new IssuesDto(item)) : undefined;
            this.totalCount = data.totalCount ?? 0;
        } else {
            this.totalCount = 0;
        }
    }

    init(data?: any): void {
        if (data) {
            this.items = data.items ? data.items.map((item: any) => IssuesDto.fromJS(item)) : undefined;
            this.totalCount = data.totalCount ?? 0;
        }
    }

    static fromJS(data: any): IssuesDtoPagedResultDto {
        data = typeof data === 'object' ? data : {};
        const result = new IssuesDtoPagedResultDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.items = this.items ? this.items.map(item => item.toJSON()) : undefined;
        data.totalCount = this.totalCount;
        return data;
    }

    clone(): IssuesDtoPagedResultDto {
        const json = this.toJSON();
        const result = new IssuesDtoPagedResultDto();
        result.init(json);
        return result;
    }
}

export class CreateIssuesDto implements ICreateIssuesDto {
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
    callCenterData?: CallCenterIssueCommandDto;
    repairData?: RepairIssueCommandDto;
    techDepartmentData?: TechDepartmentIssueCommandDto;
    atmData?: ATMIssueCommandDto; // Yangi maydon
    payvandWalletData?: PayvandWalletIssueCommandDto; // Yangi maydon
    payvandCardData?: PayvandCardIssueCommandDto; // Yangi maydon
    issuesClaims?: CreateIssuesClaimsDto[];

    constructor(data?: ICreateIssuesDto) {
        if (data) {
            this.title = data.title || '';
            this.issueCategory = data.issueCategory || '';
            this.description = data.description || '';
            this.priorityId = data.priorityId || 0;
            this.issueStatusId = data.issueStatusId || 0;
            this.deadline = data.deadline ? new Date(data.deadline) : undefined;
            this.isResolved = data.isResolved ?? false;
            this.clientFullName = data.clientFullName; // Yangi maydon
            this.gender = data.gender; // Yangi maydon
            this.assigneeUserIds = data.assigneeUserIds ? data.assigneeUserIds.slice() : [];
            this.callCenterData = data.callCenterData ? new CallCenterIssueCommandDto(data.callCenterData) : undefined;
            this.repairData = data.repairData ? new RepairIssueCommandDto(data.repairData) : undefined;
            this.techDepartmentData = data.techDepartmentData ? new TechDepartmentIssueCommandDto(data.techDepartmentData) : undefined;
            this.atmData = data.atmData ? new ATMIssueCommandDto(data.atmData) : undefined; // Yangi maydon
            this.payvandWalletData = data.payvandWalletData ? new PayvandWalletIssueCommandDto(data.payvandWalletData) : undefined; // Yangi maydon
            this.payvandCardData = data.payvandCardData ? new PayvandCardIssueCommandDto(data.payvandCardData) : undefined; // Yangi maydon
            this.issuesClaims = data.issuesClaims ? data.issuesClaims.map(item => new CreateIssuesClaimsDto(item)) : undefined;
        } else {
            this.title = '';
            this.issueCategory = '';
            this.description = '';
            this.priorityId = 0;
            this.issueStatusId = 0;
            this.isResolved = false;
            this.clientFullName = undefined; // Yangi maydon
            this.gender = undefined; // Yangi maydon
            this.assigneeUserIds = [];
        }
    }

    init(data?: any): void {
        if (data) {
            this.title = data.title ?? '';
            this.issueCategory = data.issueCategory ?? '';
            this.description = data.description ?? '';
            this.priorityId = data.priorityId ?? 0;
            this.issueStatusId = data.issueStatusId ?? 0;
            this.deadline = data.deadline ? new Date(data.deadline) : undefined;
            this.isResolved = data.isResolved ?? false;
            this.clientFullName = data.clientFullName; // Yangi maydon
            this.gender = data.gender; // Yangi maydon
            this.assigneeUserIds = data.assigneeUserIds ? data.assigneeUserIds.slice() : [];
            this.callCenterData = data.callCenterData ? CallCenterIssueCommandDto.fromJS(data.callCenterData) : undefined;
            this.repairData = data.repairData ? RepairIssueCommandDto.fromJS(data.repairData) : undefined;
            this.techDepartmentData = data.techDepartmentData ? TechDepartmentIssueCommandDto.fromJS(data.techDepartmentData) : undefined;
            this.atmData = data.atmData ? ATMIssueCommandDto.fromJS(data.atmData) : undefined; // Yangi maydon
            this.payvandWalletData = data.payvandWalletData ? PayvandWalletIssueCommandDto.fromJS(data.payvandWalletData) : undefined; // Yangi maydon
            this.payvandCardData = data.payvandCardData ? PayvandCardIssueCommandDto.fromJS(data.payvandCardData) : undefined; // Yangi maydon
            this.issuesClaims = data.issuesClaims ? data.issuesClaims.map((item: any) => CreateIssuesClaimsDto.fromJS(item)) : undefined;
        }
    }

    static fromJS(data: any): CreateIssuesDto {
        data = typeof data === 'object' ? data : {};
        const result = new CreateIssuesDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.title = this.title;
        data.issueCategory = this.issueCategory;
        data.description = this.description;
        data.priorityId = this.priorityId;
        data.issueStatusId = this.issueStatusId;
        data.deadline = this.deadline ? this.deadline.toISOString() : undefined;
        data.isResolved = this.isResolved;
        data.clientFullName = this.clientFullName; // Yangi maydon
        data.gender = this.gender; // Yangi maydon
        data.assigneeUserIds = this.assigneeUserIds ? this.assigneeUserIds.slice() : [];
        data.callCenterData = this.callCenterData ? this.callCenterData.toJSON() : undefined;
        data.repairData = this.repairData ? this.repairData.toJSON() : undefined;
        data.techDepartmentData = this.techDepartmentData ? this.techDepartmentData.toJSON() : undefined;
        data.atmData = this.atmData ? this.atmData.toJSON() : undefined; // Yangi maydon
        data.payvandWalletData = this.payvandWalletData ? this.payvandWalletData.toJSON() : undefined; // Yangi maydon
        data.payvandCardData = this.payvandCardData ? this.payvandCardData.toJSON() : undefined; // Yangi maydon
        data.issuesClaims = this.issuesClaims ? this.issuesClaims.map(item => item.toJSON()) : undefined;
        return data;
    }
}

export class EditIssuesDto implements IEditIssuesDto {
    id: number;
    title: string;
    issueCategory: string;
    description: string;
    priorityId: number;
    issueStatusId: number;
    deadline?: Date;
    isResolved: boolean;
    resolvedTime?: Date;
    clientFullName?: string; // Yangi maydon
    gender?: string; // Yangi maydon
    assigneeUserIds: number[];
    callCenterData?: CallCenterIssueCommandDto;
    repairData?: RepairIssueCommandDto;
    techDepartmentData?: TechDepartmentIssueCommandDto;
    atmData?: ATMIssueCommandDto; // Yangi maydon
    payvandWalletData?: PayvandWalletIssueCommandDto; // Yangi maydon
    payvandCardData?: PayvandCardIssueCommandDto; // Yangi maydon
    issuesClaims?: EditIssuesClaimsDto[];

    constructor(data?: IEditIssuesDto) {
        if (data) {
            this.id = data.id ?? 0;
            this.title = data.title || '';
            this.issueCategory = data.issueCategory || '';
            this.description = data.description || '';
            this.priorityId = data.priorityId || 0;
            this.issueStatusId = data.issueStatusId || 0;
            this.deadline = data.deadline ? new Date(data.deadline) : undefined;
            this.isResolved = data.isResolved ?? false;
            this.resolvedTime = data.resolvedTime ? new Date(data.resolvedTime) : undefined;
            this.clientFullName = data.clientFullName; // Yangi maydon
            this.gender = data.gender; // Yangi maydon
            this.assigneeUserIds = data.assigneeUserIds ? data.assigneeUserIds.slice() : [];
            this.callCenterData = data.callCenterData ? new CallCenterIssueCommandDto(data.callCenterData) : undefined;
            this.repairData = data.repairData ? new RepairIssueCommandDto(data.repairData) : undefined;
            this.techDepartmentData = data.techDepartmentData ? new TechDepartmentIssueCommandDto(data.techDepartmentData) : undefined;
            this.atmData = data.atmData ? new ATMIssueCommandDto(data.atmData) : undefined; // Yangi maydon
            this.payvandWalletData = data.payvandWalletData ? new PayvandWalletIssueCommandDto(data.payvandWalletData) : undefined; // Yangi maydon
            this.payvandCardData = data.payvandCardData ? new PayvandCardIssueCommandDto(data.payvandCardData) : undefined; // Yangi maydon
            this.issuesClaims = data.issuesClaims ? data.issuesClaims.map(item => new EditIssuesClaimsDto(item)) : undefined;
        } else {
            this.id = 0;
            this.title = '';
            this.issueCategory = '';
            this.description = '';
            this.priorityId = 0;
            this.issueStatusId = 0;
            this.isResolved = false;
            this.clientFullName = undefined; // Yangi maydon
            this.gender = undefined; // Yangi maydon
            this.assigneeUserIds = [];
        }
    }

    init(data?: any): void {
        if (data) {
            this.id = data.id ?? 0;
            this.title = data.title ?? '';
            this.issueCategory = data.issueCategory ?? '';
            this.description = data.description ?? '';
            this.priorityId = data.priorityId ?? 0;
            this.issueStatusId = data.issueStatusId ?? 0;
            this.deadline = data.deadline ? new Date(data.deadline) : undefined;
            this.isResolved = data.isResolved ?? false;
            this.resolvedTime = data.resolvedTime ? new Date(data.resolvedTime) : undefined;
            this.clientFullName = data.clientFullName; // Yangi maydon
            this.gender = data.gender; // Yangi maydon
            this.assigneeUserIds = data.assigneeUserIds ? data.assigneeUserIds.slice() : [];
            this.callCenterData = data.callCenterData ? CallCenterIssueCommandDto.fromJS(data.callCenterData) : undefined;
            this.repairData = data.repairData ? RepairIssueCommandDto.fromJS(data.repairData) : undefined;
            this.techDepartmentData = data.techDepartmentData ? TechDepartmentIssueCommandDto.fromJS(data.techDepartmentData) : undefined;
            this.atmData = data.atmData ? ATMIssueCommandDto.fromJS(data.atmData) : undefined; // Yangi maydon
            this.payvandWalletData = data.payvandWalletData ? PayvandWalletIssueCommandDto.fromJS(data.payvandWalletData) : undefined; // Yangi maydon
            this.payvandCardData = data.payvandCardData ? PayvandCardIssueCommandDto.fromJS(data.payvandCardData) : undefined; // Yangi maydon
            this.issuesClaims = data.issuesClaims ? data.issuesClaims.map((item: any) => EditIssuesClaimsDto.fromJS(item)) : undefined;
        }
    }

    static fromJS(data: any): EditIssuesDto {
        data = typeof data === 'object' ? data : {};
        const result = new EditIssuesDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.id = this.id;
        data.title = this.title;
        data.issueCategory = this.issueCategory;
        data.description = this.description;
        data.priorityId = this.priorityId;
        data.issueStatusId = this.issueStatusId;
        data.deadline = this.deadline ? this.deadline.toISOString() : undefined;
        data.isResolved = this.isResolved;
        data.resolvedTime = this.resolvedTime ? this.resolvedTime.toISOString() : undefined;
        data.clientFullName = this.clientFullName; // Yangi maydon
        data.gender = this.gender; // Yangi maydon
        data.assigneeUserIds = this.assigneeUserIds ? this.assigneeUserIds.slice() : [];
        data.callCenterData = this.callCenterData ? this.callCenterData.toJSON() : undefined;
        data.repairData = this.repairData ? this.repairData.toJSON() : undefined;
        data.techDepartmentData = this.techDepartmentData ? this.techDepartmentData.toJSON() : undefined;
        data.atmData = this.atmData ? this.atmData.toJSON() : undefined; // Yangi maydon
        data.payvandWalletData = this.payvandWalletData ? this.payvandWalletData.toJSON() : undefined; // Yangi maydon
        data.payvandCardData = this.payvandCardData ? this.payvandCardData.toJSON() : undefined; // Yangi maydon
        data.issuesClaims = this.issuesClaims ? this.issuesClaims.map(item => item.toJSON()) : undefined;
        return data;
    }
}

export class CallCenterIssueQueryDto implements ICallCenterIssueQueryDto {
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

    constructor(data?: ICallCenterIssueQueryDto) {
        if (data) {
            this.subCategoryId = data.subCategoryId ?? 0;
            this.subCategoryName = data.subCategoryName ?? '';
            this.serviceId = data.serviceId ?? 0;
            this.serviceName = data.serviceName ?? '';
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.terminalNumber = data.terminalNumber ?? '';
            this.sum = data.sum ?? 0;
            this.cancelledSum = data.cancelledSum ?? 0;
            this.subscriber = data.subscriber ?? '';
        } else {
            this.subCategoryId = 0;
            this.subCategoryName = '';
            this.serviceId = 0;
            this.serviceName = '';
            this.wrongNumber = '';
            this.rightNumber = '';
            this.terminalNumber = '';
            this.sum = 0;
            this.cancelledSum = 0;
            this.subscriber = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.subCategoryId = data.subCategoryId ?? 0;
            this.subCategoryName = data.subCategoryName ?? '';
            this.serviceId = data.serviceId ?? 0;
            this.serviceName = data.serviceName ?? '';
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.terminalNumber = data.terminalNumber ?? '';
            this.sum = data.sum ? parseFloat(data.sum) : 0;
            this.cancelledSum = data.cancelledSum ? parseFloat(data.cancelledSum) : 0;
            this.subscriber = data.subscriber ?? '';
        }
    }

    static fromJS(data: any): CallCenterIssueQueryDto {
        data = typeof data === 'object' ? data : {};
        const result = new CallCenterIssueQueryDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.subCategoryId = this.subCategoryId;
        data.subCategoryName = this.subCategoryName;
        data.serviceId = this.serviceId;
        data.serviceName = this.serviceName;
        data.wrongNumber = this.wrongNumber;
        data.rightNumber = this.rightNumber;
        data.terminalNumber = this.terminalNumber;
        data.sum = this.sum;
        data.cancelledSum = this.cancelledSum;
        data.subscriber = this.subscriber;
        return data;
    }
}

export class CallCenterIssueCommandDto implements ICallCenterIssueCommandDto {
    subCategoryId: number;
    serviceId: number;
    wrongNumber: string;
    rightNumber: string;
    terminalNumber: string;
    sum: number;
    cancelledSum: number;
    subscriber: string;

    constructor(data?: ICallCenterIssueCommandDto) {
        if (data) {
            this.subCategoryId = data.subCategoryId ?? 0;
            this.serviceId = data.serviceId ?? 0;
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.terminalNumber = data.terminalNumber ?? '';
            this.sum = data.sum ?? 0;
            this.cancelledSum = data.cancelledSum ?? 0;
            this.subscriber = data.subscriber ?? '';
        } else {
            this.subCategoryId = 0;
            this.serviceId = 0;
            this.wrongNumber = '';
            this.rightNumber = '';
            this.terminalNumber = '';
            this.sum = 0;
            this.cancelledSum = 0;
            this.subscriber = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.subCategoryId = data.subCategoryId ?? 0;
            this.serviceId = data.serviceId ?? 0;
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.terminalNumber = data.terminalNumber ?? '';
            this.sum = data.sum ? parseFloat(data.sum) : 0;
            this.cancelledSum = data.cancelledSum ? parseFloat(data.cancelledSum) : 0;
            this.subscriber = data.subscriber ?? '';
        }
    }

    static fromJS(data: any): CallCenterIssueCommandDto {
        data = typeof data === 'object' ? data : {};
        const result = new CallCenterIssueCommandDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.subCategoryId = this.subCategoryId;
        data.serviceId = this.serviceId;
        data.wrongNumber = this.wrongNumber;
        data.rightNumber = this.rightNumber;
        data.terminalNumber = this.terminalNumber;
        data.sum = this.sum;
        data.cancelledSum = this.cancelledSum;
        data.subscriber = this.subscriber;
        return data;
    }
}

export class RepairIssueQueryDto implements IRepairIssueQueryDto {
    agentFullName: string;
    agentNumber: string;
    equipment: string;
    serialNumber: string;
    issueDescription: string;
    workAmount: number;
    replacementParts: string;

    constructor(data?: IRepairIssueQueryDto) {
        if (data) {
            this.agentFullName = data.agentFullName ?? '';
            this.agentNumber = data.agentNumber ?? '';
            this.equipment = data.equipment ?? '';
            this.serialNumber = data.serialNumber ?? '';
            this.issueDescription = data.issueDescription ?? '';
            this.workAmount = data.workAmount ?? 0;
            this.replacementParts = data.replacementParts ?? '';
        } else {
            this.agentFullName = '';
            this.agentNumber = '';
            this.equipment = '';
            this.serialNumber = '';
            this.issueDescription = '';
            this.workAmount = 0;
            this.replacementParts = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.agentFullName = data.agentFullName ?? '';
            this.agentNumber = data.agentNumber ?? '';
            this.equipment = data.equipment ?? '';
            this.serialNumber = data.serialNumber ?? '';
            this.issueDescription = data.issueDescription ?? '';
            this.workAmount = data.workAmount ?? 0;
            this.replacementParts = data.replacementParts ?? '';
        }
    }

    static fromJS(data: any): RepairIssueQueryDto {
        data = typeof data === 'object' ? data : {};
        const result = new RepairIssueQueryDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.agentFullName = this.agentFullName;
        data.agentNumber = this.agentNumber;
        data.equipment = this.equipment;
        data.serialNumber = this.serialNumber;
        data.issueDescription = this.issueDescription;
        data.workAmount = this.workAmount;
        data.replacementParts = this.replacementParts;
        return data;
    }
}

export class RepairIssueCommandDto implements IRepairIssueCommandDto {
    agentFullName: string;
    agentNumber: string;
    equipment: string;
    serialNumber: string;
    issueDescription: string;
    workAmount: number;
    replacementParts: string;

    constructor(data?: IRepairIssueCommandDto) {
        if (data) {
            this.agentFullName = data.agentFullName ?? '';
            this.agentNumber = data.agentNumber ?? '';
            this.equipment = data.equipment ?? '';
            this.serialNumber = data.serialNumber ?? '';
            this.issueDescription = data.issueDescription ?? '';
            this.workAmount = data.workAmount ?? 0;
            this.replacementParts = data.replacementParts ?? '';
        } else {
            this.agentFullName = '';
            this.agentNumber = '';
            this.equipment = '';
            this.serialNumber = '';
            this.issueDescription = '';
            this.workAmount = 0;
            this.replacementParts = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.agentFullName = data.agentFullName ?? '';
            this.agentNumber = data.agentNumber ?? '';
            this.equipment = data.equipment ?? '';
            this.serialNumber = data.serialNumber ?? '';
            this.issueDescription = data.issueDescription ?? '';
            this.workAmount = data.workAmount ?? 0;
            this.replacementParts = data.replacementParts ?? '';
        }
    }

    static fromJS(data: any): RepairIssueCommandDto {
        data = typeof data === 'object' ? data : {};
        const result = new RepairIssueCommandDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.agentFullName = this.agentFullName;
        data.agentNumber = this.agentNumber;
        data.equipment = this.equipment;
        data.serialNumber = this.serialNumber;
        data.issueDescription = this.issueDescription;
        data.workAmount = this.workAmount;
        data.replacementParts = this.replacementParts;
        return data;
    }
}

export class TechDepartmentIssueQueryDto implements ITechDepartmentIssueQueryDto {
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

    constructor(data?: ITechDepartmentIssueQueryDto) {
        if (data) {
            this.terminalNumber = data.terminalNumber ?? '';
            this.terminalName = data.terminalName ?? '';
            this.agentId = data.agentId ?? 0;
            this.agentNumber = data.agentNumber ?? '';
            this.issueDescription = data.issueDescription ?? '';
            this.issueGroupId = data.issueGroupId;
            this.issueGroupName = data.issueGroupName;
            this.terminalLocation = data.terminalLocation ?? '';
            this.cityId = data.cityId;
            this.cityName = data.cityName;
        } else {
            this.terminalNumber = '';
            this.terminalName = '';
            this.agentId = 0;
            this.agentNumber = '';
            this.issueDescription = '';
            this.terminalLocation = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.terminalNumber = data.terminalNumber ?? '';
            this.terminalName = data.terminalName ?? '';
            this.agentId = data.agentId ?? 0;
            this.agentNumber = data.agentNumber ?? '';
            this.issueDescription = data.issueDescription ?? '';
            this.issueGroupId = data.issueGroupId;
            this.issueGroupName = data.issueGroupName;
            this.terminalLocation = data.terminalLocation ?? '';
            this.cityId = data.cityId;
            this.cityName = data.cityName;
        }
    }

    static fromJS(data: any): TechDepartmentIssueQueryDto {
        data = typeof data === 'object' ? data : {};
        const result = new TechDepartmentIssueQueryDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.terminalNumber = this.terminalNumber;
        data.terminalName = this.terminalName;
        data.agentId = this.agentId;
        data.agentNumber = this.agentNumber;
        data.issueDescription = this.issueDescription;
        data.issueGroupId = this.issueGroupId;
        data.issueGroupName = this.issueGroupName;
        data.terminalLocation = this.terminalLocation;
        data.cityId = this.cityId;
        data.cityName = this.cityName;
        return data;
    }
}

export class TechDepartmentIssueCommandDto implements ITechDepartmentIssueCommandDto {
    terminalNumber: string;
    terminalName: string;
    agentId: number;
    agentNumber: string;
    issueDescription: string;
    issueGroupId?: number;
    terminalLocation: string;
    cityId?: number;

    constructor(data?: ITechDepartmentIssueCommandDto) {
        if (data) {
            this.terminalNumber = data.terminalNumber ?? '';
            this.terminalName = data.terminalName ?? '';
            this.agentId = data.agentId ?? 0;
            this.agentNumber = data.agentNumber ?? '';
            this.issueDescription = data.issueDescription ?? '';
            this.issueGroupId = data.issueGroupId;
            this.terminalLocation = data.terminalLocation ?? '';
            this.cityId = data.cityId;
        } else {
            this.terminalNumber = '';
            this.terminalName = '';
            this.agentId = 0;
            this.agentNumber = '';
            this.issueDescription = '';
            this.terminalLocation = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.terminalNumber = data.terminalNumber ?? '';
            this.terminalName = data.terminalName ?? '';
            this.agentId = data.agentId ?? 0;
            this.agentNumber = data.agentNumber ?? '';
            this.issueDescription = data.issueDescription ?? '';
            this.issueGroupId = data.issueGroupId;
            this.terminalLocation = data.terminalLocation ?? '';
            this.cityId = data.cityId;
        }
    }

    static fromJS(data: any): TechDepartmentIssueCommandDto {
        data = typeof data === 'object' ? data : {};
        const result = new TechDepartmentIssueCommandDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.terminalNumber = this.terminalNumber;
        data.terminalName = this.terminalName;
        data.agentId = this.agentId;
        data.agentNumber = this.agentNumber;
        data.issueDescription = this.issueDescription;
        data.issueGroupId = this.issueGroupId;
        data.terminalLocation = this.terminalLocation;
        data.cityId = this.cityId;
        return data;
    }
}

export class ATMIssueQueryDto implements IATMIssueQueryDto {
    atmNumber: string;
    reason: string;
    issuingBank: string;
    amount: number;
    phoneNumber: string;
    subCategoryId: number;
    subCategoryName: string;

    constructor(data?: IATMIssueQueryDto) {
        if (data) {
            this.atmNumber = data.atmNumber ?? '';
            this.reason = data.reason ?? '';
            this.issuingBank = data.issuingBank ?? '';
            this.amount = data.amount ?? 0;
            this.phoneNumber = data.phoneNumber ?? '';
            this.subCategoryId = data.subCategoryId ?? 0;
            this.subCategoryName = data.subCategoryName ?? '';
        } else {
            this.atmNumber = '';
            this.reason = '';
            this.issuingBank = '';
            this.amount = 0;
            this.phoneNumber = '';
            this.subCategoryId = 0;
            this.subCategoryName = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.atmNumber = data.atmNumber ?? '';
            this.reason = data.reason ?? '';
            this.issuingBank = data.issuingBank ?? '';
            this.amount = data.amount ? parseFloat(data.amount) : 0;
            this.phoneNumber = data.phoneNumber ?? '';
            this.subCategoryId = data.subCategoryId ?? 0;
            this.subCategoryName = data.subCategoryName ?? '';
        }
    }

    static fromJS(data: any): ATMIssueQueryDto {
        data = typeof data === 'object' ? data : {};
        const result = new ATMIssueQueryDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.atmNumber = this.atmNumber;
        data.reason = this.reason;
        data.issuingBank = this.issuingBank;
        data.amount = this.amount;
        data.phoneNumber = this.phoneNumber;
        data.subCategoryId = this.subCategoryId;
        data.subCategoryName = this.subCategoryName;
        return data;
    }
}

export class ATMIssueCommandDto implements IATMIssueCommandDto {
    atmNumber: string;
    reason: string;
    issuingBank: string;
    amount: number;
    phoneNumber: string;
    subCategoryId: number;

    constructor(data?: IATMIssueCommandDto) {
        if (data) {
            this.atmNumber = data.atmNumber ?? '';
            this.reason = data.reason ?? '';
            this.issuingBank = data.issuingBank ?? '';
            this.amount = data.amount ?? 0;
            this.phoneNumber = data.phoneNumber ?? '';
            this.subCategoryId = data.subCategoryId ?? 0;
        } else {
            this.atmNumber = '';
            this.reason = '';
            this.issuingBank = '';
            this.amount = 0;
            this.phoneNumber = '';
            this.subCategoryId = 0;
        }
    }

    init(data?: any): void {
        if (data) {
            this.atmNumber = data.atmNumber ?? '';
            this.reason = data.reason ?? '';
            this.issuingBank = data.issuingBank ?? '';
            this.amount = data.amount ? parseFloat(data.amount) : 0;
            this.phoneNumber = data.phoneNumber ?? '';
            this.subCategoryId = data.subCategoryId ?? 0;
        }
    }

    static fromJS(data: any): ATMIssueCommandDto {
        data = typeof data === 'object' ? data : {};
        const result = new ATMIssueCommandDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.atmNumber = this.atmNumber;
        data.reason = this.reason;
        data.issuingBank = this.issuingBank;
        data.amount = this.amount;
        data.phoneNumber = this.phoneNumber;
        data.subCategoryId = this.subCategoryId;
        return data;
    }
}

export class PayvandWalletIssueQueryDto implements IPayvandWalletIssueQueryDto {
    wrongNumber: string;
    rightNumber: string;
    serviceId: number;
    serviceName: string;
    amount: number;
    subCategoryId: number;
    subCategoryName: string;

    constructor(data?: IPayvandWalletIssueQueryDto) {
        if (data) {
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.serviceId = data.serviceId ?? 0;
            this.serviceName = data.serviceName ?? '';
            this.amount = data.amount ?? 0;
            this.subCategoryId = data.subCategoryId ?? 0;
            this.subCategoryName = data.subCategoryName ?? '';
        } else {
            this.wrongNumber = '';
            this.rightNumber = '';
            this.serviceId = 0;
            this.serviceName = '';
            this.amount = 0;
            this.subCategoryId = 0;
            this.subCategoryName = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.serviceId = data.serviceId ?? 0;
            this.serviceName = data.serviceName ?? '';
            this.amount = data.amount ? parseFloat(data.amount) : 0;
            this.subCategoryId = data.subCategoryId ?? 0;
            this.subCategoryName = data.subCategoryName ?? '';
        }
    }

    static fromJS(data: any): PayvandWalletIssueQueryDto {
        data = typeof data === 'object' ? data : {};
        const result = new PayvandWalletIssueQueryDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.wrongNumber = this.wrongNumber;
        data.rightNumber = this.rightNumber;
        data.serviceId = this.serviceId;
        data.serviceName = this.serviceName;
        data.amount = this.amount;
        data.subCategoryId = this.subCategoryId;
        data.subCategoryName = this.subCategoryName;
        return data;
    }
}

export class PayvandWalletIssueCommandDto implements IPayvandWalletIssueCommandDto {
    wrongNumber: string;
    rightNumber: string;
    serviceId: number;
    amount: number;
    subCategoryId: number;

    constructor(data?: IPayvandWalletIssueCommandDto) {
        if (data) {
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.serviceId = data.serviceId ?? 0;
            this.amount = data.amount ?? 0;
            this.subCategoryId = data.subCategoryId ?? 0;
        } else {
            this.wrongNumber = '';
            this.rightNumber = '';
            this.serviceId = 0;
            this.amount = 0;
            this.subCategoryId = 0;
        }
    }

    init(data?: any): void {
        if (data) {
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.serviceId = data.serviceId ?? 0;
            this.amount = data.amount ? parseFloat(data.amount) : 0;
            this.subCategoryId = data.subCategoryId ?? 0;
        }
    }

    static fromJS(data: any): PayvandWalletIssueCommandDto {
        data = typeof data === 'object' ? data : {};
        const result = new PayvandWalletIssueCommandDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.wrongNumber = this.wrongNumber;
        data.rightNumber = this.rightNumber;
        data.serviceId = this.serviceId;
        data.amount = this.amount;
        data.subCategoryId = this.subCategoryId;
        return data;
    }
}

export class PayvandCardIssueQueryDto implements IPayvandCardIssueQueryDto {
    wrongNumber: string;
    rightNumber: string;
    subCategoryId: number;
    subCategoryName: string;

    constructor(data?: IPayvandCardIssueQueryDto) {
        if (data) {
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.subCategoryId = data.subCategoryId ?? 0;
            this.subCategoryName = data.subCategoryName ?? '';
        } else {
            this.wrongNumber = '';
            this.rightNumber = '';
            this.subCategoryId = 0;
            this.subCategoryName = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.subCategoryId = data.subCategoryId ?? 0;
            this.subCategoryName = data.subCategoryName ?? '';
        }
    }

    static fromJS(data: any): PayvandCardIssueQueryDto {
        data = typeof data === 'object' ? data : {};
        const result = new PayvandCardIssueQueryDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.wrongNumber = this.wrongNumber;
        data.rightNumber = this.rightNumber;
        data.subCategoryId = this.subCategoryId;
        data.subCategoryName = this.subCategoryName;
        return data;
    }
}

export class PayvandCardIssueCommandDto implements IPayvandCardIssueCommandDto {
    wrongNumber: string;
    rightNumber: string;
    subCategoryId: number;

    constructor(data?: IPayvandCardIssueCommandDto) {
        if (data) {
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.subCategoryId = data.subCategoryId ?? 0;
        } else {
            this.wrongNumber = '';
            this.rightNumber = '';
            this.subCategoryId = 0;
        }
    }

    init(data?: any): void {
        if (data) {
            this.wrongNumber = data.wrongNumber ?? '';
            this.rightNumber = data.rightNumber ?? '';
            this.subCategoryId = data.subCategoryId ?? 0;
        }
    }

    static fromJS(data: any): PayvandCardIssueCommandDto {
        data = typeof data === 'object' ? data : {};
        const result = new PayvandCardIssueCommandDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.wrongNumber = this.wrongNumber;
        data.rightNumber = this.rightNumber;
        data.subCategoryId = this.subCategoryId;
        return data;
    }
}

export class IssuesClaimsDto implements IIssuesClaimsDto {
    id?: number;
    claimKey: string;
    claimValue: string;

    constructor(data?: IIssuesClaimsDto) {
        if (data) {
            this.id = data.id;
            this.claimKey = data.claimKey ?? '';
            this.claimValue = data.claimValue ?? '';
        } else {
            this.claimKey = '';
            this.claimValue = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.id = data.id;
            this.claimKey = data.claimKey ?? '';
            this.claimValue = data.claimValue ?? '';
        }
    }

    static fromJS(data: any): IssuesClaimsDto {
        data = typeof data === 'object' ? data : {};
        const result = new IssuesClaimsDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.id = this.id;
        data.claimKey = this.claimKey;
        data.claimValue = this.claimValue;
        return data;
    }

    clone(): IssuesClaimsDto {
        const json = this.toJSON();
        const result = new IssuesClaimsDto();
        result.init(json);
        return result;
    }
}

export class EditIssuesClaimsDto implements IEditIssuesClaimsDto {
    id?: number;
    claimKey: string;
    claimValue: string;

    constructor(data?: IEditIssuesClaimsDto) {
        if (data) {
            this.id = data.id !== undefined && data.id !== null ? data.id : undefined;
            this.claimKey = data.claimKey ?? '';
            this.claimValue = data.claimValue ?? '';
        } else {
            this.id = undefined;
            this.claimKey = '';
            this.claimValue = '';
        }
    }

    static fromJS(data: any): EditIssuesClaimsDto {
        return new EditIssuesClaimsDto({
            id: data?.id !== undefined && data?.id !== null ? data.id : undefined,
            claimKey: data?.claimKey ?? '',
            claimValue: data?.claimValue ?? '',
        });
    }

    toJSON(): any {
        return {
            id: this.id,
            claimKey: this.claimKey,
            claimValue: this.claimValue,
        };
    }
}

export class CreateIssuesClaimsDto implements ICreateIssuesClaimsDto {
    id?: number;
    claimKey: string;
    claimValue: string;

    constructor(data?: ICreateIssuesClaimsDto) {
        if (data) {
            this.id = data.id !== undefined && data.id !== null ? data.id : undefined;
            this.claimKey = data.claimKey ?? '';
            this.claimValue = data.claimValue ?? '';
        } else {
            this.id = undefined;
            this.claimKey = '';
            this.claimValue = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.id = data.id !== undefined && data.id !== null ? data.id : undefined;
            this.claimKey = data.claimKey ?? '';
            this.claimValue = data.claimValue ?? '';
        }
    }

    static fromJS(data: any): CreateIssuesClaimsDto {
        return new CreateIssuesClaimsDto({
            id: data?.id !== undefined && data?.id !== null ? data.id : undefined,
            claimKey: data?.claimKey ?? '',
            claimValue: data?.claimValue ?? '',
        });
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.id = this.id;
        data.claimKey = this.claimKey;
        data.claimValue = this.claimValue;
        return data;
    }
}

export class GetAllIssuesInput implements IGetAllIssuesInput {
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

    constructor(data?: IGetAllIssuesInput) {
        if (data) {
            this.keyword = data.keyword;
            this.title = data.title;
            this.issueCategory = data.issueCategory;
            this.description = data.description;
            this.priorityId = data.priorityId;
            this.issueStatusId = data.issueStatusId;
            this.reportedBy = data.reportedBy;
            this.isResolved = data.isResolved;
            this.deadlineStart = data.deadlineStart ? new Date(data.deadlineStart) : undefined;
            this.deadlineEnd = data.deadlineEnd ? new Date(data.deadlineEnd) : undefined;
            this.resolvedTimeStart = data.resolvedTimeStart ? new Date(data.resolvedTimeStart) : undefined;
            this.resolvedTimeEnd = data.resolvedTimeEnd ? new Date(data.resolvedTimeEnd) : undefined;
            this.tenantId = data.tenantId;
            this.assigneeUserId = data.assigneeUserId;
            this.claimKey = data.claimKey;
            this.claimValue = data.claimValue;
            this.subCategoryId = data.subCategoryId;
            this.subCategoryName = data.subCategoryName;
            this.serviceId = data.serviceId;
            this.serviceName = data.serviceName;
            this.wrongNumber = data.wrongNumber;
            this.rightNumber = data.rightNumber;
            this.terminalNumber = data.terminalNumber;
            this.sum = data.sum;
            this.cancelledSum = data.cancelledSum;
            this.subscriber = data.subscriber;
            this.agentFullName = data.agentFullName;
            this.agentNumber = data.agentNumber;
            this.equipment = data.equipment;
            this.serialNumber = data.serialNumber;
            this.repairIssueDescription = data.repairIssueDescription;
            this.workAmount = data.workAmount;
            this.replacementParts = data.replacementParts;
            this.techTerminalNumber = data.techTerminalNumber;
            this.terminalName = data.terminalName;
            this.agentId = data.agentId;
            this.techAgentNumber = data.techAgentNumber;
            this.techIssueDescription = data.techIssueDescription;
            this.issueGroupId = data.issueGroupId;
            this.issueGroupName = data.issueGroupName;
            this.terminalLocation = data.terminalLocation;
            this.cityId = data.cityId;
            this.cityName = data.cityName;
            this.creationTimeStart = data.creationTimeStart ? new Date(data.creationTimeStart) : undefined;
            this.creationTimeEnd = data.creationTimeEnd ? new Date(data.creationTimeEnd) : undefined;
            this.lastModificationTimeStart = data.lastModificationTimeStart ? new Date(data.lastModificationTimeStart) : undefined;
            this.lastModificationTimeEnd = data.lastModificationTimeEnd ? new Date(data.lastModificationTimeEnd) : undefined;
            this.skipCount = data.skipCount;
            this.maxResultCount = data.maxResultCount;
            this.sorting = data.sorting;
        }
    }

    init(data?: any): void {
        if (data) {
            this.keyword = data.keyword;
            this.title = data.title;
            this.issueCategory = data.issueCategory;
            this.description = data.description;
            this.priorityId = data.priorityId;
            this.issueStatusId = data.issueStatusId;
            this.reportedBy = data.reportedBy;
            this.isResolved = data.isResolved;
            this.deadlineStart = data.deadlineStart ? new Date(data.deadlineStart) : undefined;
            this.deadlineEnd = data.deadlineEnd ? new Date(data.deadlineEnd) : undefined;
            this.resolvedTimeStart = data.resolvedTimeStart ? new Date(data.resolvedTimeStart) : undefined;
            this.resolvedTimeEnd = data.resolvedTimeEnd ? new Date(data.resolvedTimeEnd) : undefined;
            this.tenantId = data.tenantId;
            this.assigneeUserId = data.assigneeUserId;
            this.claimKey = data.claimKey;
            this.claimValue = data.claimValue;
            this.subCategoryId = data.subCategoryId;
            this.subCategoryName = data.subCategoryName;
            this.serviceId = data.serviceId;
            this.serviceName = data.serviceName;
            this.wrongNumber = data.wrongNumber;
            this.rightNumber = data.rightNumber;
            this.terminalNumber = data.terminalNumber;
            this.sum = data.sum;
            this.cancelledSum = data.cancelledSum;
            this.subscriber = data.subscriber;
            this.agentFullName = data.agentFullName;
            this.agentNumber = data.agentNumber;
            this.equipment = data.equipment;
            this.serialNumber = data.serialNumber;
            this.repairIssueDescription = data.repairIssueDescription;
            this.workAmount = data.workAmount;
            this.replacementParts = data.replacementParts;
            this.techTerminalNumber = data.techTerminalNumber;
            this.terminalName = data.terminalName;
            this.agentId = data.agentId;
            this.techAgentNumber = data.techAgentNumber;
            this.techIssueDescription = data.techIssueDescription;
            this.issueGroupId = data.issueGroupId;
            this.issueGroupName = data.issueGroupName;
            this.terminalLocation = data.terminalLocation;
            this.cityId = data.cityId;
            this.cityName = data.cityName;
            this.creationTimeStart = data.creationTimeStart ? new Date(data.creationTimeStart) : undefined;
            this.creationTimeEnd = data.creationTimeEnd ? new Date(data.creationTimeEnd) : undefined;
            this.lastModificationTimeStart = data.lastModificationTimeStart ? new Date(data.lastModificationTimeStart) : undefined;
            this.lastModificationTimeEnd = data.lastModificationTimeEnd ? new Date(data.lastModificationTimeEnd) : undefined;
            this.skipCount = data.skipCount;
            this.maxResultCount = data.maxResultCount;
            this.sorting = data.sorting;
        }
    }

    static fromJS(data: any): GetAllIssuesInput {
        data = typeof data === 'object' ? data : {};
        const result = new GetAllIssuesInput();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data.keyword = this.keyword;
        data.title = this.title;
        data.issueCategory = this.issueCategory;
        data.description = this.description;
        data.priorityId = this.priorityId;
        data.issueStatusId = this.issueStatusId;
        data.reportedBy = this.reportedBy;
        data.isResolved = this.isResolved;
        data.deadlineStart = this.deadlineStart ? this.deadlineStart.toISOString() : undefined;
        data.deadlineEnd = this.deadlineEnd ? this.deadlineEnd.toISOString() : undefined;
        data.resolvedTimeStart = this.resolvedTimeStart ? this.resolvedTimeStart.toISOString() : undefined;
        data.resolvedTimeEnd = this.resolvedTimeEnd ? this.resolvedTimeEnd.toISOString() : undefined;
        data.tenantId = this.tenantId;
        data.assigneeUserId = this.assigneeUserId;
        data.claimKey = this.claimKey;
        data.claimValue = this.claimValue;
        data.subCategoryId = this.subCategoryId;
        data.subCategoryName = this.subCategoryName;
        data.serviceId = this.serviceId;
        data.serviceName = this.serviceName;
        data.wrongNumber = this.wrongNumber;
        data.rightNumber = this.rightNumber;
        data.terminalNumber = this.terminalNumber;
        data.sum = this.sum;
        data.cancelledSum = this.cancelledSum;
        data.subscriber = this.subscriber;
        data.agentFullName = this.agentFullName;
        data.agentNumber = this.agentNumber;
        data.equipment = this.equipment;
        data.serialNumber = this.serialNumber;
        data.repairIssueDescription = this.repairIssueDescription;
        data.workAmount = this.workAmount;
        data.replacementParts = this.replacementParts;
        data.techTerminalNumber = this.techTerminalNumber;
        data.terminalName = this.terminalName;
        data.agentId = this.agentId;
        data.techAgentNumber = this.techAgentNumber;
        data.techIssueDescription = this.techIssueDescription;
        data.issueGroupId = this.issueGroupId;
        data.issueGroupName = this.issueGroupName;
        data.terminalLocation = this.terminalLocation;
        data.cityId = this.cityId;
        data.cityName = this.cityName;
        data.creationTimeStart = this.creationTimeStart ? this.creationTimeStart.toISOString() : undefined;
        data.creationTimeEnd = this.creationTimeEnd ? this.creationTimeEnd.toISOString() : undefined;
        data.lastModificationTimeStart = this.lastModificationTimeStart ? this.lastModificationTimeStart.toISOString() : undefined;
        data.lastModificationTimeEnd = this.lastModificationTimeEnd ? this.lastModificationTimeEnd.toISOString() : undefined;
        data.skipCount = this.skipCount;
        data.maxResultCount = this.maxResultCount;
        data.sorting = this.sorting;
        return data;
    }
}