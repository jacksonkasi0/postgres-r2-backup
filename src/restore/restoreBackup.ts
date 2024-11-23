// ** Import utils
import { log } from "@/utils/logger.ts";
import { downloadFromR2 } from "@/utils/r2/index.ts";
import { execCommand } from "@/utils/execCommand.ts";

/**
 * Restores a PostgreSQL backup.
 * @param dbUrl - The database connection URL.
 * @param backupFilePath - Path to the backup file.
 */
export async function restoreBackup(dbUrl: string, backupFilePath: string): Promise<void> {
  log.info("Starting restore...");

  const command = `
    pg_restore -U postgres \
    --dbname=${dbUrl} \
    --clean \
    --if-exists \
    --exit-on-error \
    ${backupFilePath}
  `;

  await execCommand(command);
  log.success("Database restored successfully!");
}

/**
 * Restores a PostgreSQL backup from R2.
 * @param dbUrl - The database connection URL.
 * @param r2Key - The R2 object key for the backup file.
 */
export async function restoreBackupFromR2(dbUrl: string, r2Key: string): Promise<void> {
  log.info(`Starting restore from R2: ${r2Key}...`);
  const localFilePath = `/tmp/${r2Key.split('/').pop()}`;

  // Download the file from R2
  await downloadFromR2(r2Key, localFilePath);

  // Restore the database
  await restoreBackup(dbUrl, localFilePath);

  // Remove the downloaded file
  await Deno.remove(localFilePath);
  log.success(`Temporary file removed: ${localFilePath}`);
}