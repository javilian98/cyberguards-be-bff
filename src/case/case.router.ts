import express from "express";
import type { Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import axios from "axios";
import {
  Case,
  CaseAuditLog,
  Employee,
  UserDetail,
  UserListItem,
} from "../types/types";
import {
  axiosCaseService,
  axiosThreatService,
  axiosUserService,
} from "../utils/baseApi";

export const caseRouter = express.Router();

const fetchUsers = async (queries: any): Promise<UserDetail[]> => {
  try {
    const { data: usersResponse } = await axiosUserService.get(`/api/users`, {
      params: queries,
    });
    return usersResponse;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return [];
  }
};
caseRouter.get(
  "/",
  query("skip")
    .optional()
    .isNumeric()
    .toInt()
    .withMessage("Skip must be a number"),
  query("take")
    .optional()
    .isNumeric()
    .toInt()
    .withMessage("Take must be a number")
    .isInt({ max: 50 })
    .withMessage("Take must be less than or equal to 50."),
  query("userIds").optional().isString(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const casesQueries = {
        skip: request.query.skip ? Number(request.query.skip) : undefined,
        take: request.query.take ? Number(request.query.take) : undefined,
      };

      const cases = await axiosCaseService.get(`/api/cases`, {
        params: casesQueries,
      });

      const usersData = await fetchUsers({
        ...casesQueries,
        roleId: request.query.roleId ? Number(request.query.roleId) : undefined,
        userIds: request.query.userIds
          ? request.query.userIds.toString()
          : undefined,
      });

      const newCaseListData = cases.data.map((caseItem: Case) => {
        const foundAssignee = usersData.find(
          (userItem: UserListItem) => userItem.id === caseItem.assigneeId
        );

        return {
          ...caseItem,
          assignee: {
            fullName: foundAssignee
              ? foundAssignee.firstName + " " + foundAssignee.lastName
              : null,
          },
        };
      });

      return response.status(200).json(newCaseListData);
    } catch (error: any) {
      console.error("Failed to fetch case data:", error);
      return response.status(500).json(error.message);
    }
  }
);

const fetchUser = async (userId: string): Promise<UserDetail | null> => {
  try {
    const { data: userResponse } = await axiosUserService.get(
      `/api/users/${userId}`
    );
    return userResponse as UserDetail;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
};
const fetchEmployee = async (employeeId: string): Promise<Employee | null> => {
  try {
    const { data: employeeResponse } = await axiosThreatService.get(
      `/employees/${employeeId}`
    );
    return employeeResponse.data as Employee;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
};
caseRouter.get("/:id", async (request: Request, response: Response) => {
  try {
    const singleCaseResponse = await axiosCaseService.get(
      `/api/cases/${request.params.id}`
    );
    const singleCase = singleCaseResponse.data as Case;

    const foundAssignee = await fetchUser(singleCase.assigneeId);
    const foundEmployee = await fetchEmployee(singleCase.employeeId);

    console.log("FOUND EMPLOYEE >> ", foundEmployee);

    const newCaseDetail = {
      ...singleCase,
      assignee: {
        fullName: foundAssignee
          ? foundAssignee?.firstName + " " + foundAssignee?.lastName
          : null,
      },
      employee: {
        fullName: foundEmployee
          ? foundEmployee?.firstname + " " + foundEmployee?.lastname
          : null,
      },
    };

    return response.status(200).json(newCaseDetail);
  } catch (error: any) {
    console.error("Failed to fetch case data:", error);
    return response.status(500).json(error.message);
  }
});

caseRouter.get(
  "/employee/:id",
  async (request: Request, response: Response) => {
    try {
      const singleCaseResponse = await axiosCaseService.get(
        `/api/cases/employee/${request.params.id}`
      );
      const singleCase = singleCaseResponse.data as Case;

      console.log(
        "SINGLE CASEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE ",
        singleCase
      );

      const foundAssignee = await fetchUser(singleCase.assigneeId);

      const newCaseDetail = {
        ...singleCase,
        assignee: {
          fullName: foundAssignee
            ? foundAssignee?.firstName + " " + foundAssignee?.lastName
            : null,
        },
      };

      return response.status(200).json(newCaseDetail);
    } catch (error: any) {
      console.error("Failed to fetch case data:", error);
      return response.status(500).json(error.message);
    }
  }
);

caseRouter.post(
  "/",
  body("title").isString(),
  body("description").isString(),
  body("riskScore").isNumeric(),
  // body("threatPageUrl").isString(),
  body("assigneeId").isString().notEmpty().optional(),
  body("employeeId").isString(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const caseItem = request.body;
      const newCaseResponse = await axiosCaseService.post(
        `/api/cases`,
        caseItem
      );
      const newCase = newCaseResponse.data;
      return response.status(201).json(newCase);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);

// PUT: Update a Case
// PARAMS: title, description, risk_status, risk_score, threat_page_url
caseRouter.put(
  "/:id",
  body("title").isString(),
  body("description").isString(),
  body("riskScore").isNumeric(),
  // body("threatPageUrl").isString(),
  body("assigneeId").isString().notEmpty().optional(),
  body("employeeId").isString(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const caseItem = request.body;
      const updatedCaseResponse = await axiosCaseService.put(
        `/api/cases/${request.params.id}`,
        caseItem
      );
      const updatedCase = updatedCaseResponse.data;

      return response.status(200).json(updatedCase);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);

// DELETE: Delete a Case based on its uuid
caseRouter.delete("/:id", async (request: Request, response: Response) => {
  try {
    await axiosCaseService.delete(`/api/cases/${request.params.id}`);
    return response.status(204).json("Case has been successfully deleted.");
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});

caseRouter.get(
  "/logs/case_audit_logs",
  query("skip")
    .optional()
    .isNumeric()
    .toInt()
    .withMessage("Skip must be a number"),
  query("take")
    .optional()
    .isNumeric()
    .toInt()
    .withMessage("Take must be a number")
    .isInt({ max: 50 })
    .withMessage("Take must be less than or equal to 50."),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const queries = {
        skip: request.query.skip ? Number(request.query.skip) : undefined,
        take: request.query.take ? Number(request.query.take) : undefined,
      };

      const caseAuditLogResponse = await axiosCaseService.get(
        `/api/cases/logs/case_audit_logs`,
        {
          params: queries,
        }
      );
      const usersData = await fetchUsers({
        queries,
      });

      console.log("287: >>>>>", usersData);

      const newCaseAuditLogListData = caseAuditLogResponse.data.map(
        (log: CaseAuditLog) => {
          const foundAssignee = usersData.find(
            (userItem: UserListItem) => userItem.id === log.assigneeId
          );

          return {
            ...log,
            assignee: {
              fullName: foundAssignee
                ? foundAssignee.firstName + " " + foundAssignee.lastName
                : null,
            },
          };
        }
      );
      return response.status(200).json(newCaseAuditLogListData);
    } catch (error: any) {
      console.log(error);
      return response.status(500).json(error.message);
    }
  }
);

caseRouter.post(
  "/case_audit_logs",
  body("caseId").isString(),
  body("assigneeId").isString().notEmpty().optional(),
  body("action").isString(),
  body("edits").isString().notEmpty().optional(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const log = request.body;
      const newLogResponse = await axiosCaseService.post(
        `/api/cases/case_audit_logs`,
        log
      );
      const newLog = newLogResponse.data;
      return response.status(201).json(newLog);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);
