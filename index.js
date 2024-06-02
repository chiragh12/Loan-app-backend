import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/dbConnect.js";
import userRoutes from "./routes/userRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

//config  env
dotenv.config();

//rest object
const app = express();

//middlewares

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

connectDB();

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/loans", loanRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("hello osam");
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server runnning on ${port}`);
});
