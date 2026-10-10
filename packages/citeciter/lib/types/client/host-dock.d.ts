/** Isolated, disposable layout adapter for the official DSH Web and Desktop frame. */
import { type RefObject } from 'react';
import { type DockGeometry } from './dock-geometry.ts';
/**
 * Locate the frame owning the public shell.overlay contribution.
 * @param panel - mounted learning panel.
 * @returns its immediate frame, or null before mounting.
 */
export declare function findContainingFrame(panel: HTMLElement | null): HTMLElement | null;
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
export declare function useHostDock(panel: RefObject<HTMLElement | null>, open: boolean, percent: number, floating?: boolean, activation?: number): DockGeometry | null;
