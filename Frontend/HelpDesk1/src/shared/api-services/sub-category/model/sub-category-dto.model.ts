import { ICreateSubCategoryDto, ISubCategoryDto, ISubCategoryDtoPagedResultDto} from "../interface/sub-category-dto.interface";

export class SubCategoryDto implements ISubCategoryDto {
    id: number;
    title: string;
    categoryId: number;
    categoryName?: string;

    constructor(data?: ISubCategoryDto) {
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
            this.id = _data["id"];
            this.title = _data["title"];
            this.categoryId = _data["categoryId"];
            this.categoryName = _data["categoryName"];
        }
    }

    static fromJS(data: any): SubCategoryDto {
        data = typeof data === 'object' ? data : {};
        const result = new SubCategoryDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["title"] = this.title;
        data["categoryId"] = this.categoryId;
        data["categoryName"] = this.categoryName;
        return data;
    }

    clone(): SubCategoryDto {
        const json = this.toJSON();
        const result = new SubCategoryDto();
        result.init(json);
        return result;
    }
}

export class SubCategoryDtoPagedResultDto implements ISubCategoryDtoPagedResultDto {
    items: SubCategoryDto[] | undefined;
    totalCount: number;

    constructor(data?: ISubCategoryDtoPagedResultDto) {
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
            if (Array.isArray(_data["items"])) {
                this.items = [];
                for (const item of _data["items"]) {
                    this.items.push(SubCategoryDto.fromJS(item));
                }
            }
            this.totalCount = _data["totalCount"];
        }
    }

    static fromJS(data: any): SubCategoryDtoPagedResultDto {
        data = typeof data === 'object' ? data : {};
        const result = new SubCategoryDtoPagedResultDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        if (Array.isArray(this.items)) {
            data["items"] = [];
            for (const item of this.items) {
                data["items"].push(item.toJSON());
            }
        }
        data["totalCount"] = this.totalCount;
        return data;
    }

    clone(): SubCategoryDtoPagedResultDto {
        const json = this.toJSON();
        const result = new SubCategoryDtoPagedResultDto();
        result.init(json);
        return result;
    }
}

export class CreateSubCategoryDto implements ICreateSubCategoryDto {
    title: string;
    categoryId: number;

    constructor(data?: any) {
        if (data) {
            this.title = data.title;
            this.categoryId = data.categoryId;
        } else {
            this.title = '';
            this.categoryId = 0;
        }
    }

    init(data?: any): void {
        if (data) {
            this.title = data.title;
            this.categoryId = data.categoryId;
        }
    }
}