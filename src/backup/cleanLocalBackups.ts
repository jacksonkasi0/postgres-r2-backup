import { log } from "@/utils/logger.ts";

/**
 * Cleans up old local backups.
 * @param backupDir - The local backup directory.
 * @param maxDays - The maximum number of days to retain backups.
 * @param keepLocalBackup - A boolean to determine if local backups should be retained.
 */
export async function cleanLocalBackups(
  backupDir: string,
  maxDays: number,
  keepLocalBackup: boolean
): Promise<void> {
  log.info("Cleaning up local backups...");

  if (!keepLocalBackup) {
    for await (const entry of Deno.readDir(backupDir)) {
      const filePath = `${backupDir}/${entry.name}`;
      try {
        await Deno.remove(filePath);
        log.info(`Deleted all local backup file: ${entry.name}`);
      } catch (error: unknown) {
        log.error(`Failed to delete: ${filePath}. Error: ${error}`);
      }
    }
    log.success("All local backups deleted.");
    return;
  }

  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - maxDays);

  for await (const entry of Deno.readDir(backupDir)) {
    const filePath = `${backupDir}/${entry.name}`;
    try {
      const fileStat = await Deno.stat(filePath);
      const fileDate = new Date(fileStat.mtime ?? new Date());

      if (fileDate < thresholdDate) {
        await Deno.remove(filePath);
        log.info(`Deleted old local backup: ${entry.name}`);
      }
    } catch (error: unknown) {
      log.error(`Failed to process backup file: ${filePath}. Error: ${error}`);
    }
  }

  log.success("Local backup cleanup completed.");
}
