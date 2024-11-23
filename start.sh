#!/bin/bash

# Create the cron log file if it doesn't exist
touch /var/log/cron.log

# Export environment variables for cron jobs
printenv | grep -v "no_proxy" | sed 's/^/export /' > /etc/environment

# Start cron service in the background
echo "Starting cron service..."
crond -f > /var/log/cron.log 2>&1 &

# Run the initial task (optional)
echo "Running initial backup task..."
deno task automate

# Keep the container running by tailing cron logs
echo "Tailing cron logs..."
tail -f /var/log/cron.log
