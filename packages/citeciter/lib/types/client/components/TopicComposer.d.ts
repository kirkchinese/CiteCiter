import { type FormEvent, type Ref, type ReactNode } from 'react';
import type { ProviderOption, TopicModelConfig } from '../../topic.ts';
import type { CompanionPhase } from '../companion-controller.ts';
import { type PermissionMode } from './PermissionControl.tsx';
import type { DeliveryMode } from '../native-composer.ts';
import type { DraftReference } from '../draft-references.ts';
/**
 * Render the Topic draft and its submission controls without accessing services.
 * @param props - controlled draft, model route, request state and user-action callbacks.
 * @returns one form; model changes and sending remain owned by the Topic controller.
 */
export declare function TopicComposer({ question, placeholder, route, providers, phase, canSend, routeSaving, folded, inputRef, onExpand, onQuestion, onSubmit, onStop, onModel, onReasoning, attachments, permission, onPermission, onFiles, delivery, onDelivery, sources, onReference }: {
    readonly sources: readonly DraftReference[];
    readonly onReference: (reference: DraftReference) => void;
    readonly permission: PermissionMode;
    readonly onPermission: (mode: PermissionMode) => void;
    readonly onFiles: (files: readonly File[]) => void;
    readonly delivery: DeliveryMode;
    readonly onDelivery: (mode: DeliveryMode) => void;
    readonly attachments?: ReactNode;
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
    readonly onSubmit: (event: FormEvent, mode?: DeliveryMode) => void;
    readonly onStop: () => void;
    readonly onModel: (provider: string, model: string) => void;
    readonly onReasoning: (effort: string | null) => void;
}): import("react").JSX.Element;
