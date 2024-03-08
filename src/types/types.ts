export interface Case {
  id: string;
  title: string;
  riskStatus: "low" | "medium" | "high";
  riskScore: number;
  createdAt: string;
  assigneeId: string;
  assignedDateTime?: string;
  suspectedUserId: string;
}

export interface CaseDetail {
  id: string;
  title: string;
  description: string;
  riskStatus: "low" | "medium" | "high";
  riskScore: number;
  createdAt?: string;
  assignee?: {
    id: string;
    fullName: string;
  };
  assignedDateTime?: string;
  suspectedUser?: {
    id: string;
    fullName: string;
  };
  threatPageUrl: string;
}

export interface UserListItem {
  id: string;
  firstName: string;
  lastName: string;
  profession: string;
  riskScore: number;
  suspectCaseId: number;
  lastAccessAt?: string;
}
export interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  profession: string;
  roleId: number;
  riskStatus: string;
  riskScore: number;
  suspectCaseId: number;
  lastAccessAt?: string;
}
