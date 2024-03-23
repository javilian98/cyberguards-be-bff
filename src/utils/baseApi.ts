import axios from "axios";

import * as dotenv from "dotenv";

dotenv.config();

export const axiosCaseService = axios.create({
  baseURL: process.env.CASE_SERVICE_URL,
});

export const axiosUserService = axios.create({
  baseURL: process.env.USER_SERVICE_URL,
});

export const axiosEmployeeService = axios.create({
  baseURL: process.env.EMPLOYEE_SERVICE_URL,
});

export const axiosThreatService = axios.create({
  baseURL: process.env.THREAT_SERVICE_URL,
});

export const axiosPredictionService = axios.create({
  baseURL: process.env.PREDICTION_SERVICE_URL,
});
