import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./routes/studentRoutes";
import examRegistrationRouter from "./routes/examRegistration";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);

app.use("/api/exams",examRegistrationRouter)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
