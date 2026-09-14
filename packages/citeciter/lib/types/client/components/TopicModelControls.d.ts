import type { ProviderOption, TopicModelConfig } from '../../topic.ts';
/** Model and reasoning hierarchy. Route changes are committed by the injected controller. */
export declare function TopicModelControls({ providers, route, saving, onModel, onReasoning }: {
    readonly providers: readonly ProviderOption[];
    readonly route: TopicModelConfig;
    readonly saving: boolean;
    readonly onModel: (provider: string, model: string) => void;
    readonly onReasoning: (effort: string | null) => void;
}): import("react").JSX.Element;
