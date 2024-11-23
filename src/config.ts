export const config = {
  BACKUP_DB_URL: Deno.env.get("BACKUP_DB_URL")!,
  RESTORE_DB_URL: Deno.env.get("RESTORE_DB_URL")!,

  BUCKET_NAME: Deno.env.get("BUCKET_NAME")!,
  BACKUP_DIR: Deno.env.get("BACKUP_DIR")!,

  ACCESS_KEY_ID: Deno.env.get("ACCESS_KEY_ID")!,
  SECRET_ACCESS_KEY: Deno.env.get("SECRET_ACCESS_KEY")!,
  ACCOUNT_ID: Deno.env.get("ACCOUNT_ID")!,
};

// Not in use
export const backup_policies = {
  daily: {
    frequency_hours: 24,
    retain_days: 6,
  },
  weekly: {
    frequency_hours: 168,
    retain_days: 30,
  },
  monthly: {
    frequency_hours: 720,
    retain_days: 90,
  },
};
