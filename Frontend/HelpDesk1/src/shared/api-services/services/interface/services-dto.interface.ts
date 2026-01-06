export interface IServiceDto {
    id: number;
    name: string;
}

export interface IServiceDtoPagedResultDto {
    items: IServiceDto[] | undefined;
    totalCount: number;
}

export interface ICreateServiceDto {
    name: string;
}
