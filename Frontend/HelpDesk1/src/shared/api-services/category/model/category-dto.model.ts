import { ICategoryDto, ICategoryDtoPagedResultDto } from "../interface/category-dto.interface";

export class CategoryDto implements ICategoryDto {
    id: number;
    title: string;
    distance: number;
    score: number;
    price: number;

    constructor(data?: ICategoryDto) {
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
            this.distance = _data["distance"];
            this.score = _data["score"];
            this.price = _data["price"];
        }
    }

    static fromJS(data: any): CategoryDto {
        data = typeof data === 'object' ? data : {};
        let result = new CategoryDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["title"] = this.title;
        data["distance"] = this.distance;
        data["score"] = this.score;
        data["price"] = this.price;
        return data;
    }

    clone(): CategoryDto {
        const json = this.toJSON();
        let result = new CategoryDto();
        result.init(json);
        return result;
    }
}

export class CategoryDtoPagedResultDto implements ICategoryDtoPagedResultDto {
    items: CategoryDto[] | undefined;
    totalCount: number;

    constructor(data?: ICategoryDtoPagedResultDto) {
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
                    this.items.push(CategoryDto.fromJS(item));
            }
            this.totalCount = _data["totalCount"];
        }
    }

    static fromJS(data: any): CategoryDtoPagedResultDto {
        data = typeof data === 'object' ? data : {};
        let result = new CategoryDtoPagedResultDto();
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

    clone(): CategoryDtoPagedResultDto {
        const json = this.toJSON();
        let result = new CategoryDtoPagedResultDto();
        result.init(json);
        return result;
    }
}

export class CreateCategoryDto implements CreateCategoryDto {
    title: string;
    distance: number;
    score: number;
    price: number;
    grantedPermissions: string[];

    constructor(data?: any) {
        if (data) {
            this.title = data.title;
            this.distance = data.distance;
            this.score = data.score;
            this.price = data.price;
            this.grantedPermissions = data.grantedPermissions || [];
        } else {
            this.title = '';
            this.distance = 0;
            this.score = 0;
            this.price = 0;
            this.grantedPermissions = [];
        }
    }

    init(data?: any): void {
        if (data) {
            this.title = data.title;
            this.distance = data.distance;
            this.score = data.score;
            this.price = data.price;
            this.grantedPermissions = data.grantedPermissions || [];
        }
    }
}