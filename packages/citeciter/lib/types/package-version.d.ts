/** Validate an exact package version, not an npm tag, range or CLI argument. */
export declare function isPackageVersion(version: string): boolean;
/**
 * Compare complete package versions using npm SemVer precedence; build metadata does not affect order.
 * @param installed - installed package version.
 * @param available - version selected by the registry tag; it may be a prerelease.
 * @returns negative, zero or positive, or null when either input is not a canonical package version.
 */
export declare function comparePackageVersions(installed: string, available: string): -1 | 0 | 1 | null;
