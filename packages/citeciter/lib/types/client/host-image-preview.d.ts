interface PreviewProps {
    readonly src: string;
    readonly alt: string;
    readonly onClose: () => void;
}
/** Preview an existing authorized object URL in the host UI; the caller retains URL ownership. */
export declare function HostImagePreview({ src, alt, onClose }: PreviewProps): import("react").JSX.Element;
export {};
