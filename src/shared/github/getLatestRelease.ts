/**
 * Response from GitHub API for releases
 */
export interface GitHubRelease {
  /** Release tag name (version) */
  tag_name: string;
  /** Release name/title */
  name: string;
  /** Whether this is a prerelease */
  prerelease: boolean;
  /** Whether this is a draft */
  draft: boolean;
  /** Release creation date */
  created_at: string;
  /** Release publication date */
  published_at: string;
}

/**
 * Parameters for getting the latest release
 */
export interface GetLatestReleaseParams {
  /** Repository owner/organization name */
  owner: string;
  /** Repository name */
  repo: string;
  /** Whether to include prereleases (default: false) */
  includePrereleases?: boolean;
}

/**
 * Gets the latest release version from a GitHub repository using the GitHub API.
 * 
 * @param params - Parameters for fetching the latest release
 * @returns Promise that resolves to the latest release tag name
 * @throws Error if the API request fails or no releases are found
 * 
 * @example
 * ```typescript
 * const latestVersion = await getLatestRelease({
 *   owner: "angular",
 *   repo: "angular"
 * });
 * console.log(latestVersion); // "20.0.0"
 * ```
 */
export async function getLatestRelease(params: GetLatestReleaseParams): Promise<string> {
  const { owner, repo, includePrereleases = false } = params;
  
  try {
    let url: string;
    
    if (includePrereleases) {
      // Get all releases and filter manually
      url = `https://api.github.com/repos/${owner}/${repo}/releases`;
    } else {
      // Use GitHub's latest endpoint (excludes prereleases and drafts)
      url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    }
    
    console.log(`Fetching latest release for ${owner}/${repo}...`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Friendly-Docs-Generator'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
    }
    
    if (includePrereleases) {
      const releases = await response.json() as GitHubRelease[];
      
      if (!releases || releases.length === 0) {
        throw new Error(`No releases found for ${owner}/${repo}`);
      }
      
      // Find the latest non-draft release (may include prereleases)
      const latestRelease = releases.find(release => !release.draft);
      
      if (!latestRelease) {
        throw new Error(`No non-draft releases found for ${owner}/${repo}`);
      }
      
      console.log(`Latest release found: ${latestRelease.tag_name} (prerelease: ${latestRelease.prerelease})`);
      return latestRelease.tag_name;
    } else {
      const release = await response.json() as GitHubRelease;
      
      if (!release || !release.tag_name) {
        throw new Error(`Invalid release data received for ${owner}/${repo}`);
      }
      
      console.log(`Latest stable release found: ${release.tag_name}`);
      return release.tag_name;
    }
  } catch (error) {
    console.error(`Failed to fetch latest release for ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Gets the latest stable release version (excludes prereleases and drafts).
 * This is a convenience function that calls getLatestRelease with includePrereleases=false.
 * 
 * @param owner - Repository owner/organization name
 * @param repo - Repository name
 * @returns Promise that resolves to the latest stable release tag name
 */
export async function getLatestStableRelease(owner: string, repo: string): Promise<string> {
  return getLatestRelease({ owner, repo, includePrereleases: false });
}

/**
 * Gets the latest release version (may include prereleases).
 * This is a convenience function that calls getLatestRelease with includePrereleases=true.
 * 
 * @param owner - Repository owner/organization name  
 * @param repo - Repository name
 * @returns Promise that resolves to the latest release tag name
 */
export async function getLatestAnyRelease(owner: string, repo: string): Promise<string> {
  return getLatestRelease({ owner, repo, includePrereleases: true });
}