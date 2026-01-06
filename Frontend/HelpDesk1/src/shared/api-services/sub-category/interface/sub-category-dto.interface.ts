export interface ISubCategoryDto {
    id: number;
    title: string;
    categoryId: number;
    categoryName?: string;
}

export interface ISubCategoryDtoPagedResultDto {
    items: ISubCategoryDto[] | undefined;
    totalCount: number;
}


export interface ICreateSubCategoryDto {
    title: string;
    categoryId: number;
}