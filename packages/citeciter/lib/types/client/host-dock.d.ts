/** Isolated, disposable layout adapter for DSH 0.1.5-rc.1 and Desktop 2.0.9 frames. */
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
 * @returns measured panel placement; null when the host frame is unsupported.
 */
export declare function useHostDock(panel: RefObject<HTMLElement | null>, open: boolean, percent: number): DockGeometry | null;
