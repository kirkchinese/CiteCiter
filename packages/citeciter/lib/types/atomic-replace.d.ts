/**
 * Atomically replace an owned file, tolerating brief Windows sharing conflicts.
 * @param temporary - complete temporary file in the destination directory.
 * @param destination - ownership-validated target; callers serialize its writes.
 * @throws The last filesystem error after at most 620ms of retry delays. Other
 * errors and non-Windows failures propagate immediately. Neither file is deleted
 * here; callers retain responsibility for temporary-file cleanup.
 */
export declare function atomicReplace(temporary: string, destination: string): Promise<void>;
