import { ICreateServiceDto, IServiceDto, IServiceDtoPagedResultDto} from "../interface/services-dto.interface";

export class ServiceDto implements IServiceDto {
    id: number;
    name: string;

    constructor(data?: IServiceDto) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
        }
    }

    static fromJS(data: any): ServiceDto {
        data = typeof data === 'object' ? data : {};
        let result = new ServiceDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        return data;
    }

    clone(): ServiceDto {
        const json = this.toJSON();
        let result = new ServiceDto();
        result.init(json);
        return result;
    }
}

export class ServiceDtoPagedResultDto implements IServiceDtoPagedResultDto {
    items: ServiceDto[] | undefined;
    totalCount: number;

    constructor(data?: IServiceDtoPagedResultDto) {
        if (data) {
            for (const property in data) {
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
                    this.items.push(ServiceDto.fromJS(item));
            }
            this.totalCount = _data["totalCount"];
        }
    }

    static fromJS(data: any): ServiceDtoPagedResultDto {
        data = typeof data === 'object' ? data : {};
        let result = new ServiceDtoPagedResultDto();
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

    clone(): ServiceDtoPagedResultDto {
        const json = this.toJSON();
        let result = new ServiceDtoPagedResultDto();
        result.init(json);
        return result;
    }
}

export class CreateServiceDto implements ICreateServiceDto {
    name: string;

    constructor(data?: any) {
        if (data) {
            this.name = data.name || '';
        } else {
            this.name = '';
        }
    }

    init(data?: any): void {
        if (data) {
            this.name = data.name || '';
        }
    }
}