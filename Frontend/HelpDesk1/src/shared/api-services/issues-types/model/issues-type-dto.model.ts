// File: issues-type-dto.model.ts
import { IIssuesTypeDto, IIssuesTypeDtoPagedResultDto, ICreateIssuesTypeDto } from "../interface/issues-type-dto.interface";

export class IssuesTypeDto implements IIssuesTypeDto {
    id: number;
    title: string;
    titleRu: string;
    description: string;
    descriptionRu: string;

    constructor(data?: IIssuesTypeDto) {
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
            this.title = _data["title"];
            this.titleRu = _data["titleRu"];
            this.description = _data["description"];
            this.descriptionRu = _data["descriptionRu"];
        }
    }

    static fromJS(data: any): IssuesTypeDto {
        data = typeof data === 'object' ? data : {};
        let result = new IssuesTypeDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["title"] = this.title;
        data["titleRu"] = this.titleRu;
        data["description"] = this.description;
        data["descriptionRu"] = this.descriptionRu;
        return data;
    }

    clone(): IssuesTypeDto {
        const json = this.toJSON();
        let result = new IssuesTypeDto();
        result.init(json);
        return result;
    }
}

export class IssuesTypeDtoPagedResultDto implements IIssuesTypeDtoPagedResultDto {
    items: IssuesTypeDto[] | undefined;
    totalCount: number;

    constructor(data?: IIssuesTypeDtoPagedResultDto) {
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
                    this.items.push(IssuesTypeDto.fromJS(item));
            }
            this.totalCount = _data["totalCount"];
        }
    }

    static fromJS(data: any): IssuesTypeDtoPagedResultDto {
        data = typeof data === 'object' ? data : {};
        let result = new IssuesTypeDtoPagedResultDto();
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

    clone(): IssuesTypeDtoPagedResultDto {
        const json = this.toJSON();
        let result = new IssuesTypeDtoPagedResultDto();
        result.init(json);
        return result;
    }
}

export class CreateIssuesTypeDto implements ICreateIssuesTypeDto {
    title: string;
    titleRu: string;
    description: string;
    descriptionRu: string;

    constructor(data?: any) {
        if (data) {
            this.title = data.title;
            this.titleRu = data.titleRu;
            this.description = data.description;
            this.descriptionRu = data.descriptionRu;
        } else {
            this.title = '';
            this.titleRu = '';
            this.description = '';
            this.descriptionRu = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.title = data.title;
            this.titleRu = data.titleRu;
            this.description = data.description;
            this.descriptionRu = data.descriptionRu;
        }
    }
}