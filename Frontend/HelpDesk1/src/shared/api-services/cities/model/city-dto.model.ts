import { ICityDto, ICityEditDto, ICreateCityInput, IUpdateCityInput, ICityPagedResultDto } from '../interface/city-dto.interface';

export class CityDto implements ICityDto {
    id: number;
    name: string;
    distance: number;
    score: number;
    price?: number;
    tenantId?: number;

    constructor(data?: ICityDto) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data['id'];
            this.name = _data['name'];
            this.distance = _data['distance'];
            this.score = _data['score'];
            this.price = _data['price'];
            this.tenantId = _data['tenantId'];
        }
    }

    static fromJS(data: any): CityDto {
        data = typeof data === 'object' ? data : {};
        const result = new CityDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['id'] = this.id;
        data['name'] = this.name;
        data['distance'] = this.distance;
        data['score'] = this.score;
        data['price'] = this.price;
        data['tenantId'] = this.tenantId;
        return data;
    }

    clone(): CityDto {
        const json = this.toJSON();
        const result = new CityDto();
        result.init(json);
        return result;
    }
}

export class CityEditDto implements ICityEditDto {
    id: number;
    name: string;
    distance: number;
    score: number;
    price?: number;

    constructor(data?: ICityEditDto) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data['id'];
            this.name = _data['name'];
            this.distance = _data['distance'];
            this.score = _data['score'];
            this.price = _data['price'];
        }
    }

    static fromJS(data: any): CityEditDto {
        data = typeof data === 'object' ? data : {};
        const result = new CityEditDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['id'] = this.id;
        data['name'] = this.name;
        data['distance'] = this.distance;
        data['score'] = this.score;
        data['price'] = this.price;
        return data;
    }

    clone(): CityEditDto {
        const json = this.toJSON();
        const result = new CityEditDto();
        result.init(json);
        return result;
    }
}

export class CreateCityInput implements ICreateCityInput {
    name: string;
    distance: number;
    score: number;
    price?: number;

    constructor(data?: ICreateCityInput) {
        if (data) {
            this.name = data.name;
            this.distance = data.distance;
            this.score = data.score;
            this.price = data.price;
        } else {
            this.name = '';
            this.distance = 0;
            this.score = 0;
            this.price = undefined;
        }
    }

    init(data?: any): void {
        if (data) {
            this.name = data.name;
            this.distance = data.distance;
            this.score = data.score;
            this.price = data.price;
        }
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['name'] = this.name;
        data['distance'] = this.distance;
        data['score'] = this.score;
        data['price'] = this.price;
        return data;
    }
}

export class UpdateCityInput implements IUpdateCityInput {
    id: number;
    name: string;
    distance: number;
    score: number;
    price?: number;

    constructor(data?: IUpdateCityInput) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data['id'];
            this.name = _data['name'];
            this.distance = _data['distance'];
            this.score = _data['score'];
            this.price = _data['price'];
        }
    }

    static fromJS(data: any): UpdateCityInput {
        data = typeof data === 'object' ? data : {};
        const result = new UpdateCityInput();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['id'] = this.id;
        data['name'] = this.name;
        data['distance'] = this.distance;
        data['score'] = this.score;
        data['price'] = this.price;
        return data;
    }

    clone(): UpdateCityInput {
        const json = this.toJSON();
        const result = new UpdateCityInput();
        result.init(json);
        return result;
    }
}

export class CityPagedResultDto implements ICityPagedResultDto {
    items: CityDto[] | undefined;
    totalCount: number;

    constructor(data?: ICityPagedResultDto) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            if (Array.isArray(_data['items'])) {
                this.items = [] as any;
                for (const item of _data['items']) {
                    this.items.push(CityDto.fromJS(item));
                }
            }
            this.totalCount = _data['totalCount'];
        }
    }

    static fromJS(data: any): CityPagedResultDto {
        data = typeof data === 'object' ? data : {};
        const result = new CityPagedResultDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
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

    clone(): CityPagedResultDto {
        const json = this.toJSON();
        const result = new CityPagedResultDto();
        result.init(json);
        return result;
    }
}