export interface Case {
  id: string;
  title: string;
  riskScore: number;
  createdAt: string;
  assigneeId: string;
  assignedDateTime?: string;
  employeeId: string;
}

export interface CaseDetail {
  id: string;
  title: string;
  description: string;
  riskScore: number;
  createdAt?: string;
  assignee?: {
    id: string;
    fullName: string;
  };
  assignedDateTime?: string;
  employee?: {
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

export interface BuildingAccessLog {
  logId: string;
  employeeId: string;
  accessDateTime: string;
  direction: string;
  status: string;
  officeLocation: string;
  suspectType: number;
}
export type PCAccessLog = {
  logId: string;
  employeeId: string;
  accessDateTime: string;
  logOnOff: string;
  machineName: string;
  machineLocation: string;
  suspectType: number;
};
export type ProxyLog = {
  logId: string;
  employeeId: string;
  accessDateTime: string;
  machineName: string;
  url: string;
  category: string;
  bytesIn: number;
  bytesOut: number;
  suspectType: number;
};

export interface BuildingAccessLogAPIResponse {
  id: number;
  employeeid: number;
  access_date_time: string;
  direction: string;
  status: string;
  office_location: string;
  suspect: number;
}
export type PCAccessLogAPIResponse = {
  id: number;
  employeeid: number;
  access_date_time: string;
  log_on_off: string;
  machine_name: string;
  machine_location: string;
  suspect: number;
};
export type ProxyLogAPIResponse = {
  id: number;
  employeeid: number;
  access_date_time: string;
  machine_name: string;
  url: string;
  category: string;
  bytes_in: number;
  bytes_out: number;
  suspect: number;
};

export interface ThreatAPIResponse {
  id: number;
  employeeId: number;
  riskScore: number;
  offenceLogCount: number;
}

export interface Employee {
  business_unit: string;
  email: string;
  employeeid: number;
  firstname: string;
  lastname: string;
  gender: string;
  joined_date: string;
  location: string;
  profile: number;
  suspect: boolean;
  terminated_date: string | null;
}
export interface ThreatDetailAPIResponse {
  id: number;
  employeeId: number;
  employeeInfo: Employee;
  offenceLogCount: number;
  logs: {
    buildingAccess: BuildingAccessLogAPIResponse[];
    pcAccess: ProxyLogAPIResponse[];
    proxy: ProxyLogAPIResponse[];
  };
}

export type CaseAuditLog = {
  id: string;
  caseId: string;
  assigneeId: string | null;
  action: string;
  edits: string;
};
