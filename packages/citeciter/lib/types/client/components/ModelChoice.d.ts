import type { ActionModel } from '../../actions.ts';
import type { ProviderOption } from '../../topic.ts';
/** Model identities are encoded together, so provider-local model IDs never collide. */
export declare function ModelChoice({ providers, value, onChange, disabled, label }: {
    providers: readonly ProviderOption[];
    value: ActionModel | undefined;
    onChange: (value: ActionModel | undefined) => void;
    disabled?: boolean;
    label?: string;
}): import("react").JSX.Element;
