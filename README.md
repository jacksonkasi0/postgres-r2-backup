# PostgreSQL DB Backup & Restore via Docker & Deno

This project provides a system to automate the backup and restore of a PostgreSQL database using **Deno**, **Docker**, and **Cloudflare R2**. It supports local backups, restoring from local files, and restoring directly from Cloudflare R2.

---

## **Technologies Used**

- **Deno**: Runtime for the scripts and automation.
- **Docker**: Containerization for portable backup/restore workflows.
- **PostgreSQL**: Database used for backups and restores.
- **PostgreSQL 16 Client**: Installed in the container for backup and restore operations. *(Note: Update the `postgresql<x>-client` version in the Dockerfile if your database uses a different version.)*
- **Cloudflare R2**: Object storage for storing backup files.
- **Winston**: Logging library for structured and color-coded logs.
- **pg_restore**: PostgreSQL's native tool for restoring database dumps.
- **Cronie**: Lightweight cron daemon for scheduling backup and restore tasks in the container.

## **Getting Started**

### **Requirements**

1. **Deno** installed ([Install Guide](https://deno.land/manual/getting_started/installation)).
2. **Docker** installed ([Install Guide](https://docs.docker.com/get-docker/)).
3. A `.env` file in the root directory containing:

   ```env
   AUTOMATIC_BACKUP=If set to `true`, it will trigger a cron job to perform a backup.
   BACKUP_DB_URL=your_postgresql_connection_url
   RESTORE_DB_URL=your_postgresql_connection_url
   ACCESS_KEY_ID=your_r2_access_key_id
   SECRET_ACCESS_KEY=your_r2_secret_access_key
   BACKUP_DIR=your_r2_bucket_db_backup_dir
   ACCOUNT_ID=your_r2_account_id
   BUCKET_NAME=your_r2_bucket_name
   ```

4. **Cloudflare R2** storage setup with appropriate access credentials.

---

## **Available Tasks**

### **Backup Task**

Creates a backup of the database and uploads it to Cloudflare R2.

**Command:**

```sh
deno task run:backup
```

**Process:**

1. Generates a backup file in the local `db_backups/<folder>` directory.
2. Uploads the backup to the specified Cloudflare R2 bucket.

---

### **Restore Task**

Restores the database from a local backup file.

**Command:**

```sh
deno task run:restore
```

**Process:**

1. Restores the database from a specified local backup file.
2. Ensure the local backup file exists in the `db_backups/<folder>` directory.

---

### **Restore From R2 Task**

Restores the database by downloading a backup file from Cloudflare R2.

**Command:**

```sh
deno task run:restore-r2 --key=backups/<folder>/backup_1732266xxxxxx.tar
```

**Process:**

1. Downloads the specified backup file from Cloudflare R2 to a temporary location.
2. Restores the database using the downloaded file.
3. Deletes the temporary file after restoring.

---

### **Automate Task**

Automates the backup process, including uploading to R2 and cleanup.

**Command:**

```sh
deno task automate
```

**Process:**

1. Creates a backup of the database.
2. Uploads the backup file to Cloudflare R2.
3. Cleans up local backup files older than the retention period.
4. Deletes old R2 backups based on the retention policy.

---

### **Restore From R2 Task (Script)**

Runs the restore process from R2 using Docker for containerized execution.

**Setup:**

1. Set `RESTORE_DB_URL` in the `.env` file.
2. Modify the `run_restore.sh` script to include the desired R2 object key.

**Command:**

```sh
chmod +x run_restore.sh
./run_restore.sh
```

**Process:**

1. Builds and runs a Docker container using `Dockerfile.restore`.
2. Passes environment variables and R2 object key to the container.
3. Restores the database and removes the temporary container after completion.

---

## **Folder Structure**

```plaintext
.
├── .dockerignore             # Specifies files and directories to ignore in Docker builds
├── .env                      # Environment variables file
├── .env.example              # Example environment variables file
├── .vscode/
│   └── settings.json         # VS Code-specific configuration
├── deno.json                 # Deno configuration and tasks
├── deno.lock                 # Dependency lock file for Deno
├── Dockerfile.backup         # Dockerfile for the backup container
├── Dockerfile.restore        # Dockerfile for the restore container
├── railway.toml              # Railway platform configuration for deployment
├── README.md                 # Documentation
├── run_automate.sh           # Script to trigger automate task
├── run_restore.sh            # Script to trigger restore from R2 task via Docker
├── start.sh                  # Startup script for cron-based backups
├── src/
│   ├── backup/               # Backup-related functionality
│   │   ├── cleanCloudBackups.ts  # Cleans up old backups from R2
│   │   ├── cleanLocalBackups.ts  # Cleans up old backups locally
│   │   └── createBackup.ts       # Logic to create a PostgreSQL backup
│   ├── restore/              # Restore-related functionality
│   │   └── restoreBackup.ts      # Logic to restore a PostgreSQL backup
│   ├── utils/                # Utility functions and helpers
│   │   ├── r2/
│   │   │   ├── cloudflareR2.ts   # Cloudflare R2 integration logic
│   │   │   ├── index.ts          # R2 helper functions
│   │   │   └── multipartUploadToR2.ts  # Logic for multipart uploads to R2
│   │   ├── execCommand.ts     # Helper for executing shell commands
│   │   └── logger.ts          # Custom logger with color-coded log levels
│   ├── config.ts              # Configuration file for environment variables
│   ├── index.ts               # Entry point for backup/restore tasks
│   └── automate.ts            # Automation script for scheduled backups
```

---

## **Environment Variables**

Ensure the following environment variables are defined in the `.env` file:

```env
# PostgreSQL Connection URLs
BACKUP_DB_URL=your_postgresql_backup_url
RESTORE_DB_URL=your_postgresql_restore_url

# Cloudflare R2 Configuration
ACCESS_KEY_ID=your_r2_access_key_id
SECRET_ACCESS_KEY=your_r2_secret_access_key
ACCOUNT_ID=your_r2_account_id
BUCKET_NAME=your_r2_bucket_name
```

---

## **Cron Integration**

To automate backups with cron:

1. Add the `deno task automate` command to your crontab file.
2. Example entry for a daily backup at midnight:

   ```cron
   0 0 * * * deno task automate >> /var/log/db_backup.log 2>&1
   ```

---

## **Additional Notes**

- Automatic backup is configured in `Dockerfile.backup`. It is designed for deployment on the **Railway.app** platform via the `railway.toml` file to enable automatic PostgreSQL backups. If you are using a different platform, update the configuration to run `Dockerfile.backup` by default.
- Ensure your R2 bucket permissions allow read and write operations.
- Use the `run_restore.sh` script for containerized restore processes.
- For schema-specific restores, customize the `restoreBackup.ts` function as needed.
