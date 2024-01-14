import multiparty from "multiparty";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import mime from "mime-types";

const bucketName = "dzns-ecommerce";

const client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const uploadUserMiddleware = (fieldName) => (req, res, next) => {
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }

    const links = [];

    for (const file of files[fieldName]) {
      try {
        const ext = file.originalFilename.split(".").pop();
        const newFilename = Date.now() + "." + ext;

        await client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: newFilename,
            Body: fs.readFileSync(file.path),
            ACL: "public-read",
            ContentType: mime.lookup(file.path),
          })
        );

        const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
        links.push(link);
      } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
      }
    }

    // Attach the links to the request object
    req.s3Links = links;

    next();
  });
};

export default uploadUserMiddleware;
