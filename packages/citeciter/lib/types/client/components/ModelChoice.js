import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './ActionWheel.module.css';
/** Model identities are encoded together, so provider-local model IDs never collide. */
export function ModelChoice({ providers, value, onChange, disabled = false, label = '处理模型' }) {
    const encoded = value === undefined ? '' : JSON.stringify([value.provider, value.model]);
    const known = providers.some(provider => provider.id === value?.provider && provider.models.some(model => model.id === value.model));
    return _jsxs("label", { className: css.field, children: [label, _jsxs("select", { "aria-label": label, disabled: disabled, value: encoded, onChange: event => {
                    if (event.currentTarget.value === '')
                        onChange(undefined);
                    else {
                        const [provider, model] = JSON.parse(event.currentTarget.value);
                        onChange({ provider, model });
                    }
                }, children: [_jsx("option", { value: "", children: "\u8DDF\u968F\u6765\u6E90\u4F1A\u8BDD\u6A21\u578B" }), value !== undefined && !known && _jsxs("option", { value: encoded, children: [value.provider, " / ", value.model, "\uFF08\u6682\u4E0D\u53EF\u7528\uFF09"] }), providers.map(provider => _jsx("optgroup", { label: provider.name, children: provider.models.map(model => _jsx("option", { value: JSON.stringify([provider.id, model.id]), children: model.name }, model.id)) }, provider.id))] })] });
}
