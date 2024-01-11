import { Router } from "express";
import {
  signUp,
  login,
  getUserInfo,
  setUserInfo,
  setUserImage,
} from "../controllers/aUTHcONTROLLERS.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

import multer from "multer";

const authRoutes = Router();
const upload = multer({ dest: "uploads/profiles/" });

authRoutes.post("/signup", signUp);
authRoutes.post("/login", login);
authRoutes.post("/get-user-info", verifyToken, getUserInfo);
authRoutes.post("/set-user-info", verifyToken, setUserInfo);

authRoutes.post(
  "/set-user-image",
  verifyToken,
  upload.single("images"),
  setUserImage
);

export default authRoutes;
