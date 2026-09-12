import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './TopicModelControls.module.css';
/**
 * Render compact, keyboard-accessible model controls inside the Topic composer.
 * @param props - current route, available models, save state and business callbacks.
 * @returns reasoning on the left and a provider-qualified model selector on the right.
 */
export function TopicModelControls({ providers, route, saving, onModel, onReasoning }) {
    const model = providers.find(provider => provider.id === route.provider)?.models.find(model => model.id === route.model);
    const name = model?.name ?? `${route.provider} / ${route.model}`;
    const effort = model?.reasoningEfforts.find(effort => effort.id === route.reasoningEffort)?.name ?? '默认思考';
    return _jsxs("div", { className: css.controls, children: [model !== undefined && model.reasoningEfforts.length > 0 && _jsxs("label", { className: css.choice, title: `思考强度：${effort}`, children: [_jsx("span", { "aria-hidden": "true", children: effort }), _jsx("span", { className: css.chevron, "aria-hidden": "true" }), _jsxs("select", { "aria-label": "\u601D\u8003\u5F3A\u5EA6", value: route.reasoningEffort ?? '', disabled: saving, onChange: event => onReasoning(event.currentTarget.value || null), children: [_jsx("option", { value: "", children: "\u6A21\u578B\u9ED8\u8BA4\u601D\u8003" }), model.reasoningEfforts.map(effort => _jsx("option", { value: effort.id, children: effort.name }, effort.id))] })] }), _jsxs("label", { className: `${css.choice} ${css.model}`, title: saving ? '正在保存模型设置…' : name, children: [_jsx("span", { "aria-hidden": "true", children: name }), _jsx("span", { className: css.chevron, "aria-hidden": "true" }), _jsxs("select", { "aria-label": "CiteCiter \u6A21\u578B", value: JSON.stringify([route.provider, route.model]), disabled: saving, onChange: event => {
                            const [provider, model] = JSON.parse(event.currentTarget.value);
                            onModel(provider, model);
                        }, children: [model === undefined && _jsxs("option", { value: JSON.stringify([route.provider, route.model]), children: [name, "\uFF08\u6682\u4E0D\u53EF\u7528\uFF09"] }), providers.map(provider => _jsx("optgroup", { label: provider.name, children: provider.models.map(model => _jsx("option", { value: JSON.stringify([provider.id, model.id]), children: model.name }, model.id)) }, provider.id))] })] })] });
}
