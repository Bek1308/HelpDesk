import { IIssuesCommentsDto, IIssuesCommentsPagedResultDto, ICreateIssuesCommentsDto, IUpdateIssuesCommentsDto } from '../interface/issues-comments-dto.interface';

export class IssuesCommentsDto implements IIssuesCommentsDto {
    id: number;
    issueId: number;
    content: string;
    filePath?: string;
    fileName?: string;
    latitude?: number;
    longitude?: number;
    tenantId?: number;
    creatorUserId?: number | null;
    creatorFullName?: string | null;
    creationTime: Date;
    lastModifierUserId?: number | null;
    lastModifierFullName?: string | null;
    lastModificationTime?: Date | null;
    deleterUserId?: number | null;
    deleterFullName?: string | null;
    deletionTime?: Date | null;
    isDeleted: boolean;

    constructor(data?: IIssuesCommentsDto) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        } else {
            this.creationTime = new Date();
            this.isDeleted = false;
        }
    }

    init(_data?: any): void {
        if (_data) {
            this.id = _data['id'];
            this.issueId = _data['issueId'];
            this.content = _data['content'];
            this.filePath = _data['filePath'];
            this.fileName = _data['fileName'];
            this.latitude = _data['latitude'];
            this.longitude = _data['longitude'];
            this.tenantId = _data['tenantId'];
            this.creatorUserId = _data['creatorUserId'];
            this.creatorFullName = _data['creatorFullName'];
            this.creationTime = _data['creationTime'] ? new Date(_data['creationTime']) : new Date();
            this.lastModifierUserId = _data['lastModifierUserId'];
            this.lastModifierFullName = _data['lastModifierFullName'];
            this.lastModificationTime = _data['lastModificationTime'] ? new Date(_data['lastModificationTime']) : undefined;
            this.deleterUserId = _data['deleterUserId'];
            this.deleterFullName = _data['deleterFullName'];
            this.deletionTime = _data['deletionTime'] ? new Date(_data['deletionTime']) : undefined;
            this.isDeleted = _data['isDeleted'] ?? false;
        }
    }

    static fromJS(data: any): IssuesCommentsDto {
        data = typeof data === 'object' ? data : {};
        const result = new IssuesCommentsDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any): any {
        data = typeof data === 'object' ? data : {};
        data['id'] = this.id;
        data['issueId'] = this.issueId;
        data['content'] = this.content;
        data['filePath'] = this.filePath;
        data['fileName'] = this.fileName;
        data['latitude'] = this.latitude;
        data['longitude'] = this.longitude;
        data['tenantId'] = this.tenantId;
        data['creatorUserId'] = this.creatorUserId;
        data['creatorFullName'] = this.creatorFullName;
        data['creationTime'] = this.creationTime ? this.creationTime.toISOString() : undefined;
        data['lastModifierUserId'] = this.lastModifierUserId;
        data['lastModifierFullName'] = this.lastModifierFullName;
        data['lastModificationTime'] = this.lastModificationTime ? this.lastModificationTime.toISOString() : undefined;
        data['deleterUserId'] = this.deleterUserId;
        data['deleterFullName'] = this.deleterFullName;
        data['deletionTime'] = this.deletionTime ? this.deletionTime.toISOString() : undefined;
        data['isDeleted'] = this.isDeleted;
        return data;
    }

    clone(): IssuesCommentsDto {
        const json = this.toJSON();
        const result = new IssuesCommentsDto();
        result.init(json);
        return result;
    }
}

export class IssuesCommentsPagedResultDto implements IIssuesCommentsPagedResultDto {
    items: IssuesCommentsDto[] | undefined;
    totalCount: number;

    constructor(data?: IIssuesCommentsPagedResultDto) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        } else {
            this.totalCount = 0;
        }
    }

    init(_data?: any): void {
        if (_data) {
            if (Array.isArray(_data['items'])) {
                this.items = [] as any;
                for (const item of _data['items']) {
                    this.items.push(IssuesCommentsDto.fromJS(item));
                }
            }
            this.totalCount = _data['totalCount'] ?? 0;
        }
    }

    static fromJS(data: any): IssuesCommentsPagedResultDto {
        data = typeof data === 'object' ? data : {};
        const result = new IssuesCommentsPagedResultDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any): any {
        data = typeof data === 'object' ? data : {};
        if (Array.isArray(this.items)) {
            data['items'] = [];
            for (const item of this.items) {
                data['items'].push(item.toJSON());
            }
        }
        data['totalCount'] = this.totalCount;
        return data;
    }

    clone(): IssuesCommentsPagedResultDto {
        const json = this.toJSON();
        const result = new IssuesCommentsPagedResultDto();
        result.init(json);
        return result;
    }
}

export class CreateIssuesCommentsDto implements ICreateIssuesCommentsDto {
    issueId: number;
    content: string;
    latitude?: number;
    longitude?: number;

    constructor(data?: ICreateIssuesCommentsDto) {
        if (data) {
            this.issueId = data.issueId;
            this.content = data.content;
            this.latitude = data.latitude;
            this.longitude = data.longitude;
        } else {
            this.issueId = 0;
            this.content = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.issueId = data.issueId;
            this.content = data.content;
            this.latitude = data.latitude;
            this.longitude = data.longitude;
        }
    }
}

export class UpdateIssuesCommentsDto implements IUpdateIssuesCommentsDto {
    id: number;
    issueId: number;
    content: string;
    latitude?: number;
    longitude?: number;

    constructor(data?: IUpdateIssuesCommentsDto) {
        if (data) {
            this.id = data.id;
            this.issueId = data.issueId;
            this.content = data.content;
            this.latitude = data.latitude;
            this.longitude = data.longitude;
        } else {
            this.id = 0;
            this.issueId = 0;
            this.content = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.id = data.id;
            this.issueId = data.issueId;
            this.content = data.content;
            this.latitude = data.latitude;
            this.longitude = data.longitude;
        }
    }
}