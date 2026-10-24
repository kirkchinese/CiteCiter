/**
 * Delete one private subtree of a retired Topic directory without following links.
 * @param topicDirectory - the Topic's owned directory; the caller verified its source ownership marker.
 * @param name - `sessions` (the private Session backend, including child Agents) or `workspace` (the snapshot object store).
 */
export declare function removeOwnedTree(topicDirectory: string, name: 'sessions' | 'workspace'): Promise<void>;
/** Delete a retired Topic's private Session backend. The caller must drain the factory first. Never accepts the Host backend root. */
export declare function removeOwnedSessionTree(topicDirectory: string): Promise<void>;
