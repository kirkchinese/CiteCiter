window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-citeciter",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:<repo>/packages/citeciter/src/client/components/CiteCiter.module.css.mjs
		const css = "._1Fxyxa_menu{z-index:9999;max-width:min(520px,100vw - 32px);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module,#fff);border:1px solid var(--dsw-alias-border-l1,#ddd);box-shadow:var(--dsw-shadow-lv2,0 8px 24px #0000001f);pointer-events:auto;border-radius:10px;align-items:center;gap:8px;padding:8px 10px;display:flex;position:fixed}._1Fxyxa_menuPreview{text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}._1Fxyxa_menuButton{color:#fff;cursor:pointer;background:var(--dsw-static-deepseek-500,#4d6bfe);border:none;border-radius:8px;flex:none;padding:4px 10px;font-size:13px;line-height:18px}._1Fxyxa_panel{flex-direction:column;height:100%;padding:12px;display:flex;overflow-y:auto}._1Fxyxa_panelHeader{flex:none;justify-content:space-between;align-items:center;display:flex}._1Fxyxa_panelTitle{font-size:14px;font-weight:500}._1Fxyxa_closeButton{width:28px;height:28px;color:var(--dsw-alias-label-secondary,#555);cursor:pointer;background:0 0;border:none;border-radius:999px;font-size:18px;line-height:1}._1Fxyxa_closeButton:hover{background:var(--dsw-alias-interactive-bg-hover,#0000000a)}._1Fxyxa_panelBody{flex-direction:column;gap:12px;padding-top:12px;display:flex}._1Fxyxa_panelHint{color:var(--dsw-alias-label-tertiary,#888);font-size:13px;line-height:20px}._1Fxyxa_quote{overflow-wrap:anywhere;background:var(--dsw-specific-bubble,#f5f5f5);border-radius:8px;margin:0;padding:8px 12px;font-size:14px;line-height:22px}._1Fxyxa_meta{color:var(--dsw-alias-label-secondary,#666);grid-template-columns:auto 1fr;gap:4px 12px;margin:0;font-size:12px;line-height:18px;display:grid}._1Fxyxa_meta dt{color:var(--dsw-alias-label-tertiary,#999)}._1Fxyxa_meta dd{overflow-wrap:anywhere;min-width:0;margin:0}._1Fxyxa_panelNote{color:var(--dsw-alias-label-tertiary,#999);font-size:12px;line-height:18px}";
		const tagId = "@deepseek-ai/dsh-citeciter/CiteCiter.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-citeciter";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var CiteCiter_module_css_default = {
			"menuButton": "_1Fxyxa_menuButton",
			"panelHeader": "_1Fxyxa_panelHeader",
			"panelTitle": "_1Fxyxa_panelTitle",
			"menuPreview": "_1Fxyxa_menuPreview",
			"panelBody": "_1Fxyxa_panelBody",
			"panelHint": "_1Fxyxa_panelHint",
			"meta": "_1Fxyxa_meta",
			"panel": "_1Fxyxa_panel",
			"closeButton": "_1Fxyxa_closeButton",
			"panelNote": "_1Fxyxa_panelNote",
			"menu": "_1Fxyxa_menu",
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
		//#region lib/types/client/components/CitePanel.js
		/**
		* Right details-column panel. Milestone 0 renders the resolved selection;
		* the explainer session pipeline (fork, read-only permission switch, prompt,
		* rich-media rendering) attaches in the next milestone.
		*/
		function CitePanel({ bus, close }) {
			const [selection, setSelection] = (0, react.useState)(() => bus.getPanelSelection());
			(0, react.useEffect)(() => bus.subscribe(() => {
				setSelection(bus.getPanelSelection());
			}), [bus]);
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
				}), selection === null ? (0, react_jsx_runtime.jsx)("p", {
					className: CiteCiter_module_css_default.panelHint,
					children: "选中助手回复中的一段文字，右键选择 Citer!。"
				}) : (0, react_jsx_runtime.jsxs)("div", {
					className: CiteCiter_module_css_default.panelBody,
					children: [
						(0, react_jsx_runtime.jsx)("blockquote", {
							className: CiteCiter_module_css_default.quote,
							children: selection.text
						}),
						(0, react_jsx_runtime.jsxs)("dl", {
							className: CiteCiter_module_css_default.meta,
							children: [
								(0, react_jsx_runtime.jsx)("dt", { children: "kind" }),
								(0, react_jsx_runtime.jsx)("dd", { children: selection.kind }),
								(0, react_jsx_runtime.jsx)("dt", { children: "anchor" }),
								(0, react_jsx_runtime.jsx)("dd", { children: selection.anchorKey })
							]
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: CiteCiter_module_css_default.panelNote,
							children: "解释会话接入（fork + 只读权限 + 富媒体渲染）将在下一里程碑完成。"
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
		const inject = ["layout", "slots"];
		function apply(ctx) {
			const { layout, slots } = ctx;
			const bus = new CiteBus();
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
							close: closePanel
						})
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