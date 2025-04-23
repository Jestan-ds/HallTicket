import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./routes/studentRoutes";
import examRegistrationRouter from "./routes/examRegistration";
import examRouter from "./routes/examRoutes";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import userDetailsRouter from "./routes/userDetailsRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT||5000; ;


app.use(cors(
  {
    origin: "http://localhost:5173",
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }
));
app.use(express.json());
app.use(cookieParser())
// app.use(bodyParser.json());  // ✅ Parse JSON only for POST/PUT requests
// app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/students", studentRoutes);

app.use("/api/examRegistration",examRegistrationRouter)

app.use("/api/exam",examRouter)

app.use("/api/auth",authRoutes)
 app.use("/api/userDetails", userDetailsRouter); // Adjust the path as needed

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
