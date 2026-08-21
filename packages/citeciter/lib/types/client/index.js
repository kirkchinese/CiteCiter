import { CITECITER_SETTINGS_NAMESPACE, citeCiterSettingsSchema, } from "../topic.js";
import { TYPERT_REMOTE } from "../typert.remote-client.js";
import { createCompanionController } from "./companion-controller.js";
import { CitePanel } from "./components/CitePanel.js";
import { CiteCiterSettings as CiteCiterSettingsView } from "./components/CiteCiterSettings.js";
import { SelectionMenu } from "./components/SelectionMenu.js";
import { readSelection } from "./selection.js";
import { CiteBus } from "./types.js";
export const name = '@kirkchinese/dsh-citeciter';
export const inject = ['layout', 'slots', 'sessions', 'remote', 'settingsScope'];
function decodeSettings(section) {
    const parsed = citeCiterSettingsSchema.safeParse(section);
    return parsed.success ? parsed.data : undefined;
}
/** Register one root-scoped companion without entering DSH's Session list. */
export async function apply(ctx) {
    const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE);
    ctx.effect(() => unmountRemote, 'citeciter: Remote contribution');
    ctx.inject(['remote.citeciter'], (remoteCtx) => {
        const sessions = remoteCtx.get('sessions');
        const settings = remoteCtx.settingsScope.bind({
            namespace: CITECITER_SETTINGS_NAMESPACE,
            decode: decodeSettings,
        });
        const bus = new CiteBus((error) => remoteCtx.logger.warn('CiteCiter browser listener failed', error));
        const companion = createCompanionController(sessions, settings, (request) => remoteCtx.remote.citeciter.request(request));
        const openPanel = () => {
            remoteCtx.layout.closeDetails();
            bus.setPanelOpen(true);
        };
        const closePanel = () => {
            remoteCtx.layout.closeDetails();
            bus.setPanelOpen(false);
        };
        const syncSource = () => {
            companion.setSource(sessions.list.getSnapshot().current ?? null);
        };
        syncSource();
        const unsubscribeSessions = sessions.list.subscribe(syncSource);
        remoteCtx.effect(() => {
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
            const onKeyDown = (event) => {
                if (event.key === 'Escape')
                    bus.setMenuSelection(null);
            };
            document.addEventListener('contextmenu', onContextMenu);
            document.addEventListener('pointerdown', onPointerDown);
            document.addEventListener('keydown', onKeyDown);
            return () => {
                document.removeEventListener('contextmenu', onContextMenu);
                document.removeEventListener('pointerdown', onPointerDown);
                document.removeEventListener('keydown', onKeyDown);
            };
        }, 'citeciter: selection capture');
        remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
            name: 'shell.overlay',
            id: 'citeciter.selection',
            inject: () => ({ bus, companion, openPanel }),
        }, SelectionMenu));
        remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
            name: 'shell.overlay',
            id: 'citeciter.panel',
            inject: () => ({ bus, companion, closePanel }),
        }, CitePanel));
        remoteCtx.slots.inject('settings.section', () => remoteCtx.slots.register({
            name: 'settings.section',
            id: 'citeciter',
            order: 45,
            label: 'CiteCiter',
            inject: () => ({ companion }),
        }, CiteCiterSettingsView));
        remoteCtx.effect(() => async () => {
            unsubscribeSessions();
            closePanel();
            await companion.dispose();
        }, 'citeciter: browser controller');
    });
}
