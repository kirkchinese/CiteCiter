import { ImageLightbox } from '@deepseek-ai/dsh-client-ui-primitives'
import './host-image-preview.module.css'

interface PreviewProps { readonly src: string; readonly alt: string; readonly onClose: () => void }

/** Preview an authorized object URL using the host lifecycle and caption clearance; the caller retains URL ownership. */
export function HostImagePreview({ src, alt, onClose }: PreviewProps) {
  return <ImageLightbox src={src} alt={alt} onClose={onClose} labels={{ dialog: `CiteCiter 图片预览：${alt}`, close: '关闭图片预览' }} />
}
