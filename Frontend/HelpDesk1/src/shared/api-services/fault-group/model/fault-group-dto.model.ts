import { IFaultGroupDto, IFaultGroupDtoPagedResultDto } from "../interface/fault-group-dto.interface";

export class FaultGroupDto implements IFaultGroupDto {
    id: number;
    title: string;

    constructor(data?: IFaultGroupDto) {
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
        }
    }

    static fromJS(data: any): FaultGroupDto {
        data = typeof data === 'object' ? data : {};
        let result = new FaultGroupDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["title"] = this.title;
        return data;
    }

    clone(): FaultGroupDto {
        const json = this.toJSON();
        let result = new FaultGroupDto();
        result.init(json);
        return result;
    }
}

export class FaultGroupDtoPagedResultDto implements IFaultGroupDtoPagedResultDto {
    items: FaultGroupDto[] | undefined;
    totalCount: number;

    constructor(data?: IFaultGroupDtoPagedResultDto) {
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
                    this.items.push(FaultGroupDto.fromJS(item));
            }
            this.totalCount = _data["totalCount"];
        }
    }

    static fromJS(data: any): FaultGroupDtoPagedResultDto {
        data = typeof data === 'object' ? data : {};
        let result = new FaultGroupDtoPagedResultDto();
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

    clone(): FaultGroupDtoPagedResultDto {
        const json = this.toJSON();
        let result = new FaultGroupDtoPagedResultDto();
        result.init(json);
        return result;
    }
}

export class CreateFaultGroupDto implements CreateFaultGroupDto {
    title: string;

    constructor(data?: any) {
        if (data) {
            this.title = data.title;
        } else {
            this.title = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.title = data.title;
        }
    }
}