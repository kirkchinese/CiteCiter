window.__ModuleLoader__.load({
	id: "@kirkchinese/dsh-citeciter",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:src/client/components/CiteCiter.module.css.mjs
		const css = "._1Fxyxa_menu{z-index:9999;max-width:min(520px,100vw - 32px);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module,#fff);border:1px solid var(--dsw-alias-border-l1,#ddd);box-shadow:var(--dsw-shadow-lv2,0 8px 24px #0000001f);pointer-events:auto;border-radius:10px;align-items:center;gap:8px;padding:8px 10px;display:flex;position:fixed}._1Fxyxa_menuPreview{text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}._1Fxyxa_menuButton{color:#fff;cursor:pointer;background:var(--dsw-static-deepseek-500,#4d6bfe);border:none;border-radius:8px;flex:none;padding:4px 10px;font-size:13px;line-height:18px}._1Fxyxa_panel{flex-direction:column;height:100%;padding:12px;display:flex;overflow-y:auto}._1Fxyxa_panelHeader{flex:none;justify-content:space-between;align-items:center;display:flex}._1Fxyxa_panelTitle{font-size:14px;font-weight:500}._1Fxyxa_closeButton{width:28px;height:28px;color:var(--dsw-alias-label-secondary,#555);cursor:pointer;background:0 0;border:none;border-radius:999px;font-size:18px;line-height:1}._1Fxyxa_closeButton:hover{background:var(--dsw-alias-interactive-bg-hover,#0000000a)}._1Fxyxa_panelBody{flex-direction:column;gap:12px;padding-top:12px;display:flex}._1Fxyxa_panelHint{color:var(--dsw-alias-label-tertiary,#888);font-size:13px;line-height:20px}._1Fxyxa_quote{overflow-wrap:anywhere;background:var(--dsw-specific-bubble,#f5f5f5);border-radius:8px;margin:0;padding:8px 12px;font-size:14px;line-height:22px}._1Fxyxa_meta{color:var(--dsw-alias-label-secondary,#666);grid-template-columns:auto 1fr;gap:4px 12px;margin:0;font-size:12px;line-height:18px;display:grid}._1Fxyxa_meta dt{color:var(--dsw-alias-label-tertiary,#999)}._1Fxyxa_meta dd{overflow-wrap:anywhere;min-width:0;margin:0}._1Fxyxa_panelNote{color:var(--dsw-alias-label-tertiary,#999);font-size:12px;line-height:18px}._1Fxyxa_panelError{color:var(--dsw-alias-state-error-primary,#d53f3f);overflow-wrap:anywhere;font-size:12px;line-height:18px}._1Fxyxa_panelAnswer{overflow-wrap:anywhere}._1Fxyxa_richAnswer{flex-direction:column;gap:12px;display:flex}._1Fxyxa_richFigure{border:1px solid var(--dsw-alias-border-l1,#ddd);background:var(--dsw-alias-bg-module,#fff);border-radius:8px;margin:0;overflow:hidden}._1Fxyxa_richSvg{object-fit:contain;width:100%;min-height:96px;max-height:360px;display:block}._1Fxyxa_richHtml{background:var(--dsw-alias-bg-module,#fff);border:0;width:100%;min-height:180px;display:block}._1Fxyxa_panelActions{align-items:center;gap:8px;display:flex}._1Fxyxa_actionButton{color:var(--dsw-alias-label-primary,#222);cursor:pointer;background:var(--dsw-alias-interactive-bg-hover-solid,#eee);border:none;border-radius:8px;padding:4px 12px;font-size:13px;line-height:20px}";
		const tagId = "@kirkchinese/dsh-citeciter/CiteCiter.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@kirkchinese/dsh-citeciter";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var CiteCiter_module_css_default = {
			"actionButton": "_1Fxyxa_actionButton",
			"closeButton": "_1Fxyxa_closeButton",
			"menu": "_1Fxyxa_menu",
			"menuButton": "_1Fxyxa_menuButton",
			"menuPreview": "_1Fxyxa_menuPreview",
			"meta": "_1Fxyxa_meta",
			"panel": "_1Fxyxa_panel",
			"panelActions": "_1Fxyxa_panelActions",
			"panelAnswer": "_1Fxyxa_panelAnswer",
			"panelBody": "_1Fxyxa_panelBody",
			"panelError": "_1Fxyxa_panelError",
			"panelHeader": "_1Fxyxa_panelHeader",
			"panelHint": "_1Fxyxa_panelHint",
			"panelNote": "_1Fxyxa_panelNote",
			"panelTitle": "_1Fxyxa_panelTitle",
			"quote": "_1Fxyxa_quote",
			"richAnswer": "_1Fxyxa_richAnswer",
			"richFigure": "_1Fxyxa_richFigure",
			"richHtml": "_1Fxyxa_richHtml",
			"richSvg": "_1Fxyxa_richSvg"
		};
		//#endregion
		//#region lib/types/client/components/SelectionMenu.js
		const PREVIEW_LIMIT = 64;
		/**
		* Render the floating `Citer!` menu in the shell overlay.
		* @param props - shared selection bus and panel opener.
		* @returns menu element while a valid selection exists, otherwise null.
		*/
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
		//#region lib/types/client/answer.js
		/**
		* Read visible text from one assistant-step payload without retaining its live node.
		* @param data - assistant-step payload from the conversation snapshot.
		* @returns visible text and status, or null when no displayable answer exists.
		*/
		function readAssistantAnswer(data) {
			if (data === null || typeof data !== "object") return null;
			const record = data;
			if (record.status !== "running" && record.status !== "settled" && record.status !== "interrupted") return null;
			let text = "";
			for (const block of record.blocks ?? []) {
				if (typeof block !== "object" || block === null) continue;
				const candidate = block;
				if (candidate.kind === "text" && typeof candidate.text === "string") text += candidate.text;
			}
			return text === "" ? null : {
				status: record.status,
				text
			};
		}
		//#endregion
		//#region lib/types/client/prompt.js
		/**
		* Build the explanation prompt recorded into the forked child session.
		* @param selection - quoted assistant text and its parent-log anchor.
		* @returns model-visible prompt text.
		*/
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
		//#region lib/types/client/explainer-controller.js
		/**
		* Bind the explanation state machine to a supplied snapshot store.
		*
		* A parent or anchor change detaches the old child and forks a correctly scoped
		* one. Work is serialized so repeated selections cannot create parallel children, and disposal
		* invalidates every in-flight await before it can install another subscription.
		*
		* @param sessions - DSH browser session service.
		* @param store - plugin-owned observable state store.
		* @returns observable explainer state and lifecycle actions.
		*/
		function createExplainerController(sessions, store) {
			let child = null;
			let parentId = null;
			let forkSeq = null;
			let unsubscribeChild = null;
			let disposed = false;
			let epoch = 0;
			let startQueue = Promise.resolve();
			let stopQueue = Promise.resolve();
			const baselineAssistantKeys = /* @__PURE__ */ new Set();
			const update = (mutator) => {
				if (!disposed) store.update(mutator);
			};
			const fail = (error) => {
				update((draft) => {
					draft.phase = "error";
					draft.error = error instanceof Error ? error.message : String(error);
				});
			};
			const isActive = (operationEpoch) => !disposed && operationEpoch === epoch;
			const detachChild = () => {
				epoch++;
				unsubscribeChild?.();
				unsubscribeChild = null;
				child = null;
				parentId = null;
				forkSeq = null;
				baselineAssistantKeys.clear();
			};
			const updateFromChild = () => {
				const session = child;
				if (session === null || disposed) return;
				const snapshot = session.getSnapshot();
				let answer = null;
				for (const node of snapshot.chat.nodes.values()) {
					if (node.kind !== "assistant-step" || baselineAssistantKeys.has(node.key)) continue;
					const candidate = readAssistantAnswer(node.data);
					if (candidate !== null && (answer === null || node.anchorSeq >= answer.anchorSeq)) answer = {
						...candidate,
						anchorSeq: node.anchorSeq
					};
				}
				if (answer !== null) {
					update((draft) => {
						draft.phase = answer.status === "running" ? "running" : "settled";
						draft.answerText = answer.text;
						draft.error = null;
					});
					return;
				}
				if (snapshot.promptError !== null) {
					fail(snapshot.promptError.error.message);
					return;
				}
				if (snapshot.lastAgentError !== null) {
					fail(snapshot.lastAgentError);
					return;
				}
				if (snapshot.running) update((draft) => {
					draft.phase = "running";
				});
			};
			const rememberAssistantKeys = (session) => {
				for (const node of session.getSnapshot().chat.nodes.values()) if (node.kind === "assistant-step") baselineAssistantKeys.add(node.key);
			};
			const attachChild = (session, sourceId, atSeq) => {
				child = session;
				parentId = sourceId;
				forkSeq = atSeq;
				baselineAssistantKeys.clear();
				rememberAssistantKeys(session);
				unsubscribeChild = session.subscribe(updateFromChild);
			};
			const prompt = async (selection, operationEpoch) => {
				const session = child;
				if (session === null || !isActive(operationEpoch)) return;
				rememberAssistantKeys(session);
				update((draft) => {
					draft.phase = "running";
					draft.selection = selection;
					draft.answerText = null;
					draft.error = null;
				});
				let result;
				try {
					result = await session.prompt([{
						type: "text",
						text: buildPrompt(selection)
					}], "queue");
				} catch (error) {
					if (isActive(operationEpoch)) fail(error);
					return;
				}
				if (!isActive(operationEpoch)) return;
				if (!result.ok) {
					fail(result.error.message);
					return;
				}
				updateFromChild();
			};
			const runStart = async (selection) => {
				if (disposed) return;
				const current = sessions.list.getSnapshot().current;
				if (current === void 0) {
					fail("no current session");
					return;
				}
				update((draft) => {
					draft.selection = selection;
					draft.error = null;
				});
				const sourceBinding = sessions.binding(current);
				if (sourceBinding === void 0) {
					fail(`current session "${current}" is not locally addressable`);
					return;
				}
				const sourceNode = sourceBinding.session.getSnapshot().chat.nodes.get(selection.anchorKey);
				if (sourceNode === void 0 || sourceNode.kind !== "assistant-step") {
					fail("selected assistant context is no longer available");
					return;
				}
				const sourceAnswer = readAssistantAnswer(sourceNode.data);
				if (sourceAnswer === null || sourceAnswer.status === "running") {
					fail("selected assistant response is not complete");
					return;
				}
				if (sourceNode.location.kind !== "step" || sourceNode.location.turn.status !== "closed") {
					fail("selected assistant turn is not complete");
					return;
				}
				const atSeq = sourceNode.anchorSeq;
				if (child !== null && parentId === current && forkSeq === atSeq) {
					await prompt(selection, epoch);
					return;
				}
				if (child !== null) {
					detachChild();
					update((draft) => {
						draft.phase = "idle";
						draft.childId = null;
						draft.answerText = null;
					});
				}
				update((draft) => {
					draft.phase = "creating";
				});
				const operationEpoch = epoch;
				let childId;
				try {
					childId = await sessions.fork({
						sessionId: current,
						atSeq
					});
				} catch (error) {
					if (isActive(operationEpoch)) fail(error);
					return;
				}
				if (!isActive(operationEpoch)) return;
				const binding = sessions.binding(childId);
				if (binding === void 0) {
					fail(`fork child "${childId}" is not locally addressable`);
					return;
				}
				const session = binding.session;
				try {
					await session.open();
				} catch (error) {
					if (isActive(operationEpoch)) fail(error);
					return;
				}
				if (!isActive(operationEpoch)) return;
				attachChild(session, current, atSeq);
				update((draft) => {
					draft.childId = childId;
					draft.phase = "ready";
				});
				let permission;
				try {
					permission = await session.command("/permission read-only");
				} catch (error) {
					if (isActive(operationEpoch)) fail(error);
					return;
				}
				if (!isActive(operationEpoch)) return;
				if (!permission.ok) {
					fail(`read-only switch failed: ${permission.error.message}`);
					return;
				}
				if (!permission.value.matched) {
					fail("read-only switch failed: permission command was not recognized");
					return;
				}
				await prompt(selection, operationEpoch);
			};
			const start = (selection) => {
				if (disposed) return Promise.resolve();
				const task = startQueue.then(async () => {
					try {
						await runStart(selection);
					} catch (error) {
						fail(error);
					}
				});
				startQueue = task;
				return task;
			};
			const runStop = async () => {
				const session = child;
				const operationEpoch = epoch;
				if (session === null || !isActive(operationEpoch)) return;
				try {
					const result = await session.cancel();
					if (!isActive(operationEpoch)) return;
					if (!result.ok) {
						fail(result.error.message);
						return;
					}
				} catch (error) {
					if (isActive(operationEpoch)) fail(error);
					return;
				}
				update((draft) => {
					draft.phase = "ready";
				});
			};
			const stop = () => {
				if (disposed) return Promise.resolve();
				const task = stopQueue.then(async () => {
					try {
						await runStop();
					} catch (error) {
						fail(error);
					}
				});
				stopQueue = task;
				return task;
			};
			const dispose = async () => {
				if (!disposed) {
					detachChild();
					disposed = true;
				}
				await Promise.all([startQueue, stopQueue]);
			};
			return {
				getSnapshot: store.getSnapshot,
				subscribe: store.subscribe,
				start,
				stop,
				dispose
			};
		}
		//#endregion
		//#region lib/types/client/explainer.js
		const EMPTY = {
			phase: "idle",
			childId: null,
			selection: null,
			answerText: null,
			error: null
		};
		/**
		* Create an explainer and its plugin-owned DSH snapshot store.
		* @param sessions - DSH browser session service.
		* @returns observable explainer state and lifecycle actions.
		*/
		function createExplainer(sessions) {
			return createExplainerController(sessions, (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(EMPTY));
		}
		//#endregion
		//#region lib/types/client/rich-content.js
		const MAX_RICH_SOURCE_LENGTH = 2e5;
		const RICH_FENCE = /^```(?<kind>svg|html)[ \t]*\r?\n(?<source>[\s\S]*?)^```[ \t]*$/gimu;
		const HTML_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:";
		/**
		* Split complete safe rich fences from Markdown while preserving all prose.
		* @param text - current assistant response text.
		* @returns ordered Markdown and isolated rich-preview segments.
		*/
		function splitRichContent(text) {
			const segments = [];
			let cursor = 0;
			for (const match of text.matchAll(RICH_FENCE)) {
				const index = match.index ?? 0;
				if (index > cursor) pushMarkdown(segments, text.slice(cursor, index));
				const wholeFence = match[0];
				const kind = match.groups?.kind?.toLowerCase();
				const source = match.groups?.source ?? "";
				if (kind === "svg" && isSafeSvg(source)) {
					const normalized = source.trim();
					segments.push({
						kind: "svg",
						source: normalized,
						dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalized)}`
					});
				} else if (kind === "html" && isPreviewableHtml(source)) segments.push({
					kind: "html",
					document: isolatedHtmlDocument(source.trim())
				});
				else pushMarkdown(segments, wholeFence);
				cursor = index + wholeFence.length;
			}
			if (cursor < text.length || segments.length === 0) pushMarkdown(segments, text.slice(cursor));
			return segments;
		}
		/**
		* Check whether SVG markup is self-contained and non-active.
		* @param source - SVG fence body.
		* @returns whether the source may be rendered as an inert image preview.
		*/
		function isSafeSvg(source) {
			const svg = source.trim();
			if (svg.length === 0 || svg.length > MAX_RICH_SOURCE_LENGTH) return false;
			if (!/^<svg(?:\s|>)/iu.test(svg) || !/<\/svg\s*>$/iu.test(svg)) return false;
			if (/<\/?(?:script|foreignobject|iframe|object|embed|audio|video|canvas)\b/iu.test(svg)) return false;
			if (/\son[a-z][a-z0-9:_-]*\s*=/iu.test(svg)) return false;
			if (/\b(?:href|xlink:href)\s*=/iu.test(svg)) return false;
			if (/\b(?:javascript|vbscript)\s*:/iu.test(svg)) return false;
			if (/url\(\s*(?:['"]?\s*)?(?!#)/iu.test(svg)) return false;
			return true;
		}
		/**
		* Build a network-free, script-free iframe document for an HTML fence.
		* @param source - HTML fence body.
		* @returns complete iframe `srcDoc` markup with restrictive CSP metadata.
		*/
		function isolatedHtmlDocument(source) {
			return [
				"<!doctype html><html><head>",
				`<meta http-equiv="Content-Security-Policy" content="${HTML_CSP}">`,
				"<meta name=\"referrer\" content=\"no-referrer\">",
				"<style>html{color-scheme:light dark}body{margin:0;padding:12px;font:14px/1.5 system-ui,sans-serif;overflow-wrap:anywhere}</style>",
				"</head><body>",
				source,
				"</body></html>"
			].join("");
		}
		function isPreviewableHtml(source) {
			return source.trim().length > 0 && source.length <= MAX_RICH_SOURCE_LENGTH;
		}
		function pushMarkdown(segments, text) {
			if (text !== "") segments.push({
				kind: "markdown",
				text
			});
		}
		//#endregion
		//#region lib/types/client/components/RichAnswer.js
		/**
		* Render model Markdown plus safe SVG and sandboxed HTML fence previews.
		* @param props - response text and streaming flag.
		* @returns isolated rich-answer element.
		*/
		function RichAnswer({ text, streaming }) {
			const segments = (0, react.useMemo)(() => splitRichContent(text), [text]);
			return (0, react_jsx_runtime.jsx)("div", {
				className: CiteCiter_module_css_default.richAnswer,
				"data-citeciter-answer": true,
				children: segments.map((segment, index) => {
					const key = `${segment.kind}:${index}`;
					if (segment.kind === "svg") return (0, react_jsx_runtime.jsx)("figure", {
						className: CiteCiter_module_css_default.richFigure,
						"data-citeciter-svg": true,
						children: (0, react_jsx_runtime.jsx)("img", {
							className: CiteCiter_module_css_default.richSvg,
							src: segment.dataUrl,
							alt: "CiteCiter SVG explanation"
						})
					}, key);
					if (segment.kind === "html") return (0, react_jsx_runtime.jsx)("figure", {
						className: CiteCiter_module_css_default.richFigure,
						"data-citeciter-html": true,
						children: (0, react_jsx_runtime.jsx)("iframe", {
							className: CiteCiter_module_css_default.richHtml,
							title: "CiteCiter HTML explanation",
							sandbox: "",
							referrerPolicy: "no-referrer",
							srcDoc: segment.document
						})
					}, key);
					return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
						text: segment.text,
						streaming
					}, key);
				})
			});
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
		/**
		* Render the right details-column explanation panel.
		* @param props - selection state, close action, and explainer face.
		* @returns panel element with current status and response.
		*/
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
						snapshot.error !== null && (0, react_jsx_runtime.jsx)("p", {
							className: CiteCiter_module_css_default.panelError,
							"data-citeciter-error": true,
							children: snapshot.error
						}),
						snapshot.answerText !== null && snapshot.answerText !== "" && (0, react_jsx_runtime.jsx)("div", {
							className: CiteCiter_module_css_default.panelAnswer,
							children: (0, react_jsx_runtime.jsx)(RichAnswer, {
								text: snapshot.answerText,
								streaming: snapshot.phase === "running"
							})
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
		* Returns null for collapsed or empty selections, selections outside a
		* conversation flow node, and selections outside an assistant step.
		* @param event - context-menu event whose pointer position anchors the menu.
		* @returns validated selection metadata, or null when CiteCiter should ignore it.
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
		/** Observable selection state shared by the overlay and details panel. */
		var CiteBus = class {
			reportListenerError;
			menuSelection = null;
			panelSelection = null;
			listeners = /* @__PURE__ */ new Set();
			/** @param reportListenerError - isolates and reports one failed subscriber. */
			constructor(reportListenerError) {
				this.reportListenerError = reportListenerError;
			}
			/** @returns current context-menu selection, or null while hidden. */
			getMenuSelection() {
				return this.menuSelection;
			}
			/** @returns selection currently explained in the details panel. */
			getPanelSelection() {
				return this.panelSelection;
			}
			/** @param selection - next context-menu selection, or null to hide it. */
			setMenuSelection(selection) {
				if (this.menuSelection === selection) return;
				this.menuSelection = selection;
				this.notify();
			}
			/** @param selection - next details-panel selection, or null when closed. */
			setPanelSelection(selection) {
				if (this.panelSelection === selection) return;
				this.panelSelection = selection;
				this.notify();
			}
			/**
			* Subscribe to either selection value.
			* @param listener - callback invoked after a value changes.
			* @returns disposer for this subscription.
			*/
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			}
			notify() {
				for (const listener of [...this.listeners]) try {
					listener();
				} catch (error) {
					this.reportListenerError(error);
				}
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Cordis identity for the CiteCiter browser plugin. */
		const name = "@kirkchinese/dsh-citeciter";
		/** Hard dependencies whose appearance activates the browser fiber. */
		const inject = [
			"layout",
			"slots",
			"sessions"
		];
		/**
		* Register the selection listener, overlay entry, and details-panel lifecycle.
		* @param ctx - Cordis browser context with layout, slots, and sessions services.
		*/
		function apply(ctx) {
			const { layout, sessions, slots } = ctx;
			const bus = new CiteBus((error) => ctx.logger.warn("citeciter selection listener failed", error));
			const explainer = createExplainer(sessions);
			let detailsInjectController = null;
			let detailsDisposer = null;
			let panelOpen = false;
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
			const openPanel = (selection) => {
				bus.setPanelSelection(selection);
				panelOpen = true;
				layout.openDetails();
				if (detailsInjectController === null) detailsInjectController = slots.inject("details", () => {
					detailsDisposer = slots.register({
						name: "details",
						priority: Number.MIN_SAFE_INTEGER,
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
				const wasOpen = panelOpen;
				panelOpen = false;
				detailsDisposer?.();
				detailsDisposer = null;
				detailsInjectController?.();
				detailsInjectController = null;
				bus.setPanelSelection(null);
				if (wasOpen) layout.closeDetails();
			};
			ctx.effect(() => async () => {
				closePanel();
				await explainer.dispose();
			}, "citeciter: explainer lifecycle");
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
