import { rename } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
/**
 * Atomically replace an owned file, tolerating brief Windows sharing conflicts.
 * @param temporary - complete temporary file in the destination directory.
 * @param destination - ownership-validated target; callers serialize its writes.
 * @throws The last filesystem error after at most 620ms of retry delays. Other
 * errors and non-Windows failures propagate immediately. Neither file is deleted
 * here; callers retain responsibility for temporary-file cleanup.
 */
export async function atomicReplace(temporary, destination) {
    for (let attempt = 0;; attempt++) {
        try {
            await rename(temporary, destination);
            return;
        }
        catch (error) {
            const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
            if (process.platform !== 'win32' || attempt >= 5 || !['EPERM', 'EACCES', 'EBUSY'].includes(String(code)))
                throw error;
            await delay(20 * 2 ** attempt);
        }
    }
}
