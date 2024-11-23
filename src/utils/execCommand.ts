// ** Import utils
import { log } from "@/utils/logger.ts";

/**
 * Executes a shell command using Deno.Command.
 * @param command - The shell command to execute.
 */
export async function execCommand(command: string): Promise<void> {
  // Split the command into parts for proper execution
  const process = new Deno.Command("sh", {
    args: ["-c", command],
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  const { success, stdout, stderr } = await process.output();

  if (!success) {
    const errorString = new TextDecoder().decode(stderr);
    throw new Error(`Command failed: ${errorString}`);
  }

  const outputString = new TextDecoder().decode(stdout);
  log.debug("Command output str:", outputString); // Log the standard output if needed
}
