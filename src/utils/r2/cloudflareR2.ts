// ** Import packages
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";

// ** Import utils
import { log } from "@/utils/logger.ts";

// ** Import config
import { config } from "@/config.ts";


const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, ACCOUNT_ID, BUCKET_NAME } = config;

/**
 * Initialize the S3 client for Cloudflare R2.
 */
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a file to Cloudflare R2.
 * @param filePath - Path to the local file.
 * @param key - The object key in the R2 bucket.
 */
export async function uploadToR2(filePath: string, key: string): Promise<void> {
  const fileContent = await Deno.readFile(filePath);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
  });

  try {
    await S3.send(command);
    log.success(`File uploaded to R2: ${key}`);
  } catch (error) {
    log.error("Failed to upload to R2:", error);
    throw error;
  }
}

/**
 * List objects in the R2 bucket.
 */
export async function listR2Objects(): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
  });

  try {
    const response = await S3.send(command) as ListObjectsV2CommandOutput;
    return response.Contents?.map((obj) => obj.Key!) || [];
  } catch (error) {
    log.error("Failed to list objects in R2:", error);
    throw error;
  }
}

/**
 * Delete an object from R2.
 * @param key - The object key to delete.
 */
export async function deleteR2Object(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await S3.send(command);
    log.info(`File deleted from R2: ${key}`);
  } catch (error) {
    log.error(`Failed to delete from R2: ${error}`);
    throw error;
  }
}

/**
 * Downloads a file from R2 to the local filesystem.
 * @param r2Key - The R2 object key.
 * @param localFilePath - The local file path to save the downloaded file.
 */
export async function downloadFromR2(r2Key: string, localFilePath: string): Promise<void> {
  log.info(`Downloading ${r2Key} from R2...`);
  const command = new GetObjectCommand({
    Bucket: config.BUCKET_NAME,
    Key: r2Key,
  });

  const response = await S3.send(command) as GetObjectCommandOutput;

  if (!response.Body) {
    throw new Error(`Failed to download file from R2: ${r2Key}`);
  }

  const file = await Deno.open(localFilePath, { create: true, write: true });
  const reader = response.Body as ReadableStream<Uint8Array>;
  for await (const chunk of reader) {
    await file.write(chunk);
  }
  file.close();

  log.success(`File downloaded to ${localFilePath}`);
}