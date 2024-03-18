import express from "express";
import type { Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import axios from "axios";
import { ThreatAPIResponse, ThreatDetailAPIResponse } from "../types/types";

export const threatRouter = express.Router();

threatRouter.get("/", async (request: Request, response: Response) => {
  // 1. GET Threats
  const threatsResponse = await axios.get("http://localhost:5000/threats");
  const threatsData: ThreatAPIResponse[] = await threatsResponse.data;

  // 2. GET employees by employeeIds from Threats
  const employeesData = await Promise.all(
    threatsData.map(async (threat) => {
      const employeeResponse = await axios.get(
        `http://localhost:5000/employees/${threat.employeeId}`
      );

      const employeeData = employeeResponse.data.data;

      return {
        id: threat.id.toString(),
        employeeId: threat.employeeId.toString(),
        firstName: employeeData.firstname,
        lastName: employeeData.lastname,
        businessUnit: employeeData.business_unit,
        riskScore: threat.riskScore,
        offenceLogCount: threat.offenceLogCount,
      };
    })
  );

  return response.status(200).json(employeesData);
});

threatRouter.get(
  "/employee/:id",
  async (request: Request, response: Response) => {
    const threatDetailResponse = await axios.get(
      `http://localhost:5000/threats/${request.params.id}`
    );
    const threatDetailData: ThreatDetailAPIResponse[] =
      await threatDetailResponse.data;

    return response.status(200).json(threatDetailData);
  }
);
