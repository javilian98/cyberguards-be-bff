import express from "express";
import type { Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import axios from "axios";
import {
  BuildingAccessLog,
  PCAccessLog,
  ThreatAPIResponse,
  ThreatDetailAPIResponse,
} from "../types/types";
import {
  axiosEmployeeService,
  axiosPredictionService,
  axiosThreatService,
} from "../utils/baseApi";

export const threatRouter = express.Router();

threatRouter.get("/", async (request: Request, response: Response) => {
  // 1. GET Threats
  const threatsResponse = await axiosThreatService.get("/threats");
  const threatsData: ThreatAPIResponse[] = await threatsResponse.data;

  // 2. GET employees by employeeIds from Threats
  const employeesData = await Promise.all(
    threatsData.map(async (threat) => {
      const employeeResponse = await axiosThreatService.get(
        `/employees/${threat.employeeId}`
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
    const threatDetailResponse = await axiosThreatService.get(
      `/threats/${request.params.id}`
    );
    const threatDetailData: ThreatDetailAPIResponse[] =
      await threatDetailResponse.data;

    return response.status(200).json(threatDetailData);
  }
);

threatRouter.get("/generate", async (request: Request, response: Response) => {
  // 1. GET a random employee id (1 out of 800 employees)
  const randomEmployeeId = getRandomInt(1, 800);

  // 2. GET random log type (building_access, pc_access, proxy_log)
  const logTypesML = [
    "building_access/ML",
    // "pc_access/ML",
    "proxy_log",
  ];
  // const randomLogTypeIndex = getRandomInt(0, 2);
  const randomLogTypeIndex = getRandomInt(0, 1);
  const randomLogTypeML = logTypesML[randomLogTypeIndex];

  // 3. GET one of the three logs by random (building access logs, pc access logs, proxy logs) associated with random employeeId
  const LogsResponse = await axiosEmployeeService.get(
    `/employees/${randomLogTypeML}/employee/${randomEmployeeId}`
  );
  const LogsData = LogsResponse.data;

  const randomLogIndex = getRandomInt(0, LogsData.length - 1);
  const selectedLog = LogsData[randomLogIndex];
  console.log("BUILDING ACCCES LOG SELECTED >>>", selectedLog);

  // 4. POST log to AI service
  const logTypes = [
    "building_access",
    // "pc_access",
    "proxy_log",
  ];
  const predictedSuspectLogResponse = await axiosPredictionService.post(
    `/prediction/${logTypes[randomLogTypeIndex]}/predict`,
    selectedLog
  );
  const predictedSuspectLogData = predictedSuspectLogResponse.data;
  console.log("predictedSuspectLogData >>>>", predictedSuspectLogData);

  // 4. GET employeeInfo & POST inside Threat service
  const employeeInfoResponse = await axiosEmployeeService.get(
    `/employees/employee/${randomEmployeeId}`
  );
  const employeeInfoData = employeeInfoResponse.data;

  const createEmployeePayload = {
    employeeid: employeeInfoData.id,
    firstname: employeeInfoData.firstname,
    lastname: employeeInfoData.lastname,
    email: employeeInfoData.email,
    gender: employeeInfoData.gender,
    business_unit: employeeInfoData.businessUnit,
    joined_date: employeeInfoData.joinedDate,
    terminated_date: employeeInfoData.terminatedDate,
    profile: employeeInfoData.profile,
    suspect: employeeInfoData.suspect,
    location: employeeInfoData.location,
  };
  await axiosThreatService.post(`/employees`, createEmployeePayload);

  const payloadForThreatsService = transformPayloadFormatToThreatsService(
    randomLogTypeIndex,
    predictedSuspectLogData
  );

  console.log("threatLogCreatedData >>>>", payloadForThreatsService);

  const threatLogCreatedResponse = await axiosThreatService.post(
    `/logs`,
    payloadForThreatsService
  );
  const threatLogCreatedData = threatLogCreatedResponse.data;

  console.log("threatLogCreatedData >>>>", threatLogCreatedData);

  const threatLogCreatedDataFormatted = {
    id: threatLogCreatedData.id,
    firstName: threatLogCreatedData.employeeInfo?.firstname,
    lastName: threatLogCreatedData.employeeInfo?.lastname,
    businessUnit: threatLogCreatedData.employeeInfo?.business_unit,
    riskScore: threatLogCreatedData?.riskScore,
    offenceLogCount: 1,
  };

  return response.status(200).json(threatLogCreatedDataFormatted);
});

// Get a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function transformPayloadFormatToThreatsService(
  logTypeIndex: number,
  payload: any
) {
  switch (logTypeIndex) {
    case 0: // building_access
      return {
        building_access: [
          {
            id: payload.id,
            employeeid: payload.user_id,
            access_date_time: payload.access_date_time,
            direction: payload.direction,
            status: payload.status,
            office_location: payload.office_location,
            suspect: 4,
            // suspect: payload.suspect, // replace the above with this after AI service returns a non-zero suspect
          },
        ],
      };
    case 1: // proxy_log
      return {
        proxy_log: [
          {
            id: payload.id,
            employeeid: payload.user_id,
            access_date_time: payload.access_date_time,
            bytes_in: payload.bytes_in,
            bytes_out: payload.bytes_out,
            category: payload.category,
            url: payload.url,
            machine_name: payload.machine_name,
            suspect: 6,
            // suspect: payload.suspect, // replace the above with this after AI service returns a non-zero suspect
          },
        ],
      };
    // case 1: // pc_access
    //   return {
    //     pc_access: [
    //       {
    //         id: payload.id,
    //         employeeid: payload.user_id,
    //         access_date_time: payload.access_date_time,
    //         log_on_off: payload.log_on_off,
    //         machine_location: payload.machine_location,
    //         machine_name: payload.machine_name,
    //         suspect: payload.suspect,
    //       },
    //     ],
    //   };
  }
}
