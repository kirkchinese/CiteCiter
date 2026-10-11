import type { ActionModel } from '../../actions.ts';
import type { ProviderOption } from '../../topic.ts';
/**
 * Model select for settings rows; the row supplies the visible label.
 * Model identities are encoded together, so provider-local model IDs never collide.
 */
export declare function ModelChoice({ providers, value, onChange, disabled, label, className }: {
    providers: readonly ProviderOption[];
    value: ActionModel | undefined;
    onChange: (value: ActionModel | undefined) => void;
    disabled?: boolean;
    label: string;
    className?: string | undefined;
}): import("react").JSX.Element;
