import type { ProviderOption, TopicModelConfig } from '../../topic.ts';
/**
 * Render compact, keyboard-accessible model controls inside the Topic composer.
 * @param props - current route, available models, save state and business callbacks.
 * @returns reasoning on the left and a provider-qualified model selector on the right.
 */
export declare function TopicModelControls({ providers, route, saving, onModel, onReasoning }: {
    readonly providers: readonly ProviderOption[];
    readonly route: TopicModelConfig;
    readonly saving: boolean;
    readonly onModel: (provider: string, model: string) => void;
    readonly onReasoning: (effort: string | null) => void;
}): import("react").JSX.Element;
