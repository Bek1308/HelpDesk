export interface IIssuesCommentsDto {
    id: number;
    issueId: number;
    content: string;
    filePath?: string;
    fileName?: string;
    latitude?: number;
    longitude?: number;
    tenantId?: number;
    creatorUserId?: number | null;
    creatorFullName?: string | null;
    creationTime: Date;
    lastModifierUserId?: number | null;
    lastModifierFullName?: string | null;
    lastModificationTime?: Date | null;
    deleterUserId?: number | null;
    deleterFullName?: string | null;
    deletionTime?: Date | null;
    isDeleted: boolean;
}

export interface IIssuesCommentsPagedResultDto {
    items: IIssuesCommentsDto[] | undefined;
    totalCount: number;
}

export interface ICreateIssuesCommentsDto {
    issueId: number;
    content: string;
    latitude?: number;
    longitude?: number;
}

export interface IUpdateIssuesCommentsDto {
    id: number;
    issueId: number;
    content: string;
    latitude?: number;
    longitude?: number;
}