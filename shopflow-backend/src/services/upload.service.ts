import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import s3 from "../config/s3";

export async function uploadToS3(file: Express.Multer.File, folder: string = "products"): Promise<string> {
  const extension = file.mimetype.split("/")[1];
  const key = `${folder}/${uuidv4()}.${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  );

  // Return the public URL
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFromS3(url: string): Promise<void> {
  // Extract key from URL
  const key = url.split(".amazonaws.com/")[1];
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key
    })
  );
}
