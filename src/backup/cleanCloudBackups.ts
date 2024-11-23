import { listR2Objects, deleteR2Object } from "@/utils/r2/index.ts";
import { log } from "@/utils/logger.ts";

/**
 * Cleans up old backups from Cloudflare R2.
 * @param retainDays - The maximum number of days to retain backups in R2.
 */
export async function cleanCloudBackups(retainDays: number): Promise<void> {
  log.info("Cleaning up Cloudflare R2 backups...");
  
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - retainDays);

  const objects = await listR2Objects();
  for (const key of objects) {
    const dateMatch = key.match(/backup_(\d+)\.tar/);
    if (dateMatch) {
      const timestamp = parseInt(dateMatch[1]);
      if (timestamp < thresholdDate.getTime()) {
        await deleteR2Object(key);
        log.info(`Deleted old Cloudflare R2 backup: ${key}`);
      }
    }
  }
  
  log.success("Cloudflare R2 backup cleanup completed.");
}
