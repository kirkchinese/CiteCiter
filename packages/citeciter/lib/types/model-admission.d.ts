import type { TopicMetadata } from './topic.ts';
/** Keep an unavailable inherited route visible until the user explicitly replaces it. */
export declare const MODEL_SELECTION_REQUIRED = "\u6765\u6E90\u6A21\u578B\u5DF2\u4E0D\u53EF\u7528\u3002\u8349\u7A3F\u5DF2\u4FDD\u7559\uFF0C\u8BF7\u9009\u62E9\u53EF\u7528\u6A21\u578B\u540E\u53D1\u9001\u3002";
/** A retired catalog entry must not discard a newly created, still empty Topic. Other failures propagate. */
export declare function selectInitialModel(metadata: TopicMetadata, select: () => Promise<unknown>): Promise<void>;
/** Check the durable flag before an explicit submission, without changing permissions or model defaults. */
export declare function requireSelectedModel(metadata: Pick<TopicMetadata, 'modelSelectionRequired'>): void;
