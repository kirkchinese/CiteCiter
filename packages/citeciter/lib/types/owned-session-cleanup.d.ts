/** Delete a retired Topic's private backend, including its child Agents. The caller must drain the factory and verify its source ownership marker first. Never accepts the Host backend root. */
export declare function removeOwnedSessionTree(topicDirectory: string): Promise<void>;
