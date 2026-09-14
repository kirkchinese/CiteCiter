import type { NativeComposer } from '../native-composer.ts';
/** Read and mutate the Host's authoritative inbox. Citer never owns a second queue. */
export declare function NativeQueue({ sessionId, native }: {
    readonly sessionId: string;
    readonly native: NativeComposer;
}): import("react").JSX.Element | null;
