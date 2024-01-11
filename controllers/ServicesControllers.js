import { PrismaClient } from "@prisma/client";
import { existsSync, renameSync, unlinkSync } from "fs";

export const addServices = async (req, res, next) => {
  try {
    if (req.files) {
      const fileKeys = Object.keys(req.files);
      const fileNames = [];
      fileKeys.forEach((file) => {
        const date = Date.now();
        renameSync(
          req.files[file].path,
          "uploads/" + date + req.files[file].originalname
        );
        fileNames.push(date + req.files[file].originalname);
      });
      if (req.query) {
        const {
          title,
          description,
          category,
          features,
          price,
          revisions,
          time,
          shortDesc,
        } = req.query;

        const prisma = new PrismaClient();

        await prisma.services.create({
          data: {
            title,
            description,
            deliveryTime: parseInt(time),
            category,
            features,
            price: parseInt(price),
            shortDesc,
            revisions: parseInt(revisions),
            createdBy: { connect: { id: req.userId } },
            images: fileNames,
          },
        });

        return res.status(201).send("Successfully created the service.");
      }
    }
    return res.status(400).send("All properties should be required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error.");
  }
};

export const getUserAuthServices = async (req, res, next) => {
  try {
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { services: true },
    });

    return res.status(200).json({ services: user?.services });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error.");
  }
};

export const getServiceData = async (req, res, next) => {
  try {
    if (req.params.serviceId) {
      const prisma = new PrismaClient();
      const service = await prisma.services.findUnique({
        where: {
          id: parseInt(req.params.serviceId),
        },
        include: { createdBy: true },
      });
      return res.status(200).json({ service });
    }
    return res.status(400).send("Service Id is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error.");
  }
};

export const editService = async (req, res, next) => {
  try {
    if (req.files) {
      const fileKeys = Object.keys(req.files);
      const fileNames = [];
      fileKeys.forEach((file) => {
        const date = Date.now();
        renameSync(
          req.files[file].path,
          "uploads/" + date + req.files[file].originalname
        );
        fileNames.push(date + req.files[file].originalname);
      });
      if (req.query) {
        const {
          title,
          description,
          category,
          features,
          price,
          revisions,
          time,
          shortDesc,
        } = req.query;

        const prisma = new PrismaClient();
        const oldData = await prisma.services.findUniqueOrThrow({
          where: { id: parseInt(req.params.serviceId) },
        });

        await prisma.services.update({
          where: { id: parseInt(req.params.serviceId) },
          data: {
            title,
            description,
            deliveryTime: parseInt(time),
            category,
            features,
            price: parseInt(price),
            shortDesc,
            revisions: parseInt(revisions),
            createdBy: { connect: { id: req.userId } },
            images: fileNames,
          },
        });

        oldData?.images.forEach((image) => {
          if (existsSync(`uploads/${image}`)) unlinkSync(`uploads/${image}`);
        });

        return res.status(200).send("Successfully edited the service.");
      }
    }
    return res.status(400).send("All properties should be required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error.");
  }
};

export const searchServices = async (req, res, next) => {
  try {
    if (req.query.searchTerm || req.query.category) {
      const prisma = new PrismaClient();
      const services = await prisma.services.findMany(
        createSearchQuery(req.query.searchTerm, req.query.category)
      );
      return res.status(200).json({ services });
    }
    return res.status(400).send("Search Term or Category is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error.");
  }
};

const createSearchQuery = (searchTerm, category) => {
  const query = {
    where: {
      OR: [],
    },
    include: {
      createdBy: true,
    },
  };
  if (searchTerm) {
    query.where.OR.push({
      title: { contains: searchTerm, mode: "insensitive" },
    });
  }
  if (category) {
    query.where.OR.push({
      category: { contains: category, mode: "insensitive" },
    });
  }
  return query;
};

// export const checkServiceOrder = async (req, res, next) => {
//   try {
//     if (req.userId && req.params.serviceId) {
//       const hasUserOrderedGig = await checkOrder(
//         req.userId,
//         req.params.serviceId
//       );
//       return res
//         .status(200)
//         .json({ hasUserOrderedGig: hasUserOrderedGig ? true : false });
//     }
//     return res.status(400).send("userId and serviceId is required.");
//   } catch (err) {
//     console.log(err);
//     return res.status(500).send("Internal Server Error.");
//   }
// };

// const checkOrder = async (userId, serviceId) => {
//   try {
//     const prisma = new PrismaClient();
//     const hasUserOrderedGig = await prisma.orders.findFirst({
//       where: {
//         buyerId: parseInt(userId),
//         serviceId: parseInt(serviceId),
//         isCompleted: true,
//       },
//     });
//     return hasUserOrderedGig;
//   } catch (err) {
//     console.log(err);
//   }
// };
