export interface IFaultGroupDto {
    id: number;
    title: string;
}

export interface IFaultGroupDtoPagedResultDto {
    items: IFaultGroupDto[] | undefined;
    totalCount: number;
}

export interface CreateFaultGroupDto {
    title: string;
}