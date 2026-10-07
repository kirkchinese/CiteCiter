import { jsx as _jsx } from "react/jsx-runtime";
import { ImageLightbox } from '@deepseek-ai/dsh-client-ui-primitives';
/** Preview an authorized object URL in the official host UI; the caller retains URL ownership. */
export function HostImagePreview({ src, alt, onClose }) {
    return _jsx(ImageLightbox, { src: src, alt: alt, onClose: onClose, labels: { dialog: `图片预览：${alt}`, close: '关闭图片预览' } });
}
