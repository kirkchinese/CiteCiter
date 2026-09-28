import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'
import type { ComponentType } from 'react'
import css from './components/MessageAttachments.module.css'

interface PreviewProps { readonly src: string; readonly alt: string; readonly onClose: () => void }
interface LightboxProps extends PreviewProps { readonly labels: { dialog: string; close: string } }

// 0.1.5 does not export ImageLightbox. Resolve it from the public module table
// without a named import that would prevent the older client from loading.
const NativeLightbox = (primitives as unknown as { ImageLightbox?: ComponentType<LightboxProps> }).ImageLightbox

/** Preview an existing authorized object URL in the host UI; the caller retains URL ownership. */
export function HostImagePreview({ src, alt, onClose }: PreviewProps) {
  if (NativeLightbox !== undefined) return <NativeLightbox src={src} alt={alt} onClose={onClose} labels={{ dialog: `图片预览：${alt}`, close: '关闭图片预览' }} />
  return <primitives.Modal open title={`图片预览：${alt}`} closeLabel="关闭图片预览" onClose={onClose} className={css.legacyPreview!}>
    <img className={css.previewImage} src={src} alt={alt} />
  </primitives.Modal>
}
