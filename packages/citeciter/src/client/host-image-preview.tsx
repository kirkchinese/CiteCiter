import { ImageLightbox } from '@deepseek-ai/dsh-client-ui-primitives'
import { t, useLocale } from './i18n.ts'
import './host-image-preview.module.css'

interface PreviewProps { readonly src: string; readonly alt: string; readonly onClose: () => void }

/** Preview an authorized object URL using the host lifecycle and caption clearance; the caller retains URL ownership. */
export function HostImagePreview({ src, alt, onClose }: PreviewProps) {
  useLocale()
  return <ImageLightbox src={src} alt={alt} onClose={onClose} labels={{ dialog: t('transcript.image.dialog', { alt }), close: t('transcript.image.close') }} />
}
