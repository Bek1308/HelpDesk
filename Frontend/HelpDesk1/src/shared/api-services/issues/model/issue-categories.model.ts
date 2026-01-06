export interface IssueCategory {
  category: string;
  displayName: string;
  permissionName?: string;
  permission?: boolean;
}

export interface IssueCategoriesResponse {
  commonFields?: any[]; // Ignored for now as per instructions
  categories: IssueCategory[];
}