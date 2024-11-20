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
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import bodyParser from "body-parser";

config();

const app = express();
const port = process.env.PORT || 9001;

console.log("CORS Allowed Origin:", process.env.PUBLIC_URL);

app.use(
  cors({
    origin: [process.env.PUBLIC_URL], // Explicitly allow your frontend origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true, // Allow cookies and credentials
    allowedHeaders: ["Content-Type", "Authorization"], // Add any additional headers your frontend sends
  })
);

app.use(express.json()); // Built-in middleware for parsing JSON
app.use(express.urlencoded({ extended: true })); // For URL-encoded data

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DATABASE CONNECTED SUCCESSFULLY"))
  .catch((err) => {
    console.error("Error connecting to database:", err);
    process.exit(1);
  });

// Define a Mongoose schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// Submission Route
app.post("/postdetails", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  try {
    // Save the user to MongoDB
    const newUser = new User({ name, email });
    const result = await newUser.save();

    res.status(201).json({ message: "User added successfully!", result });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// app.use("/uploads/profiles", express.static("uploads/profiles"));
// app.use("/uploads", express.static("uploads"));

// app.use(cookieParser());
// app.use(json());

// app.use(globalOptionsMiddleware);

// app.use("/api/auth", authRoutes);
// app.use("/api/services", servicesRoutes);
// app.use("/api/orders", ordersRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/dashboard", dashboardRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
