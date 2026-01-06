import { ICallCenterIssuesDto, ICallCenterIssuesDtoPagedResultDto, ICreateCallCenterIssuesDto } from "../interface/call-center-issues-dto.interface";

export class CallCenterIssuesDto implements ICallCenterIssuesDto {
    id: number;
    subCategoryId: number;
    subCategoryName: string;
    serviceId: number;
    serviceName: string;
    wrongNumber: number;
    rightNumber: number;
    terminalNumber: string;
    sum: string;
    cancelledSum: string;
    subscriber: string;
    statusId: number;
    statusName: string;
    creationTime: Date;
    createdBy: number;
    creatorName: string;
    updatedAt: Date;
    updatedBy: number;
    updaterName: string;

    constructor(data?: ICallCenterIssuesDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.subCategoryId = _data["subCategoryId"];
            this.subCategoryName = _data["subCategoryName"];
            this.serviceId = _data["serviceId"];
            this.serviceName = _data["serviceName"];
            this.wrongNumber = _data["wrongNumber"];
            this.rightNumber = _data["rightNumber"];
            this.terminalNumber = _data["terminalNumber"];
            this.sum = _data["sum"];
            this.cancelledSum = _data["cancelledSum"];
            this.subscriber = _data["subscriber"];
            this.statusId = _data["statusId"];
            this.statusName = _data["statusName"];
            this.creationTime = _data["creationTime"] ? new Date(_data["creationTime"]) : _data["creationTime"];
            this.createdBy = _data["createdBy"];
            this.creatorName = _data["creatorName"];
            this.updatedAt = _data["updatedAt"] ? new Date(_data["updatedAt"]) : _data["updatedAt"];
            this.updatedBy = _data["updatedBy"];
            this.updaterName = _data["updaterName"];
        }
    }

    static fromJS(data: any): CallCenterIssuesDto {
        data = typeof data === 'object' ? data : {};
        let result = new CallCenterIssuesDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["subCategoryId"] = this.subCategoryId;
        data["subCategoryName"] = this.subCategoryName;
        data["serviceId"] = this.serviceId;
        data["serviceName"] = this.serviceName;
        data["wrongNumber"] = this.wrongNumber;
        data["rightNumber"] = this.rightNumber;
        data["terminalNumber"] = this.terminalNumber;
        data["sum"] = this.sum;
        data["cancelledSum"] = this.cancelledSum;
        data["subscriber"] = this.subscriber;
        data["statusId"] = this.statusId;
        data["statusName"] = this.statusName;
        data["creationTime"] = this.creationTime ? this.creationTime.toISOString() : undefined;
        data["createdBy"] = this.createdBy;
        data["creatorName"] = this.creatorName;
        data["updatedAt"] = this.updatedAt ? this.updatedAt.toISOString() : undefined;
        data["updatedBy"] = this.updatedBy;
        data["updaterName"] = this.updaterName;
        return data;
    }

    clone(): CallCenterIssuesDto {
        const json = this.toJSON();
        let result = new CallCenterIssuesDto();
        result.init(json);
        return result;
    }
}

export class CallCenterIssuesDtoPagedResultDto implements ICallCenterIssuesDtoPagedResultDto {
    items: CallCenterIssuesDto[] | undefined;
    totalCount: number;

    constructor(data?: ICallCenterIssuesDtoPagedResultDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            if (Array.isArray(_data["items"])) {
                this.items = [] as any;
                for (let item of _data["items"])
                    this.items.push(CallCenterIssuesDto.fromJS(item));
            }
            this.totalCount = _data["totalCount"];
        }
    }

    static fromJS(data: any): CallCenterIssuesDtoPagedResultDto {
        data = typeof data === 'object' ? data : {};
        let result = new CallCenterIssuesDtoPagedResultDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        if (Array.isArray(this.items)) {
            data["items"] = [];
            for (let item of this.items)
                data["items"].push(item.toJSON());
        }
        data["totalCount"] = this.totalCount;
        return data;
    }

    clone(): CallCenterIssuesDtoPagedResultDto {
        const json = this.toJSON();
        let result = new CallCenterIssuesDtoPagedResultDto();
        result.init(json);
        return result;
    }
}

export class CreateCallCenterIssuesDto implements ICreateCallCenterIssuesDto {
    subCategoryId: number;
    serviceId: number;
    wrongNumber: string;
    rightNumber: string;
    terminalNumber: string;
    sum: string;
    cancelledSum: string;
    subscriber: string;
    statusId: number;

    constructor(data?: any) {
        if (data) {
            this.subCategoryId = data.subCategoryId;
            this.serviceId = data.serviceId;
            this.wrongNumber = data.wrongNumber;
            this.rightNumber = data.rightNumber;
            this.terminalNumber = data.terminalNumber;
            this.sum = data.sum;
            this.cancelledSum = data.cancelledSum;
            this.subscriber = data.subscriber;
            this.statusId = data.statusId;
        } else {
            this.subCategoryId = 0;
            this.serviceId = 0;
            this.wrongNumber = '0';
            this.rightNumber = '0';
            this.terminalNumber = '';
            this.sum = '';
            this.cancelledSum = '';
            this.subscriber = '';
            this.statusId = 0;
        }
    }

    init(data?: any): void {
        if (data) {
            this.subCategoryId = data.subCategoryId;
            this.serviceId = data.serviceId;
            this.wrongNumber = data.wrongNumber;
            this.rightNumber = data.rightNumber;
            this.terminalNumber = data.terminalNumber;
            this.sum = data.sum;
            this.cancelledSum = data.cancelledSum;
            this.subscriber = data.subscriber;
            this.statusId = data.statusId;
        }
    }
}