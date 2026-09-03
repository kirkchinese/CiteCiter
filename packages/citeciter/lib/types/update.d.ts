/** Bounded, read-only npm update check for the Web plugin. */
import { z } from 'zod';
/** Fixed registry document used to resolve the installable `latest` version. */
export declare const CITECITER_NPM_LATEST_URL: "https://registry.npmjs.org/@kirkchinese%2fdsh-citeciter/latest";
/** Successful checks remain fresh for six hours in one Host process. */
export declare const UPDATE_CHECK_TTL_MS: number;
/** Stable failure identifiers consumed by the Web settings and notification UI. */
export declare const updateCheckErrorCodeSchema: z.ZodEnum<{
    "installed-version-invalid": "installed-version-invalid";
    "registry-timeout": "registry-timeout";
    "registry-network": "registry-network";
    "registry-http": "registry-http";
    "registry-response-too-large": "registry-response-too-large";
    "registry-response-invalid": "registry-response-invalid";
    "registry-version-invalid": "registry-version-invalid";
}>;
/** Failure identifier returned instead of exposing transport-specific messages. */
export type UpdateCheckErrorCode = z.infer<typeof updateCheckErrorCodeSchema>;
/** Strict result of one read-only npm `latest` check. */
export declare const updateCheckResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"success">;
    installedVersion: z.ZodString;
    latestVersion: z.ZodString;
    updateAvailable: z.ZodBoolean;
    checkedAt: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"error">;
    code: z.ZodEnum<{
        "installed-version-invalid": "installed-version-invalid";
        "registry-timeout": "registry-timeout";
        "registry-network": "registry-network";
        "registry-http": "registry-http";
        "registry-response-too-large": "registry-response-too-large";
        "registry-response-invalid": "registry-response-invalid";
        "registry-version-invalid": "registry-version-invalid";
    }>;
    checkedAt: z.ZodNumber;
}, z.core.$strict>], "kind">;
/** Browser-facing update result; this operation never installs or restarts anything. */
export type UpdateCheckResponse = z.infer<typeof updateCheckResponseSchema>;
/**
 * Compare stable versions without accepting prerelease or build suffixes.
 * @param left - first candidate version.
 * @param right - second candidate version.
 * @returns negative, zero, or positive for valid versions; otherwise `null`.
 */
export declare function compareStableVersions(left: string, right: string): -1 | 0 | 1 | null;
/** Per-Host update checker with bounded I/O and a successful-result TTL cache. */
export declare class UpdateChecker {
    private readonly fetchImpl;
    private readonly now;
    private readonly installedVersion;
    private cached;
    private inFlight;
    /**
     * @param fetchImpl - HTTPS transport; injectable for deterministic tests.
     * @param now - wall-clock provider used for response timestamps and cache expiry.
     * @param installedVersion - installed package-version reader.
     */
    constructor(fetchImpl?: typeof globalThis.fetch, now?: () => number, installedVersion?: () => Promise<string>);
    /**
     * Read npm's installable latest version without mutating the installation.
     * @param callerSignal - Remote caller cancellation.
     * @returns a strict success or stable classified failure.
     */
    check(callerSignal: AbortSignal): Promise<UpdateCheckResponse>;
    private checkFresh;
}
