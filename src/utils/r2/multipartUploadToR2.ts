// ** Import packages
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutObjectCommand,
  CompletedPart,
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

export async function multipartUploadToR2(
  filePath: string,
  key: string,
): Promise<void> {
  const fileContent = await Deno.readFile(filePath);
  const fileSize = fileContent.length;
  const partSize = 5 * 1024 * 1024; // 5 MiB
  const numParts = Math.ceil(fileSize / partSize);

  if (fileSize <= partSize) {
    // For small files, use a single PUT operation
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
    return;
  }

  // For large files, use multipart upload
  const createCommand = new CreateMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const createResponse = await S3.send(createCommand);
  const uploadId = createResponse.UploadId;

  try {
    // Parallelize part uploads
    const uploadPartPromises: Promise<CompletedPart>[] = Array.from(
      { length: numParts },
      (_, index) => {
        const partNumber = index + 1;
        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, fileSize);
        const partData = fileContent.slice(start, end);

        const uploadPartCommand = new UploadPartCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: partData,
        });

        // Upload the part and resolve to CompletedPart
        return S3.send(uploadPartCommand).then((uploadPartResponse) => {
          log.info(`Uploaded part ${partNumber} of ${numParts}`);
          return {
            PartNumber: partNumber,
            ETag: uploadPartResponse.ETag,
          };
        });
      },
    );

    const completedParts = await Promise.all(uploadPartPromises);

    // Complete the multipart upload
    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: completedParts },
    });

    await S3.send(completeCommand);
    log.success(`Multipart upload completed for: ${key}`);
  } catch (error) {
    log.error("Multipart upload failed:", error);
    if (uploadId) {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
      });
      await S3.send(abortCommand);
      log.error(`Aborted multipart upload for: ${key}`);
    }
    throw error;
  }
}
