import express from "express";
import type { Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import axios from "axios";
import { Case, CaseDetail, UserDetail, UserListItem } from "../types/types";

// import * as CaseService from "./case.service";

export const caseRouter = express.Router();

const fetchUsers = async (queries: any): Promise<UserDetail[]> => {
  try {
    const { data: usersResponse } = await axios.get(
      "http://localhost:10001/api/users",
      {
        params: queries,
      }
    );
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

      const cases = await axios.get("http://localhost:10000/api/cases", {
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
        const foundSuspectedUser = usersData.find(
          (userItem: UserListItem) => userItem.id === caseItem.suspectedUserId
        );

        return {
          ...caseItem,
          assignee: {
            fullName: foundAssignee
              ? foundAssignee.firstName + " " + foundAssignee.lastName
              : null,
          },
          suspectedUser: {
            fullName: foundSuspectedUser
              ? foundSuspectedUser?.firstName +
                " " +
                foundSuspectedUser?.lastName
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
    const { data: userResponse } = await axios.get(
      `http://localhost:10001/api/users/${userId}`
    );
    return userResponse as UserDetail;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
};
caseRouter.get("/:id", async (request: Request, response: Response) => {
  try {
    const singleCaseResponse = await axios.get(
      `http://localhost:10000/api/cases/${request.params.id}`
    );
    const singleCase = singleCaseResponse.data as Case;

    const foundAssignee = await fetchUser(singleCase.assigneeId);
    const foundSuspectedUser = await fetchUser(singleCase.suspectedUserId);

    const newCaseDetail = {
      ...singleCase,
      assignee: {
        fullName: foundAssignee
          ? foundAssignee?.firstName + " " + foundAssignee?.lastName
          : null,
      },
      suspectedUser: {
        fullName: foundSuspectedUser
          ? foundSuspectedUser?.firstName + " " + foundSuspectedUser?.lastName
          : null,
      },
    };

    return response.status(200).json(newCaseDetail);
  } catch (error: any) {
    console.error("Failed to fetch case data:", error);
    return response.status(500).json(error.message);
  }
});

caseRouter.post(
  "/",
  body("title").isString(),
  body("description").isString(),
  body("riskStatus").isString(),
  body("riskScore").isNumeric(),
  body("threatPageUrl").isString(),
  body("assigneeId").isString().notEmpty().optional(),
  // body("suspectedUserId").isString().notEmpty().optional(),
  // body("suspectTypeId").isNumeric(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const caseItem = request.body;
      const newCaseResponse = await axios.post(
        "http://localhost:10000/api/cases",
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
  body("riskStatus").isString(),
  body("riskScore").isNumeric(),
  body("threatPageUrl").isString(),
  body("assigneeId").isString(),
  // body("suspectedUserId").isString(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const caseItem = request.body;
      const updatedCaseResponse = await axios.put(
        `http://localhost:10000/api/cases/${request.params.id}`,
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
    await axios.delete(`http://localhost:10000/api/cases/${request.params.id}`);
    return response.status(204).json("Case has been successfully deleted.");
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});
