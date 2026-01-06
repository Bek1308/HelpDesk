export interface ICityDto {
    id: number;
    name: string;
    distance: number;
    score: number;
    price?: number;
    tenantId?: number;
}

export interface ICityEditDto {
    id: number;
    name: string;
    distance: number;
    score: number;
    price?: number;
}

export interface ICreateCityInput {
    name: string;
    distance: number;
    score: number;
    price?: number;
}

export interface IUpdateCityInput {
    id: number;
    name: string;
    distance: number;
    score: number;
    price?: number;
}

export interface IGetAllCityInput {
    keyword?: string;
    sorting?: string;
    skipCount?: number;
    maxResultCount?: number;
}

export interface ICityPagedResultDto {
    items: ICityDto[] | undefined;
    totalCount: number;
}