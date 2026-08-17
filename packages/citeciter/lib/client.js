window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-citeciter",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:<repo>/packages/citeciter/src/client/components/CiteCiter.module.css.mjs
		const css = "._1Fxyxa_menu{z-index:9999;max-width:min(520px,100vw - 32px);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module,#fff);border:1px solid var(--dsw-alias-border-l1,#ddd);box-shadow:var(--dsw-shadow-lv2,0 8px 24px #0000001f);pointer-events:auto;border-radius:10px;align-items:center;gap:8px;padding:8px 10px;display:flex;position:fixed}._1Fxyxa_menuPreview{text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}._1Fxyxa_menuButton{color:#fff;cursor:pointer;background:var(--dsw-static-deepseek-500,#4d6bfe);border:none;border-radius:8px;flex:none;padding:4px 10px;font-size:13px;line-height:18px}._1Fxyxa_panel{flex-direction:column;height:100%;padding:12px;display:flex;overflow-y:auto}._1Fxyxa_panelHeader{flex:none;justify-content:space-between;align-items:center;display:flex}._1Fxyxa_panelTitle{font-size:14px;font-weight:500}._1Fxyxa_closeButton{width:28px;height:28px;color:var(--dsw-alias-label-secondary,#555);cursor:pointer;background:0 0;border:none;border-radius:999px;font-size:18px;line-height:1}._1Fxyxa_closeButton:hover{background:var(--dsw-alias-interactive-bg-hover,#0000000a)}._1Fxyxa_panelBody{flex-direction:column;gap:12px;padding-top:12px;display:flex}._1Fxyxa_panelHint{color:var(--dsw-alias-label-tertiary,#888);font-size:13px;line-height:20px}._1Fxyxa_quote{overflow-wrap:anywhere;background:var(--dsw-specific-bubble,#f5f5f5);border-radius:8px;margin:0;padding:8px 12px;font-size:14px;line-height:22px}._1Fxyxa_meta{color:var(--dsw-alias-label-secondary,#666);grid-template-columns:auto 1fr;gap:4px 12px;margin:0;font-size:12px;line-height:18px;display:grid}._1Fxyxa_meta dt{color:var(--dsw-alias-label-tertiary,#999)}._1Fxyxa_meta dd{overflow-wrap:anywhere;min-width:0;margin:0}._1Fxyxa_panelNote{color:var(--dsw-alias-label-tertiary,#999);font-size:12px;line-height:18px}._1Fxyxa_panelWarn{color:var(--dsw-alias-state-warn-primary,#b26a00);font-size:12px;line-height:18px}._1Fxyxa_panelError{color:var(--dsw-alias-state-error-primary,#d53f3f);overflow-wrap:anywhere;font-size:12px;line-height:18px}._1Fxyxa_panelAnswer{overflow-wrap:anywhere}._1Fxyxa_panelActions{align-items:center;gap:8px;display:flex}._1Fxyxa_actionButton{color:var(--dsw-alias-label-primary,#222);cursor:pointer;background:var(--dsw-alias-interactive-bg-hover-solid,#eee);border:none;border-radius:8px;padding:4px 12px;font-size:13px;line-height:20px}";
		const tagId = "@deepseek-ai/dsh-citeciter/CiteCiter.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-citeciter";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var CiteCiter_module_css_default = {
			"panelHeader": "_1Fxyxa_panelHeader",
			"panelTitle": "_1Fxyxa_panelTitle",
			"panelHint": "_1Fxyxa_panelHint",
			"panelAnswer": "_1Fxyxa_panelAnswer",
			"panelNote": "_1Fxyxa_panelNote",
			"panelWarn": "_1Fxyxa_panelWarn",
			"actionButton": "_1Fxyxa_actionButton",
			"panelActions": "_1Fxyxa_panelActions",
			"menuPreview": "_1Fxyxa_menuPreview",
			"menu": "_1Fxyxa_menu",
			"meta": "_1Fxyxa_meta",
			"panel": "_1Fxyxa_panel",
			"closeButton": "_1Fxyxa_closeButton",
			"menuButton": "_1Fxyxa_menuButton",
			"panelBody": "_1Fxyxa_panelBody",
			"panelError": "_1Fxyxa_panelError",
			"quote": "_1Fxyxa_quote"
		};
		//#endregion
		//#region lib/types/client/components/SelectionMenu.js
		const PREVIEW_LIMIT = 64;
		/** Floating `Citer!` menu rendered through the shell.overlay seat. */
		function SelectionMenu({ bus, openPanel }) {
			const [selection, setSelection] = (0, react.useState)(() => bus.getMenuSelection());
			(0, react.useEffect)(() => bus.subscribe(() => {
				setSelection(bus.getMenuSelection());
			}), [bus]);
			if (selection === null) return null;
			const preview = selection.text.length > PREVIEW_LIMIT ? `${selection.text.slice(0, PREVIEW_LIMIT)}…` : selection.text;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: CiteCiter_module_css_default.menu,
				"data-citeciter-menu": true,
				style: {
					left: selection.x,
					top: selection.y
				},
				role: "menu",
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: CiteCiter_module_css_default.menuPreview,
					title: selection.text,
					children: preview
				}), (0, react_jsx_runtime.jsx)("button", {
					className: CiteCiter_module_css_default.menuButton,
					type: "button",
					role: "menuitem",
					onClick: () => {
						openPanel(selection);
						bus.setMenuSelection(null);
					},
					children: "Citer!"
				})]
			});
		}
		//#endregion
		//#region lib/types/client/prompt.js
		/** Parse the leading `<seq>:` from a conversation anchor key. */
		function parseAnchorSeq(anchorKey) {
			const value = /^(\d+):/u.exec(anchorKey)?.[1];
			if (value === void 0) return null;
			const seq = Number(value);
			return Number.isSafeInteger(seq) && seq >= 0 ? seq : null;
		}
		/** The prompt template recorded into the explainer child session. */
		function buildPrompt(selection) {
			return [
				"你是 CiteCiter 解释器。只解释下面引用的内容，不执行任务、不修改任何文件，不要请求提升沙箱权限。",
				`[引用自主会话 anchor=${selection.anchorKey}]`,
				"<<<",
				selection.text,
				">>>",
				"要求：先给一句话直觉解释，再展开原理。数学用 $...$；代码使用带语言围栏；如需图，输出一个 ```svg 围栏（不要 script/foreignObject）。不要输出与引用无关的内容。"
			].join("\n\n");
		}
		//#endregion
		//#region lib/types/client/explainer.js
		const EMPTY = {
			phase: "idle",
			childId: null,
			selection: null,
			answerText: null,
			error: null,
			permissionWarning: null
		};
		/** Create the explainer runtime owned by one plugin fiber. */
		function createExplainer(sessions) {
			const store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(EMPTY);
			let child = null;
			let unsubscribeChild = null;
			const baselineAssistantKeys = /* @__PURE__ */ new Set();
			const update = (mutator) => {
				store.update(mutator);
			};
			const fail = (error, phase = "error") => {
				update((draft) => {
					draft.phase = phase;
					draft.error = error instanceof Error ? error.message : String(error);
				});
			};
			const updateFromChild = () => {
				const session = child;
				if (session === null) return;
				const snapshot = session.getSnapshot();
				let answer = null;
				for (const node of snapshot.chat.nodes.values()) {
					if (node.kind !== "assistant-step" || baselineAssistantKeys.has(node.key)) continue;
					const text = settledAssistantText(node);
					if (text !== null && (answer === null || node.anchorSeq >= latestAnchor(answer, snapshot))) answer = {
						key: node.key,
						text
					};
				}
				if (answer !== null) {
					update((draft) => {
						draft.phase = "settled";
						draft.answerText = answer.text;
						draft.error = null;
					});
					return;
				}
				if (snapshot.promptError !== null) {
					update((draft) => {
						draft.phase = "error";
						draft.error = snapshot.promptError?.error.message ?? "prompt rejected";
					});
					return;
				}
				if (snapshot.lastAgentError !== null) {
					update((draft) => {
						draft.phase = "error";
						draft.error = snapshot.lastAgentError;
					});
					return;
				}
				update((draft) => {
					draft.phase = snapshot.running ? "running" : draft.phase;
				});
			};
			const attachChild = (session) => {
				child = session;
				unsubscribeChild?.();
				unsubscribeChild = session.subscribe(updateFromChild);
				for (const node of session.getSnapshot().chat.nodes.values()) if (node.kind === "assistant-step") baselineAssistantKeys.add(node.key);
			};
			const prompt = async (selection) => {
				const session = child;
				if (session === null) return;
				const result = await session.prompt([{
					type: "text",
					text: buildPrompt(selection)
				}], "queue");
				if (!result.ok) {
					fail(result.error.message);
					return;
				}
				update((draft) => {
					draft.phase = "running";
					draft.selection = selection;
					draft.answerText = null;
					draft.error = null;
				});
				updateFromChild();
			};
			const start = async (selection) => {
				update((draft) => {
					draft.selection = selection;
					draft.error = null;
				});
				if (child !== null) {
					await prompt(selection);
					return;
				}
				const current = sessions.list.getSnapshot().current;
				if (current === void 0) {
					fail("no current session");
					return;
				}
				const atSeq = parseAnchorSeq(selection.anchorKey);
				if (atSeq === null) {
					fail(`cannot derive fork seq from anchor "${selection.anchorKey}"`);
					return;
				}
				update((draft) => {
					draft.phase = "creating";
					draft.permissionWarning = null;
				});
				let childId;
				try {
					childId = await sessions.fork({
						sessionId: current,
						atSeq
					});
				} catch (error) {
					fail(error);
					return;
				}
				const binding = sessions.binding(childId);
				if (binding === void 0) {
					fail(`fork child "${childId}" is not locally addressable`);
					return;
				}
				const session = binding.session;
				try {
					await session.open();
				} catch (error) {
					fail(error);
					return;
				}
				attachChild(session);
				update((draft) => {
					draft.childId = childId;
					draft.phase = "ready";
				});
				const permission = await session.command("/permission read-only");
				if (!permission.ok) update((draft) => {
					draft.permissionWarning = `read-only switch failed: ${permission.error.message}`;
				});
				await prompt(selection);
			};
			const stop = async () => {
				const session = child;
				if (session === null) return;
				await session.cancel();
				update((draft) => {
					draft.phase = "ready";
				});
			};
			return {
				getSnapshot: () => store.getSnapshot(),
				subscribe: (listener) => store.subscribe(listener),
				start,
				stop
			};
		}
		/** Extract the concatenated text of a settled assistant-step chat node. */
		function settledAssistantText(node) {
			const data = node.data;
			if (data === null || typeof data !== "object") return null;
			if (data.status !== "settled") return null;
			let text = "";
			for (const block of data.blocks ?? []) {
				if (typeof block !== "object" || block === null) continue;
				const record = block;
				if (record.kind === "text" && typeof record.text === "string") text += record.text;
			}
			return text;
		}
		function latestAnchor(candidate, snapshot) {
			return snapshot.chat.nodes.get(candidate.key)?.anchorSeq ?? -1;
		}
		//#endregion
		//#region lib/types/client/components/CitePanel.js
		const PHASE_LABEL = {
			idle: "空闲",
			creating: "正在创建解释会话…",
			ready: "解释会话已就绪",
			running: "正在解释…",
			settled: "解释完成",
			error: "解释失败"
		};
		/** Right details-column panel with the explainer pipeline status. */
		function CitePanel({ bus, close, explainer }) {
			const subscribeBus = (0, react.useCallback)((onStoreChange) => bus.subscribe(onStoreChange), [bus]);
			const subscribeExplainer = (0, react.useCallback)((onStoreChange) => explainer.subscribe(onStoreChange), [explainer]);
			const selection = (0, react.useSyncExternalStore)(subscribeBus, () => bus.getPanelSelection());
			const snapshot = (0, react.useSyncExternalStore)(subscribeExplainer, () => explainer.getSnapshot());
			return (0, react_jsx_runtime.jsxs)("div", {
				className: CiteCiter_module_css_default.panel,
				"data-citeciter-panel": true,
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: CiteCiter_module_css_default.panelHeader,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: CiteCiter_module_css_default.panelTitle,
						children: "CiteCiter"
					}), (0, react_jsx_runtime.jsx)("button", {
						className: CiteCiter_module_css_default.closeButton,
						type: "button",
						"aria-label": "Close",
						onClick: close,
						children: "×"
					})]
				}), selection === null && snapshot.selection === null ? (0, react_jsx_runtime.jsx)("p", {
					className: CiteCiter_module_css_default.panelHint,
					children: "选中助手回复中的一段文字，右键选择 Citer!。"
				}) : (0, react_jsx_runtime.jsxs)("div", {
					className: CiteCiter_module_css_default.panelBody,
					children: [
						(0, react_jsx_runtime.jsx)("blockquote", {
							className: CiteCiter_module_css_default.quote,
							children: (selection ?? snapshot.selection)?.text
						}),
						(0, react_jsx_runtime.jsxs)("dl", {
							className: CiteCiter_module_css_default.meta,
							children: [
								(0, react_jsx_runtime.jsx)("dt", { children: "anchor" }),
								(0, react_jsx_runtime.jsx)("dd", { children: (selection ?? snapshot.selection)?.anchorKey }),
								(0, react_jsx_runtime.jsx)("dt", { children: "child" }),
								(0, react_jsx_runtime.jsx)("dd", { children: snapshot.childId ?? "—" }),
								(0, react_jsx_runtime.jsx)("dt", { children: "status" }),
								(0, react_jsx_runtime.jsx)("dd", { children: PHASE_LABEL[snapshot.phase] })
							]
						}),
						snapshot.permissionWarning !== null && (0, react_jsx_runtime.jsx)("p", {
							className: CiteCiter_module_css_default.panelWarn,
							children: snapshot.permissionWarning
						}),
						snapshot.error !== null && (0, react_jsx_runtime.jsx)("p", {
							className: CiteCiter_module_css_default.panelError,
							"data-citeciter-error": true,
							children: snapshot.error
						}),
						snapshot.answerText !== null && snapshot.answerText !== "" && (0, react_jsx_runtime.jsx)("div", {
							className: CiteCiter_module_css_default.panelAnswer,
							"data-citeciter-answer": true,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, { text: snapshot.answerText })
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: CiteCiter_module_css_default.panelActions,
							children: [snapshot.phase === "running" && (0, react_jsx_runtime.jsx)("button", {
								className: CiteCiter_module_css_default.actionButton,
								type: "button",
								onClick: () => {
									explainer.stop();
								},
								children: "停止"
							}), (0, react_jsx_runtime.jsx)("span", {
								className: CiteCiter_module_css_default.panelNote,
								children: "解释会话独立运行，不写入主会话。"
							})]
						})
					]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/selection.js
		/**
		* Resolve the current DOM selection into a CiteSelection.
		* Returns null for collapsed/empty selections, selections outside a
		* conversation flow node, and selections that do not belong to a settled
		* assistant step (the only kind CiteCiter explains in v1).
		*/
		function readSelection(event) {
			const selection = window.getSelection();
			if (selection === null || selection.isCollapsed || selection.rangeCount === 0) return null;
			const text = selection.toString().trim();
			if (text === "") return null;
			const start = selection.getRangeAt(0).commonAncestorContainer;
			const flow = (start.nodeType === Node.ELEMENT_NODE ? start : start.parentElement)?.closest("[data-chat-flow-kind]");
			if (flow === null || flow === void 0) return null;
			const kind = flow.dataset.chatFlowKind;
			const anchorKey = flow.dataset.chatAnchorKey;
			if (kind !== "assistant-step" || anchorKey === void 0 || anchorKey === "") return null;
			return {
				text,
				kind,
				anchorKey,
				x: event.clientX,
				y: event.clientY
			};
		}
		//#endregion
		//#region lib/types/client/types.js
		var CiteBus = class {
			menuSelection = null;
			panelSelection = null;
			listeners = /* @__PURE__ */ new Set();
			getMenuSelection() {
				return this.menuSelection;
			}
			getPanelSelection() {
				return this.panelSelection;
			}
			setMenuSelection(selection) {
				if (this.menuSelection === selection) return;
				this.menuSelection = selection;
				this.notify();
			}
			setPanelSelection(selection) {
				if (this.panelSelection === selection) return;
				this.panelSelection = selection;
				this.notify();
			}
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			}
			notify() {
				for (const listener of [...this.listeners]) listener();
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		const name = "@deepseek-ai/dsh-citeciter";
		const inject = [
			"layout",
			"slots",
			"sessions"
		];
		function apply(ctx) {
			const { layout, sessions, slots } = ctx;
			const bus = new CiteBus();
			const explainer = createExplainer(sessions);
			let detailsInjectController = null;
			let detailsDisposer = null;
			ctx.effect(() => {
				const onContextMenu = (event) => {
					const selection = readSelection(event);
					if (selection === null) return;
					event.preventDefault();
					bus.setMenuSelection(selection);
				};
				const onPointerDown = (event) => {
					const target = event.target;
					if (!(target instanceof Element) || target.closest("[data-citeciter-menu]") === null) bus.setMenuSelection(null);
				};
				document.addEventListener("contextmenu", onContextMenu);
				document.addEventListener("pointerdown", onPointerDown);
				return () => {
					document.removeEventListener("contextmenu", onContextMenu);
					document.removeEventListener("pointerdown", onPointerDown);
				};
			});
			const freeDetailsPriority = () => {
				let next = -1;
				for (const entry of slots.entries("details")) {
					const priority = entry.options.priority ?? 0;
					if (priority <= next) next = priority - 1;
				}
				return next;
			};
			const openPanel = (selection) => {
				bus.setPanelSelection(selection);
				layout.openDetails();
				if (detailsDisposer !== null) return;
				detailsInjectController = slots.inject("details", () => {
					detailsDisposer = slots.register({
						name: "details",
						priority: freeDetailsPriority(),
						inject: () => ({
							bus,
							close: closePanel,
							explainer
						})
					}, CitePanel);
					return () => {
						detailsDisposer?.();
						detailsDisposer = null;
					};
				});
				explainer.start(selection);
			};
			const closePanel = () => {
				detailsDisposer?.();
				detailsDisposer = null;
				detailsInjectController?.();
				detailsInjectController = null;
				bus.setPanelSelection(null);
				layout.closeDetails();
			};
			slots.inject("shell.overlay", () => slots.register({
				name: "shell.overlay",
				id: "citeciter.menu",
				inject: () => ({
					bus,
					openPanel
				})
			}, SelectionMenu));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map