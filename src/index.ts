// ** Import deno standard library
import { ensureDir } from "@std/fs";

// ** Import functions
import { createBackup } from "@/backup/createBackup.ts";
import { restoreBackup, restoreBackupFromR2 } from "@/restore/restoreBackup.ts";

// ** Import utils
import { log } from "@/utils/logger.ts";
import { multipartUploadToR2 } from "@/utils/r2/index.ts";

// ** Import config
import { config } from "@/config.ts";

async function main() {
  const mode = Deno.args
    .find((arg) => arg.startsWith("--mode="))
    ?.split("=")[1];
  if (!mode)
    throw new Error("Please specify a mode: --mode=backup or --mode=restore");

  const { BACKUP_DB_URL, RESTORE_DB_URL, BACKUP_DIR } = config;

  const LOCAL_DB_PATH = "db_backups/visions"; // Local database path(local backup location)
  const BACKUP_FILE_NAME = `backup_${Date.now()}.tar`; // File name for R2
  const BACKUP_FILE_PATH = `${LOCAL_DB_PATH}/${BACKUP_FILE_NAME}`; // Local backup file path
  const R2_BUCKET_KEY = `${BACKUP_DIR}/${BACKUP_FILE_NAME}`; // R2 path

  // Ensure the local directory exists
  await ensureDir(LOCAL_DB_PATH);

  if (mode === "backup") {
    // Step 1: Create the backup
    await createBackup(BACKUP_DB_URL, BACKUP_FILE_PATH);

    // Step 2: Upload backup to R2
    await multipartUploadToR2(BACKUP_FILE_PATH, R2_BUCKET_KEY);
  } else if (mode === "restore") {
    await restoreBackup(RESTORE_DB_URL, BACKUP_FILE_PATH);
  } else if (mode === "restore-r2") {
    const r2Key = Deno.args.find((arg) => arg.startsWith("--key="))?.split("=")[1];
    if (!r2Key) throw new Error("Please specify the R2 object key using --key=<key>");
    await restoreBackupFromR2(RESTORE_DB_URL, r2Key);
  } else {
    throw new Error(`Invalid mode: ${mode}`);
  }
}

main().catch((err) => log.error(err.message));
