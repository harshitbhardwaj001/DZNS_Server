import { PrismaClient } from "@prisma/client";

export const addMessage = async (req, res, next) => {
  try {
    const prisma = new PrismaClient();
    if (req.body.recipientId && req.body.message && req.params.orderId) {
      const message = await prisma.messages.create({
        data: {
          sender: {
            connect: { id: parseInt(req.userId) },
          },
          recipient: {
            connect: { id: parseInt(req.body.recipientId) },
          },
          order: {
            connect: { id: parseInt(req.params.orderId) },
          },
          text: req.body.message,
        },
      });
      return res.status(201).json({ message });
    }
    return res
      .status(400)
      .send("userId, recipientId, orderId and message is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error.");
  }
};

export const getMessages = async (req, res, next) => {
  try {
    if (req.params.orderId && req.userId) {
      const prisma = new PrismaClient();
      const messages = await prisma.messages.findMany({
        where: {
          order: {
            id: parseInt(req.params.orderId),
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      await prisma.messages.updateMany({
        where: {
          orderId: parseInt(req.params.orderId),
          recipientId: parseInt(req.userId),
        },
        data: {
          isRead: true,
        },
      });

      const order = await prisma.orders.findUnique({
        where: {
          id: parseInt(req.params.orderId),
        },
        include: { service: true },
      });
      let recipientId;
      if (order.buyerId === req.userId) {
        recipientId = order.service.userId;
      } else if (order.service.userId === req.userId) {
        recipientId = order.buyerId;
      }
      return res.status(200).json({ messages, recipientId });
    }
    return res.status(400).send("OrderId is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error.");
  }
};
