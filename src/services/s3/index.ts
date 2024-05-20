import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_USER_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_USER_SECRET_ACCESS_KEY!,
  },
});

export const uploadFile = async (file: any, key: string) => {
  try {
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      Key: key,
      Body: file,
    };

    const response = await s3.send(new PutObjectCommand(params));

    return response;
  } catch (error) {
    console.error("Error uploading file to S3", error);
    throw new Error("Error uploading file to S3");
  }
};

export const getFile = async (fileKey: string) => {
  try {
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      Key: fileKey,
    };

    return await s3.send(new GetObjectCommand(params));
  } catch (error) {
    console.error("Error getting file from S3", error);
    throw new Error("Error getting file from S3");
  }
};

export const deleteFile = async (fileKey: string) => {
  try {
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      Key: fileKey,
    };

    return await s3.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.error("Error deleting file from S3", error);
    throw new Error("Error deleting file from S3");
  }
};

export const createSignedUrl = async (fileKey: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 86400 });

    return signedUrl;
  } catch (error) {
    console.error("Error creating signed URL for file", error);
    throw new Error("Error creating signed URL for file");
  }
};
