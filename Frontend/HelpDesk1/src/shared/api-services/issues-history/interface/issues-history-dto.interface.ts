export interface IIssuesHistoryDto {
    id: number;
    issueId: number;
    fieldName?: string;
    creationTime: Date;
    createdBy: number;
    creatorName?: string;
    originalValue?: string;
    newValue?: string;
    description?: string;
    localizedDescription?: string;
}