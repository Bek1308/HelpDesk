import { IPriorityLevelDto, IPriorityLevelPagedResultDto, ICreatePriorityLevelDto } from '../interface/priority-level-dto.interface';

export class PriorityLevelDto implements IPriorityLevelDto {
    id: number;
    title: string;
    percentage: number;

    constructor(data?: IPriorityLevelDto) {
        if (data) {
            this.id = data.id;
            this.title = data.title;
            this.percentage = data.percentage;
        } else {
            this.id = 0;
            this.title = '';
            this.percentage = 0;
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"] ?? 0;
            this.title = _data["title"] ?? '';
            this.percentage = _data["percentage"] ?? 0;
        }
    }

    static fromJS(data: any): PriorityLevelDto {
        data = typeof data === 'object' ? data : {};
        let result = new PriorityLevelDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["title"] = this.title;
        data["percentage"] = this.percentage;
        return data;
    }

    clone(): PriorityLevelDto {
        const json = this.toJSON();
        let result = new PriorityLevelDto();
        result.init(json);
        return result;
    }
}

export class PriorityLevelPagedResultDto implements IPriorityLevelPagedResultDto {
    items: PriorityLevelDto[] | undefined;
    totalCount: number;

    constructor(data?: IPriorityLevelPagedResultDto) {
        if (data) {
            this.items = data.items ? data.items.map(item => new PriorityLevelDto(item)) : undefined;
            this.totalCount = data.totalCount;
        } else {
            this.items = [];
            this.totalCount = 0;
        }
    }

    init(_data?: any) {
        if (_data) {
            if (Array.isArray(_data["items"])) {
                this.items = _data["items"].map((item: any) => PriorityLevelDto.fromJS(item));
            } else {
                this.items = undefined;
            }
            this.totalCount = _data["totalCount"] ?? 0;
        }
    }

    static fromJS(data: any): PriorityLevelPagedResultDto {
        data = typeof data === 'object' ? data : {};
        let result = new PriorityLevelPagedResultDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        if (Array.isArray(this.items)) {
            data["items"] = this.items.map(item => item.toJSON());
        } else {
            data["items"] = undefined;
        }
        data["totalCount"] = this.totalCount;
        return data;
    }

    clone(): PriorityLevelPagedResultDto {
        const json = this.toJSON();
        let result = new PriorityLevelPagedResultDto();
        result.init(json);
        return result;
    }
}

export class CreatePriorityLevelDto implements ICreatePriorityLevelDto {
    title: string;
    percentage: number;

    constructor(data?: any) {
        if (data) {
            this.title = data.title ?? '';
            this.percentage = data.percentage ?? 0;
        } else {
            this.title = '';
            this.percentage = 0;
        }
    }

    init(data?: any): void {
        if (data) {
            this.title = data.title ?? '';
            this.percentage = data.percentage ?? 0;
        }
    }
}