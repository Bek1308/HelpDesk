export interface ICategoryDto {
    id: number;
    title: string;
    distance: number;
    score: number;
    price: number;
}

export interface ICategoryDtoPagedResultDto {
    items: ICategoryDto[] | undefined;
    totalCount: number;
}

export interface CreateCategoryDto {
    title: string;
    distance: number;
    score: number;
    price: number;
}
