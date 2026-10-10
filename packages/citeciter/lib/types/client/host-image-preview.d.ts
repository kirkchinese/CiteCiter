import './host-image-preview.module.css';
interface PreviewProps {
    readonly src: string;
    readonly alt: string;
    readonly onClose: () => void;
}
/** Preview an authorized object URL using the host lifecycle and caption clearance; the caller retains URL ownership. */
export declare function HostImagePreview({ src, alt, onClose }: PreviewProps): import("react").JSX.Element;
export {};
