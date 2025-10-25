import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import Env from '../constant/env';

const s3 = new S3Client({
  region: Env.AWS_REGION as string,
  credentials: {
    accessKeyId: Env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: Env.AWS_ACCESS_SECRET as string,
  },
});

const getSignedUrlByKey = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: Env.AWS_BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
};

const uploadFile = async (s3Key: string, body: any, contentType?: string) => {
  try {
    const command = new PutObjectCommand({
      Bucket: Env.AWS_BUCKET,
      Key: s3Key,
      Body: body,
      ContentType: contentType,
    });

    await s3.send(command);
  } catch (err) {
    console.log(`Error: uploadFile: ${err}`);
    throw err;
  }
};

const deleteFile = async (s3Key: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: Env.AWS_BUCKET,
      Key: s3Key,
    });

    await s3.send(command);
  } catch (err) {
    console.error(`Error: deleteFile: ${err}`);
    throw err;
  }
};

export { s3, getSignedUrlByKey, uploadFile, deleteFile };
