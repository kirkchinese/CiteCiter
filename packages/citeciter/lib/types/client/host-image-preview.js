import { jsx as _jsx } from "react/jsx-runtime";
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives';
import css from './components/MessageAttachments.module.css';
// 0.1.5 does not export ImageLightbox. Resolve it from the public module table
// without a named import that would prevent the older client from loading.
const NativeLightbox = primitives.ImageLightbox;
/** Preview an existing authorized object URL in the host UI; the caller retains URL ownership. */
export function HostImagePreview({ src, alt, onClose }) {
    if (NativeLightbox !== undefined)
        return _jsx(NativeLightbox, { src: src, alt: alt, onClose: onClose, labels: { dialog: `图片预览：${alt}`, close: '关闭图片预览' } });
    return _jsx(primitives.Modal, { open: true, title: `图片预览：${alt}`, closeLabel: "\u5173\u95ED\u56FE\u7247\u9884\u89C8", onClose: onClose, className: css.legacyPreview, children: _jsx("img", { className: css.previewImage, src: src, alt: alt }) });
}
