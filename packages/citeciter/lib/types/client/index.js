import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import { CITECITER_SETTINGS_NAMESPACE, citeCiterSettingsSchema, } from "../topic.js";
import { TYPERT_REMOTE } from "../typert.remote-client.js";
import { createCompanionController, INITIAL_COMPANION_SNAPSHOT } from "./companion-controller.js";
import { CitePanel } from "./components/CitePanel.js";
import { CiteCiterSettings as CiteCiterSettingsView } from "./components/CiteCiterSettings.js";
import { SelectionMenu } from "./components/SelectionMenu.js";
import { createSettingsDocumentController } from "./settings-document.js";
import { claimSelectionContextMenu } from "./selection.js";
import { CiteBus } from "./types.js";
export const name = '@kirkchinese/dsh-citeciter';
export const inject = ['slots', 'sessions', 'remote', 'settingsScope', 'connection'];
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
        const settingsBinder = remoteCtx.settingsScope;
        const settings = settingsBinder.bind({
            namespace: CITECITER_SETTINGS_NAMESPACE,
            decode: decodeSettings,
        });
        const connection = remoteCtx.get('connection');
        const settingsDocument = createSettingsDocumentController(settingsBinder.describe(), async (signal) => {
            const response = await connection.api.settings.openDocument({}, signal);
            if (!response.result.ok)
                throw new Error(response.result.error.message);
        });
        const bus = new CiteBus((error) => remoteCtx.logger.warn('CiteCiter browser listener failed', error));
        const openPanel = () => {
            bus.setPanelOpen(true);
        };
        const closePanel = () => {
            bus.setPanelOpen(false);
        };
        const companion = createCompanionController(sessions, settings, (request, signal) => remoteCtx.remote.citeciter.request(request, signal), openPanel, createSnapshotStore(INITIAL_COMPANION_SNAPSHOT));
        const reportedParseErrors = new Set();
        const reportParseError = (messageId) => {
            const storageKey = `citeciter:malformed-followups:${messageId}`;
            try {
                if (sessionStorage.getItem(storageKey) !== null)
                    return;
                sessionStorage.setItem(storageKey, '1');
            }
            catch {
                // Browser privacy settings may deny session storage; the in-memory set still deduplicates this page.
            }
            if (reportedParseErrors.has(messageId))
                return;
            reportedParseErrors.add(messageId);
            remoteCtx.logger.warn(`CiteCiter ignored malformed first-answer follow-up questions in ${messageId}`);
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
                const selection = claimSelectionContextMenu(event, sourceSessionId);
                if (selection === null)
                    return;
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
            inject: () => ({ bus, companion, closePanel, reportParseError }),
        }, CitePanel));
        remoteCtx.slots.inject('settings.section', () => remoteCtx.slots.register({
            name: 'settings.section',
            id: 'citeciter',
            order: 45,
            label: 'CiteCiter',
            inject: () => ({ companion, settingsDocument }),
        }, CiteCiterSettingsView));
        remoteCtx.effect(() => async () => {
            unsubscribeSessions();
            closePanel();
            await Promise.all([companion.dispose(), settingsDocument.dispose()]);
        }, 'citeciter: browser controller');
    });
}
