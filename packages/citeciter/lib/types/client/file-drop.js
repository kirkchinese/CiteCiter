import { useCallback, useEffect, useRef, useState } from 'react';
/**
 * Isolate file drags inside one physical panel from document-level drop owners.
 * @param open - whether the owning panel is mounted and available.
 * @param enabled - whether a current Topic can receive attachments.
 * @param onFiles - receive one dropped batch; never submits a model request.
 * @returns the local invitation state and handlers to spread on the panel root.
 * Global cancellation listeners exist only while open and are released on cleanup.
 */
export function useFileDrop(open, enabled, onFiles) {
    const depth = useRef(0);
    const [active, setActive] = useState(false);
    const reset = useCallback(() => { depth.current = 0; setActive(false); }, []);
    useEffect(() => {
        if (!open) {
            reset();
            return;
        }
        window.addEventListener('dragend', reset);
        window.addEventListener('blur', reset);
        return () => {
            window.removeEventListener('dragend', reset);
            window.removeEventListener('blur', reset);
        };
    }, [open, reset]);
    const claim = (event) => {
        // React portals can bubble through this component from outside its DOM bounds.
        if (!open || !(event.target instanceof Node) || !event.currentTarget.contains(event.target))
            return false;
        if (!event.dataTransfer.types.includes('Files'))
            return false;
        event.preventDefault();
        event.stopPropagation();
        return true;
    };
    return {
        active,
        handlers: {
            onDragEnter: (event) => {
                if (!claim(event))
                    return;
                depth.current += 1;
                setActive(true);
            },
            onDragOver: (event) => {
                if (!claim(event))
                    return;
                event.dataTransfer.dropEffect = enabled ? 'copy' : 'none';
                setActive(true);
            },
            onDragLeave: (event) => {
                if (!claim(event))
                    return;
                depth.current = Math.max(0, depth.current - 1);
                if (depth.current === 0)
                    setActive(false);
            },
            onDrop: (event) => {
                if (!claim(event))
                    return;
                reset();
                if (enabled && event.dataTransfer.files.length > 0)
                    onFiles([...event.dataTransfer.files]);
            },
        },
    };
}
