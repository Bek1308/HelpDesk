export interface IIssuesTypeDto {
    id: number;
    title: string;
    titleRu: string;
    description: string;
    descriptionRu: string;
}

export interface IIssuesTypeDtoPagedResultDto {
    items: IIssuesTypeDto[] | undefined;
    totalCount: number;
}

export interface ICreateIssuesTypeDto {
    title: string;
    titleRu: string;
    description: string;
    descriptionRu: string;
}
