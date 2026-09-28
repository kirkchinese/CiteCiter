/** Isolated, disposable layout adapter for DSH alpha and legacy three-column frames. */
import { useEffect, useRef, useState } from 'react';
import { resolveDockGeometry } from "./dock-geometry.js";
/**
 * Locate the frame owning the public shell.overlay contribution.
 * @param panel - mounted learning panel.
 * @returns its immediate frame, or null before mounting.
 */
export function findContainingFrame(panel) {
    return panel?.closest('[data-shell-overlay]')?.parentElement ?? null;
}
/**
 * Reserve host space without rewriting the host's saved columns or hiding details.
 * Unknown frame structures receive no DOM changes. All owned styles disappear on close.
 * @param panel - mounted panel reference.
 * @param open - whether space should be reserved.
 * @param percent - user's preferred fraction of the content viewport.
 * @param floating - whether the user detached the panel.
 * @param activation - increases only on explicit Citer navigation, permitting return from details.
 * @returns measured panel placement; null when the host frame is unsupported.
 */
export function useHostDock(panel, open, percent, floating = false, activation = 0) {
    const [geometry, setGeometry] = useState(null);
    const navigation = useRef({ activation: -1, details: 0, preferDetails: true });
    useEffect(() => {
        if (!open)
            return;
        const frame = findContainingFrame(panel.current);
        if (frame === null)
            return;
        const owner = crypto.randomUUID();
        const saved = new Map();
        const setTrack = (name, value) => {
            if (!saved.has(name))
                saved.set(name, {
                    value: frame.style.getPropertyValue(name), priority: frame.style.getPropertyPriority(name),
                });
            if (frame.style.getPropertyValue(name) !== value)
                frame.style.setProperty(name, value);
        };
        const clear = () => {
            if (frame.dataset.citeciterDockOwner !== owner)
                return;
            delete frame.dataset.citeciterDockOwner;
            delete frame.dataset.citeciterLayout;
            for (const [name, prior] of saved) {
                if (prior.value === '')
                    frame.style.removeProperty(name);
                else
                    frame.style.setProperty(name, prior.value, prior.priority);
            }
            saved.clear();
        };
        const apply = () => {
            if (frame.dataset.citeciterDockOwner !== undefined && frame.dataset.citeciterDockOwner !== owner)
                return;
            const columns = frame.style.gridTemplateColumns;
            // Alpha makes the details track shrinkable; legacy frames use a fixed px track.
            const tracks = /^(\d+(?:\.\d+)?)px\s+minmax\((?:0|\d+(?:\.\d+)?px),\s*1fr\)\s+(?:minmax\(0(?:px)?,\s*(\d+(?:\.\d+)?)px\)|(\d+(?:\.\d+)?)px)$/u.exec(columns);
            if (tracks === null || frame.hasAttribute('data-rightbar-fullscreen') || getComputedStyle(frame).display !== 'grid') {
                clear();
                setGeometry(null);
                return;
            }
            const rect = frame.getBoundingClientRect();
            const caption = frame.querySelector(':scope > .dshDesktopWindowsCaptionRow, :scope > .dshDesktopMacCaptionRow')
                ?.getBoundingClientRect().height ?? 0;
            const details = Number(tracks[2] ?? tracks[3]);
            const priority = navigation.current;
            if (details !== priority.details)
                priority.preferDetails = true;
            if (activation !== priority.activation)
                priority.preferDetails = false;
            priority.activation = activation;
            priority.details = details;
            const next = resolveDockGeometry({
                width: rect.width, height: rect.height, sidebar: Number(tracks[1]), details, caption, percent, preferDetails: priority.preferDetails,
            });
            // Once both panes fit, subsequent shrinking gives native details priority again.
            if (next.mode === 'columns' || details === 0)
                priority.preferDetails = true;
            if (next.mode === 'suspended' || floating && next.mode === 'columns') {
                clear();
                setGeometry(previous => previous?.mode === next.mode && previous.width === next.width
                    && previous.height === next.height && previous.top === next.top ? previous : next);
                return;
            }
            setTrack('--citeciter-host-columns', columns);
            setTrack('--citeciter-dock-width', next.width + 'px');
            setTrack('--citeciter-dock-height', next.height + 'px');
            setTrack('--citeciter-host-rows', caption > 0 ? `${caption}px minmax(0, 1fr)` : 'minmax(0, 1fr)');
            setTrack('--citeciter-sidebar-row-end', caption > 0 ? '3' : '2');
            frame.dataset.citeciterDockOwner = owner;
            frame.dataset.citeciterLayout = next.mode;
            setGeometry(previous => previous?.mode === next.mode && previous.width === next.width
                && previous.height === next.height && previous.top === next.top ? previous : next);
        };
        apply();
        const resize = new ResizeObserver(apply);
        const mutations = new MutationObserver(apply);
        resize.observe(frame);
        mutations.observe(frame, { attributes: true, attributeFilter: ['style', 'class', 'data-rightbar-fullscreen'], childList: true });
        return () => {
            resize.disconnect();
            mutations.disconnect();
            clear();
        };
    }, [open, panel, percent, floating, activation]);
    return geometry;
}
