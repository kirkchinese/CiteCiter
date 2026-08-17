import { SelectionMenu } from "./components/SelectionMenu.js";
import { CitePanel } from "./components/CitePanel.js";
import { readSelection } from "./selection.js";
import { CiteBus } from "./types.js";
export const name = '@deepseek-ai/dsh-citeciter';
export const inject = ['layout', 'slots'];
export function apply(ctx) {
    const { layout, slots } = ctx;
    const bus = new CiteBus();
    let detailsInjectController = null;
    let detailsDisposer = null;
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
    const freeDetailsPriority = () => {
        let next = -1;
        for (const entry of slots.entries('details')) {
            const priority = entry.options.priority ?? 0;
            if (priority <= next)
                next = priority - 1;
        }
        return next;
    };
    const openPanel = (selection) => {
        bus.setPanelSelection(selection);
        layout.openDetails();
        if (detailsDisposer !== null)
            return;
        detailsInjectController = slots.inject('details', () => {
            detailsDisposer = slots.register({
                name: 'details',
                priority: freeDetailsPriority(),
                inject: () => ({ bus, close: closePanel }),
            }, CitePanel);
            return () => {
                detailsDisposer?.();
                detailsDisposer = null;
            };
        });
    };
    const closePanel = () => {
        detailsDisposer?.();
        detailsDisposer = null;
        detailsInjectController?.();
        detailsInjectController = null;
        bus.setPanelSelection(null);
        layout.closeDetails();
    };
    slots.inject('shell.overlay', () => slots.register({
        name: 'shell.overlay',
        id: 'citeciter.menu',
        inject: () => ({ bus, openPanel }),
    }, SelectionMenu));
}
