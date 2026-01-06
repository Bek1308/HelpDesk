import { IIssuesHistoryDto } from '../interface/issues-history-dto.interface';
export class IssuesHistoryDto implements IIssuesHistoryDto {
    id: number;
    issueId: number;
    fieldName?: string;
    creationTime: Date;
    createdBy: number;
    creatorName?: string;
    originalValue?: string;
    newValue?: string;
    description?: string;
    localizedDescription?: string;

    constructor(data?: IIssuesHistoryDto) {
        if (data) {
            this.id = data.id;
            this.issueId = data.issueId;
            this.fieldName = data.fieldName;
            this.creationTime = data.creationTime ? new Date(data.creationTime) : new Date();
            this.createdBy = data.createdBy;
            this.creatorName = data.creatorName;
            this.originalValue = data.originalValue;
            this.newValue = data.newValue;
            this.description = data.description;
            this.localizedDescription = data.localizedDescription;
        } else {
            this.id = 0;
            this.issueId = 0;
            this.creationTime = new Date();
            this.createdBy = 0;
        }
    }

    static fromJS(data: any): IssuesHistoryDto {
        data = typeof data === 'object' ? data : {};
        const result = new IssuesHistoryDto();
        result.init(data);
        return result;
    }

    init(_data?: any): void {
        if (_data) {
            this.id = _data['id'] || _data['Id'] || 0;
            this.issueId = _data['issueId'] || _data['IssueId'] || 0;
            this.fieldName = _data['fieldName'] || _data['FieldName'];
            this.creationTime = _data['creationTime'] || _data['CreationTime'] ? new Date(_data['creationTime'] || _data['CreationTime']) : new Date();
            this.createdBy = _data['createdBy'] || _data['CreatedBy'] || 0;
            this.creatorName = _data['creatorName'] || _data['CreatorName'];
            this.originalValue = _data['originalValue'] || _data['OriginalValue'];
            this.newValue = _data['newValue'] || _data['NewValue'];
            this.description = _data['description'] || _data['Description'];
            this.localizedDescription = _data['localizedDescription'] || _data['LocalizedDescription'];
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['id'] = this.id;
        data['issueId'] = this.issueId;
        data['fieldName'] = this.fieldName;
        data['creationTime'] = this.creationTime ? this.creationTime.toISOString() : undefined;
        data['createdBy'] = this.createdBy;
        data['creatorName'] = this.creatorName;
        data['originalValue'] = this.originalValue;
        data['newValue'] = this.newValue;
        data['description'] = this.description;
        data['localizedDescription'] = this.localizedDescription;
        return data;
    }
}


export class GetHistoryByIssueInput {
    issueId: number;
    skipCount?: number;
    maxResultCount?: number;
    sorting?: string;

    constructor(data?: Partial<GetHistoryByIssueInput>) {
        if (data) {
            this.issueId = data.issueId || 0;
            this.skipCount = data.skipCount;
            this.maxResultCount = data.maxResultCount;
            this.sorting = data.sorting;
        } else {
            this.issueId = 0;
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['IssueId'] = this.issueId;
        data['SkipCount'] = this.skipCount;
        data['MaxResultCount'] = this.maxResultCount;
        data['Sorting'] = this.sorting;
        return data;
    }
}

export class PagedResultDto<T> {
    totalCount: number;
    items: T[];

    constructor(data?: Partial<PagedResultDto<T>>) {
        if (data) {
            this.totalCount = data.totalCount || 0;
            this.items = data.items || [];
        } else {
            this.totalCount = 0;
            this.items = [];
        }
    }

    static fromJS<T>(data: any, fromJS: (data: any) => T): PagedResultDto<T> {
        data = typeof data === 'object' ? data : {};
        const result = new PagedResultDto<T>();
        result.init(data, fromJS);
        return result;
    }

    init(_data?: any, fromJS?: (data: any) => T): void {
        if (_data) {
            this.totalCount = _data['totalCount'] || _data['TotalCount'] || 0;
            this.items = _data['items'] || _data['Items'] ? (_data['items'] || _data['Items']).map((item: any) => fromJS ? fromJS(item) : item) : [];
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['totalCount'] = this.totalCount;
        data['items'] = this.items ? this.items.map(item => (item as any).toJSON ? (item as any).toJSON() : item) : [];
        return data;
    }
}