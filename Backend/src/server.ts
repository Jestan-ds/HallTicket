import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./routes/studentRoutes";
import examRegistrationRouter from "./routes/examRegistration";
import examRouter from "./routes/examRoutes";
import userRouter from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT||5000; ;

console.log(PORT)

app.use(cors());
app.use(express.json());
app.use(cookieParser())
// app.use(bodyParser.json());  // ✅ Parse JSON only for POST/PUT requests
// app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/students", studentRoutes);

app.use("/api/examRegistration",examRegistrationRouter)

app.use("/api/exam",examRouter)

app.use("/api/user",userRouter)

app.use("/api/auth",authRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
