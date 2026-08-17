import { SelectionMenu } from "./components/SelectionMenu.js";
import { createExplainer } from "./explainer.js";
import { CitePanel } from "./components/CitePanel.js";
import { readSelection } from "./selection.js";
import { CiteBus } from "./types.js";
/** Cordis identity for the CiteCiter browser plugin. */
export const name = '@kirkchinese/dsh-citeciter';
/** Hard dependencies whose appearance activates the browser fiber. */
export const inject = ['layout', 'slots', 'sessions'];
/**
 * Register the selection listener, overlay entry, and details-panel lifecycle.
 * @param ctx - Cordis browser context with layout, slots, and sessions services.
 */
export function apply(ctx) {
    const { layout, sessions, slots } = ctx;
    const bus = new CiteBus((error) => ctx.logger.warn('citeciter selection listener failed', error));
    const explainer = createExplainer(sessions);
    let detailsInjectController = null;
    let detailsDisposer = null;
    let panelOpen = false;
    ctx.effect(() => {
        const onContextMenu = (event) => {
            const selection = readSelection(event);
            if (selection === null)
                return;
            event.preventDefault();
            bus.setMenuSelection(selection);
        };
        const onPointerDown = (event) => {
            const target = event.target;
            if (!(target instanceof Element) || target.closest('[data-citeciter-menu]') === null) {
                bus.setMenuSelection(null);
            }
        };
        document.addEventListener('contextmenu', onContextMenu);
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('contextmenu', onContextMenu);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    });
    const openPanel = (selection) => {
        bus.setPanelSelection(selection);
        panelOpen = true;
        layout.openDetails();
        if (detailsInjectController === null) {
            detailsInjectController = slots.inject('details', () => {
                detailsDisposer = slots.register({
                    name: 'details',
                    // A single slot renders its lowest priority; closing disposes this shadow entry.
                    priority: Number.MIN_SAFE_INTEGER,
                    inject: () => ({ bus, close: closePanel, explainer }),
                }, CitePanel);
                return () => {
                    detailsDisposer?.();
                    detailsDisposer = null;
                };
            });
        }
        void explainer.start(selection);
    };
    const closePanel = () => {
        const wasOpen = panelOpen;
        panelOpen = false;
        detailsDisposer?.();
        detailsDisposer = null;
        detailsInjectController?.();
        detailsInjectController = null;
        bus.setPanelSelection(null);
        if (wasOpen)
            layout.closeDetails();
    };
    ctx.effect(() => async () => {
        closePanel();
        await explainer.dispose();
    }, 'citeciter: explainer lifecycle');
    slots.inject('shell.overlay', () => slots.register({
        name: 'shell.overlay',
        id: 'citeciter.menu',
        inject: () => ({ bus, openPanel }),
    }, SelectionMenu));
}
