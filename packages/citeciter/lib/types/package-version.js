import parse from 'semver/functions/parse.js';
/** Accept canonical package versions, including prerelease and build identifiers, without coercion. */
function parsePackageVersion(version) {
    const parsed = parse(version);
    if (parsed === null)
        return null;
    const canonical = parsed.version + (parsed.build.length > 0 ? `+${parsed.build.join('.')}` : '');
    return canonical === version ? parsed : null;
}
/** Validate an exact package version, not an npm tag, range or CLI argument. */
export function isPackageVersion(version) {
    return parsePackageVersion(version) !== null;
}
/**
 * Compare complete package versions using npm SemVer precedence; build metadata does not affect order.
 * @param installed - installed package version.
 * @param available - version selected by the registry tag; it may be a prerelease.
 * @returns negative, zero or positive, or null when either input is not a canonical package version.
 */
export function comparePackageVersions(installed, available) {
    const left = parsePackageVersion(installed);
    const right = parsePackageVersion(available);
    if (left === null || right === null)
        return null;
    const result = left.compare(right);
    return result < 0 ? -1 : result > 0 ? 1 : 0;
}
