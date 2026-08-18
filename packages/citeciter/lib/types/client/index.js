import { TYPERT_REMOTE } from "../typert.remote-client.js";
import { CitePanel } from "./components/CitePanel.js";
import { SelectionMenu } from "./components/SelectionMenu.js";
import { createExplainer } from "./explainer.js";
import { readSelection } from "./selection.js";
import { CiteBus } from "./types.js";
export const name = '@kirkchinese/dsh-citeciter';
export const inject = ['layout', 'slots', 'sessions', 'workspaces', 'remote'];
/** Register Remote contribution, selection capture, overlay, and details panel. */
export async function apply(ctx) {
    const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE);
    ctx.effect(() => unmountRemote, 'citeciter: remote contribution');
    ctx.inject(['remote.citeciter'], (ctx) => {
        const { layout, remote, slots } = ctx;
        // Host and Client both use the Cordis key "sessions"; this mixed-face source
        // tree narrows the browser service explicitly at the platform boundary.
        const sessions = ctx.get('sessions');
        const workspaces = ctx.get('workspaces');
        const bus = new CiteBus((error) => ctx.logger.warn('citeciter selection listener failed', error));
        const explainer = createExplainer(sessions, workspaces, (sessionId, citation) => remote.citeciter.prepareThread(sessionId, citation));
        let detailsInjectController = null;
        let detailsDisposer = null;
        let detailsOpenFrame = null;
        let panelOpen = false;
        ctx.effect(() => {
            const onContextMenu = (event) => {
                const sourceSessionId = sessions.list.getSnapshot().current;
                if (sourceSessionId === undefined)
                    return;
                const selection = readSelection(event, sourceSessionId);
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
        const closePanel = () => {
            const wasOpen = panelOpen;
            panelOpen = false;
            detailsDisposer?.();
            detailsDisposer = null;
            detailsInjectController?.();
            detailsInjectController = null;
            if (detailsOpenFrame !== null)
                cancelAnimationFrame(detailsOpenFrame);
            detailsOpenFrame = null;
            bus.setPanelSelection(null);
            if (wasOpen)
                layout.closeDetails();
        };
        const openPanel = (selection) => {
            if (selection !== undefined) {
                bus.setPanelSelection(selection);
                explainer.select(selection);
            }
            panelOpen = true;
            if (detailsInjectController === null) {
                // A page reload can preserve an "open" details bit after its prior slot
                // disappeared, leaving only the resize rail. Reset before adding our slot.
                layout.closeDetails();
                detailsInjectController = slots.inject('details', () => {
                    detailsDisposer = slots.register({
                        name: 'details',
                        priority: Number.MIN_SAFE_INTEGER,
                        inject: () => ({ close: closePanel, explainer }),
                    }, CitePanel);
                    return () => {
                        detailsDisposer?.();
                        detailsDisposer = null;
                    };
                });
            }
            layout.openDetails();
            if (detailsOpenFrame !== null)
                cancelAnimationFrame(detailsOpenFrame);
            detailsOpenFrame = requestAnimationFrame(() => {
                detailsOpenFrame = null;
                if (panelOpen)
                    layout.openDetails();
            });
        };
        ctx.effect(() => async () => {
            closePanel();
            await explainer.dispose();
        }, 'citeciter: explainer lifecycle');
        slots.inject('shell.overlay', () => slots.register({
            name: 'shell.overlay',
            id: 'citeciter.menu',
            inject: () => ({ bus, explainer, openPanel }),
        }, SelectionMenu));
    });
}
