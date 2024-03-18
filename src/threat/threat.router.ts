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

/*
 * Commented out implementation work-in-progress until AI service is done
 */
// threatRouter.get("/generate", async (request: Request, response: Response) => {
//   // 1. GET a random employee (1 out of 800 employees) from employees (datasource) microservice
//   const randomEmployeeId = getRandomInt(1, 800);
//   const employeeInfoResponse = await axios.get(
//     `http://localhost:8080/employees/employee/${randomEmployeeId}`
//   );
//   const employeeInfoData = employeeInfoResponse.data;

//   console.log("EMPLOYEE INFO DATA >>>", employeeInfoData);

//   // 2. GET one of the three logs by random (building access logs, pc access logs, proxy logs) associated with employeeId
//   const buildingAccessLogsResponse = await axios.get(
//     `http://localhost:8080/employees/building_access/employee/${randomEmployeeId}`
//   );
//   const buildingAccessLogsData = buildingAccessLogsResponse.data;
//   console.log(
//     "EMPLOYEE BUILDING ACCESS LOGS DATA >>>",
//     buildingAccessLogsData.length
//   );

//   const randomLogIndex = getRandomInt(0, buildingAccessLogsData.length - 1);
//   const selectedBuildingAccessLog = buildingAccessLogsData[randomLogIndex];
//   console.log("BUILDING ACCCES LOG SELECTED >>>", selectedBuildingAccessLog);

//   // 3. FORMAT data

//   const formattedBuildingAccessLogResponseForAIService = {
//     id: selectedBuildingAccessLog.id,
//     accessDateTime: selectedBuildingAccessLog.accessDateTime,
//     direction: selectedBuildingAccessLog.direction,
//     status: selectedBuildingAccessLog.status,
//     officeLocation: selectedBuildingAccessLog.officeLocation,
//     employeeId: selectedBuildingAccessLog.userId,
//     joinedDate: employeeInfoData.joinedDate,
//     terminatedDate: employeeInfoData.terminatedDate,
//   };

//   return response
//     .status(200)
//     .json({
//       message: "New threat generated",
//       data: formattedBuildingAccessLogResponseForAIService,
//     });
// });

// // Get a random integer between min (inclusive) and max (inclusive)
// function getRandomInt(min: number, max: number) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }
