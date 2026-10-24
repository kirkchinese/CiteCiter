import type { TopicUsage as TopicUsageValue } from '../../topic.ts';
/** Present Topic-owned token totals without fetching state or mutating the panel. */
export declare function TopicUsage({ usage }: {
    readonly usage?: TopicUsageValue;
}): import("react").JSX.Element | null;
