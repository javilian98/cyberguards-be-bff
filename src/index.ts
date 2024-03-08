import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { caseRouter } from "./case/case.router";
import { userRouter } from "./users/user.router";

dotenv.config();
console.log("process.env.CASE_SERVICE_PORT ", process.env.BFF_SERVICE_PORT);
if (!process.env.BFF_SERVICE_PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.BFF_SERVICE_PORT as string, 10);

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/cases", caseRouter);
app.use("/api/users", userRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
