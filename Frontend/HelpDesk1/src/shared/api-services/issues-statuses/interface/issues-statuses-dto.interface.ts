export interface IIssuesStatusesDto {
    id: number;
    title: string;
    titleRu: string;
}

export interface IIssuesStatusesPagedResultDto {
    items: IIssuesStatusesDto[];
    totalCount: number;
}

export interface IIssuesStatusesInputDto {
    id?: number; // Update uchun id kerak, Create uchun ixtiyoriy
    title: string;
    titleRu: string;
}