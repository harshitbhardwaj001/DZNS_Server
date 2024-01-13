import express, { json } from "express";
import { config } from "dotenv";
import cors from "cors";
import authRoutes from "./routes/AuthRoutes.js";
import cookieParser from "cookie-parser";
import { globalOptionsMiddleware } from "./middlewares/GlobalOptionsMiddleware.js";
import { servicesRoutes } from "./routes/ServicesRoutes.js";
import { ordersRoutes } from "./routes/OrderRoutes.js";
import { messageRoutes } from "./routes/MessageRoutes.js";
import { dashboardRoutes } from "./routes/DashboardRoutes.js";

config();

const app = express();
const port = process.env.PORT || 9001;

app.use(
  cors({
    origin: [process.env.PUBLIC_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads", express.static("uploads"));

app.use(cookieParser());
app.use(json());

app.use(globalOptionsMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
