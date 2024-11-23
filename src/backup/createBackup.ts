// ** import utils
import { log } from "@/utils/logger.ts";
import { execCommand } from "@/utils/execCommand.ts";

/**
 * Creates a PostgreSQL backup and uploads it to Cloudflare R2.
 * @param dbUrl - The database connection URL.
 * @param backupFilePath - The local file path for the backup.
 */
export async function createBackup(dbUrl: string, backupFilePath: string): Promise<void> {
  log.info("Starting backup...");

  // Step 1: Create the backup file
  const command = `pg_dump -F t -d ${dbUrl} -f ${backupFilePath}`;
  await execCommand(command);
  log.success(`Backup created successfully: ${backupFilePath}`);
}
