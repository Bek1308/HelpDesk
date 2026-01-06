import { IIssuesStatusesDto, IIssuesStatusesPagedResultDto, IIssuesStatusesInputDto } from '../interface/issues-statuses-dto.interface';

export class IssuesStatusesDto implements IIssuesStatusesDto {
    id: number;
    title: string;
    titleRu: string;

    constructor(data?: IIssuesStatusesDto) {
        if (data) {
            this.id = data.id;
            this.title = data.title;
            this.titleRu = data.titleRu;
        } else {
            this.id = 0;
            this.title = '';
            this.titleRu = '';
        }
    }

    init(data?: any) {
        if (data) {
            this.id = data["id"] ?? 0;
            this.title = data["title"] ?? '';
            this.titleRu = data["titleRu"] ?? '';
        }
    }

    static fromJS(data: any): IssuesStatusesDto {
        data = typeof data === 'object' ? data : {};
        let result = new IssuesStatusesDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["title"] = this.title;
        data["titleRu"] = this.titleRu;
        return data;
    }

    clone(): IssuesStatusesDto {
        const json = this.toJSON();
        let result = new IssuesStatusesDto();
        result.init(json);
        return result;
    }
}

export class IssuesStatusesPagedResultDto implements IIssuesStatusesPagedResultDto {
    items: IssuesStatusesDto[];
    totalCount: number;

    constructor(data?: IIssuesStatusesPagedResultDto) {
        if (data) {
            this.items = data.items ? data.items.map(item => new IssuesStatusesDto(item)) : [];
            this.totalCount = data.totalCount;
        } else {
            this.items = [];
            this.totalCount = 0;
        }
    }

    init(data?: any) {
        if (data) {
            if (Array.isArray(data["items"])) {
                this.items = data["items"].map((item: any) => IssuesStatusesDto.fromJS(item));
            } else {
                this.items = [];
            }
            this.totalCount = data["totalCount"] ?? 0;
        }
    }

    static fromJS(data: any): IssuesStatusesPagedResultDto {
        data = typeof data === 'object' ? data : {};
        let result = new IssuesStatusesPagedResultDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["items"] = this.items ? this.items.map(item => item.toJSON()) : [];
        data["totalCount"] = this.totalCount;
        return data;
    }

    clone(): IssuesStatusesPagedResultDto {
        const json = this.toJSON();
        let result = new IssuesStatusesPagedResultDto();
        result.init(json);
        return result;
    }
}

export class IssuesStatusesInputDto implements IIssuesStatusesInputDto {
    id?: number;
    title: string;
    titleRu: string;

    constructor(data?: IIssuesStatusesInputDto) {
        if (data) {
            this.id = data.id;
            this.title = data.title ?? '';
            this.titleRu = data.titleRu ?? '';
        } else {
            this.id = undefined;
            this.title = '';
            this.titleRu = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.id = data["id"];
            this.title = data["title"] ?? '';
            this.titleRu = data["titleRu"] ?? '';
        }
    }

    static fromJS(data: any): IssuesStatusesInputDto {
        data = typeof data === 'object' ? data : {};
        let result = new IssuesStatusesInputDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        if (this.id !== undefined) {
            data["id"] = this.id;
        }
        data["title"] = this.title;
        data["titleRu"] = this.titleRu;
        return data;
    }

    clone(): IssuesStatusesInputDto {
        const json = this.toJSON();
        let result = new IssuesStatusesInputDto();
        result.init(json);
        return result;
    }
}