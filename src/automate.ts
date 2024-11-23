// ** Import deno standard library
import { ensureDir } from "@std/fs";

// ** Import config
import { config } from "@/config.ts";

// ** Import functions
import { createBackup } from "@/backup/createBackup.ts";

// ** Import utils
import { log } from "@/utils/logger.ts";
import { multipartUploadToR2 } from "@/utils/r2/index.ts";

// ** Import cleanup functions
import { cleanLocalBackups } from "@/backup/cleanLocalBackups.ts";
import { cleanCloudBackups } from "@/backup/cleanCloudBackups.ts";

async function automateBackup() {
  const { BACKUP_DB_URL, BACKUP_DIR } = config;

  const automaticBackup = Deno.env.get("AUTOMATIC_BACKUP") === "true";
  if (!automaticBackup) {
    log.info("AUTOMATIC_BACKUP is not enabled. Exiting...");
    return;
  }

  const LOCAL_DB_PATH = "db_backups/visions"; // Local database path(local backup location)
  const BACKUP_FILE_NAME = `backup_${Date.now()}.tar`; // File name for R2
  const BACKUP_FILE_PATH = `${LOCAL_DB_PATH}/${BACKUP_FILE_NAME}`; // Local backup file path
  const R2_BUCKET_KEY = `${BACKUP_DIR}/${BACKUP_FILE_NAME}`; // R2 path

  // Ensure the local directory exists
  await ensureDir(LOCAL_DB_PATH);

  // Step 1: Create the backup
  await createBackup(BACKUP_DB_URL, BACKUP_FILE_PATH);

  // Step 2: Upload backup to R2
  await multipartUploadToR2(BACKUP_FILE_PATH, R2_BUCKET_KEY);

  // Step 3: Clean old local backups
  const LOCAL_RETAIN_DAYS = 7; // Retain local backups for 7 days
  const KEEP_LOCAL_BACKUP = false; // Toggle to delete all or retain based on maxDays
  await cleanLocalBackups(LOCAL_DB_PATH, LOCAL_RETAIN_DAYS, KEEP_LOCAL_BACKUP);

  // Step 4: Clean old Cloudflare R2 backups
  const CLOUD_RETAIN_DAYS = 30; // Retain Cloud backups for 30 days
  await cleanCloudBackups(CLOUD_RETAIN_DAYS);

  log.success("Automated backup completed.");
}

automateBackup().catch((err) => {
  log.error(`Error during automated backup: ${err.message}`);
});
