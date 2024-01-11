import { addMessage, getMessages } from "../controllers/MessagesController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { Router } from "express";

export const messageRoutes = Router();

messageRoutes.post("/add-message/:orderId", verifyToken, addMessage);
messageRoutes.get("/get-messages/:orderId", verifyToken, getMessages);
