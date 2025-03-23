import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

/**
 * Parameters for cloning a GitHub repository
 */
export type CloneRepositoryParams = {
  /** Repository owner/organization name */
  owner: string;
  /** Repository name */
  repo: string;
  /** Version, tag, or branch to clone */
  version: string;
  /** Directory where the repository will be cloned */
  targetDir: string;
  /** Clone depth (use 1 for shallow clone, omit for full clone) */
  depth?: number;
};

/**
 * Clones a GitHub repository with the specified parameters.
 * If the target directory already exists, skips cloning.
 * 
 * @param params - The parameters for cloning the repository
 * @returns Promise that resolves when the cloning process completes
 * @throws Error if cloning fails
 * 
 * @example
 * ```typescript
 * await cloneRepository({
 *   owner: "angular",
 *   repo: "angular",
 *   version: "19.2.2",
 *   targetDir: "./cloned-repos/angular-19.2.2",
 *   depth: 1
 * });
 * ```
 */
export async function cloneRepository(params: CloneRepositoryParams): Promise<void> {
  const { owner, repo, version, targetDir, depth } = params;
  const execAsync = promisify(exec);
  
  // Create parent directory if it doesn't exist
  if (!fs.existsSync(path.dirname(targetDir))) {
    fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  }
  
  // Skip cloning if target directory already exists
  if (fs.existsSync(targetDir)) {
    console.log(`Target directory already exists, skipping clone: ${targetDir}`);
    return;
  }
  
  // Build git clone command
  let cloneCommand = `git clone`;
  
  // Add depth parameter if specified
  if (depth !== undefined) {
    cloneCommand += ` --depth ${depth}`;
  }
  
  // Add branch/tag parameter if version is specified
  if (version) {
    cloneCommand += ` --branch ${version}`;
  }
  
  // Add repository URL and target directory
  cloneCommand += ` https://github.com/${owner}/${repo}.git ${targetDir}`;
  
  // Clone the repository
  console.log(`Cloning ${owner}/${repo} repository (version ${version})...`);
  try {
    await execAsync(cloneCommand);
    console.log(`Successfully cloned ${owner}/${repo} repository to ${targetDir}`);
  } catch (error) {
    console.error(`Failed to clone ${owner}/${repo} repository: ${error}`);
    throw error;
  }
}
