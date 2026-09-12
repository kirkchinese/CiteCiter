import type { FormEvent, Ref } from 'react';
import type { ProviderOption, TopicModelConfig } from '../../topic.ts';
import type { CompanionPhase } from '../companion-controller.ts';
/**
 * Render the Topic draft and its submission controls without accessing services.
 * @param props - controlled draft, model route, request state and user-action callbacks.
 * @returns one form; model changes and sending remain owned by the Topic controller.
 */
export declare function TopicComposer({ question, placeholder, route, providers, phase, canSend, routeSaving, folded, inputRef, onExpand, onQuestion, onSubmit, onStop, onModel, onReasoning }: {
    readonly question: string;
    readonly placeholder: string;
    readonly route: TopicModelConfig | undefined;
    readonly providers: readonly ProviderOption[];
    readonly phase: CompanionPhase;
    readonly canSend: boolean;
    readonly routeSaving: boolean;
    readonly folded: boolean;
    readonly inputRef: Ref<HTMLTextAreaElement>;
    readonly onExpand: () => void;
    readonly onQuestion: (question: string) => void;
    readonly onSubmit: (event: FormEvent) => void;
    readonly onStop: () => void;
    readonly onModel: (provider: string, model: string) => void;
    readonly onReasoning: (effort: string | null) => void;
}): import("react").JSX.Element;
