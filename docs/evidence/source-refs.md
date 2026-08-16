# CiteCiter 关键源码取证摘录（安装树 + master 文档镜像）

所有行号来自本机安装树 `<global-dsh>/node_modules/@deepseek-ai/`
（`0.1.0-rc.6`）编译产物；文档来自 `.refs/docs/`（jsDelivr 拉取的 master 分支，只读）。

## 1. 布局 / 槽

`dsh-client-ui-layout/lib/client.js`：
- :36 `const d0 = details === 0 ? 0 : clampWidth(details, 300, 520);`
- :195 `const cols = computeColumns(viewport, ..., detailsSession === void 0 ? 0 : panels.details);`
- :221 `style: { gridTemplateColumns: `${cols.sidebar}px minmax(0, 1fr) ${cols.details}px` }`
- :236-237 `"data-shell-overlay": true, children: renderSlot("shell.overlay", {})`
- :246-252 `cols.details > 0 && DragHandle({ side: "details", left: viewport - cols.details, ... })`
- :302 `if (d.details === 0) d.details = 360;`

`dsh-client-ui-layout/lib/types/client/index.d.ts`：
- :62 `'details': { kind: 'single'; scope: 'session'; owner: DetailsOwnerProps; }`
- :420 附近 `'shell.overlay': { kind: 'list'; scope: 'root'; }`（“frame-wide floating layer… additive seat”）

`dsh-client-ui-conversation/lib/client.js`：
- :9774-9793 `slots.register({ name: "details", locale: NS, children: {...}, store: chatStore, inject: ... }, DetailsPanel)`（shipped 占用，默认 priority 0）

`dsh-client-ui-slots/lib/index.js`：
- :68-84 `const priority = options.priority ?? 0;` single/keyed/list 同 priority 重复抛错；按 priority 升序排序，最低者渲染。
- `register` 返回 disposer；条目/子槽/store 随 fiber 卸载级联清理。

`dsh-client-runtime/lib/types/client/slots.d.ts`（root 槽注释）：
- “DO NOT register here. … For a surface of your own that floats over the whole app, register into `shell.overlay` instead”。

## 2. 会话 / fork / prompt / 流

`dsh-host-apiproxy/lib/index.js`：
- :2010-2022 `readSessionState` 只读：`const attached = ctx.sessions.get(id); ... events: [...attached.events]`，否则 `inspectServable`；注释 “Read one stable session prefix without acquiring an Agent owner.”
- :2749-2810 `async fork`：`boundary = events.find(e => e.type === "turn/end" && e.seq >= atSeq)`；
  `cut = boundary.seq + 1; while (cut < events.length && events[cut]?.type !== "turn/start") cut++;`
  `ctx.agents.create({ sessionId: childId, seed: events.slice(0, cut), meta:{cwd, parentSession, seedLength, agentPreset}, ... })`。
- :2822-2877 `async prompt`：`turnAgentFor(request, sessionId)` → 仅对该 agent `followup/steer`；
  内容经 `createUserMessage` 落目标会话。

`dsh-client-runtime/lib/client.js`：
- :7379 `open()`：首次拉历史尾页（idempotent）。
- :7654-7661 `acceptLiveEvent`：`if (this.openState !== "open") return;` —— 未 open 的绑定不折叠内容
  （running 位仍由 host 帧单独更新）。
- :9194-9217 `SessionRuntime.resolve/binding`：`binding(id)` 纯解析、不切换当前会话。
- :9290-9350 `pruneScopes`：非 listed/current 的 scope 被拆（插件 UI 状态随会话生命周期）。

`dsh-client-connection/lib/types/client/index.d.ts` / `dsh-host-apiproxy/lib/types/fetch/client.d.ts`：
- `ConnectionHandle.api: IApiClient`；`IApiClient.sessions` 含
  `create/history/fork/prompt/selectModel/cancel`，`workspace.archiveSession` 等 —— 官方浏览器 wire 面。

## 3. 候选机制

`dsh-session-reference/lib/index.js`：
- :341-350 `async prepare(agent, content, references, signal)`：逐源
  `this.ctx.sessionQuery.readSurface(input.sessionId)`，只读投影后**返回** `additionalContext`；
  不写任何会话。
- README：`prepare` 只读、预算 65536 字节/源、快照语义；宿主决定把返回内容 enqueue 进哪个 agent。

`dsh-session-projection/lib/index.js` / README：
- 注册表只 `ctx.on("session/event", ...)` 驱动纯函数；写路径只有可选 projection cache
  （storage 旁路），不写会话日志。

`dsh-subagent-fork-in-process/lib/index.js`：
- :23 `completedTurnPrefix(parent)`：取父日志到最后一个 `turn/end` 的平衡前缀；
- :47-52 `start(request)` 把该前缀作为 seed 交给 in-process driver。
- README：child 独立 session，种子为一次性快照；父侧只有在模型调用 subagent 工具时收到
  child 最终输出（tool-subagent 消费者行为），fork 本身不写父。

`docs/subsystems/session.zh.md`（master，`.refs/docs`）：
- `SessionStore.fork(source, boundary?, childSessionId?)`：要求所选前缀结束于关闭轮次；
  创建活跃子会话，**深克隆种子事件**，子元数据含 `parentSession`、`seedLength`、继承 `cwd`。
- `session/end-seed` 标记种子结束；带种子会话的第一次实时写入紧随其后。

## 4. 挂载 / 安装

`dsh-web-app/cordis.patch.yml`（安装树）：
- 组合层顺序：base bundle → web-app bundle patch → profile `cordis.patch.yml` → `--patch` overlay。
- `dsh.client` 行构成浏览器 roster；`modules` 行 “node half scans this tree, composes
  window.__DSH_BOOT__, and serves /plugins/<id>/client.js”。

`dsh-client-modules/lib/index.js`：
- :139 `this.resolvePkgJson = (spec) => require.resolve(`${spec}/package.json`);`
- :75 `clientExportOf`、:255 `const clientRel = clientExportOf(pkgName, pkg.exports);`
- :289 `resolveMeta(entryName)`：按 Loader entry 名解析包；bundle 缺失/声明畸形在激活趟
  AggregateError 大声失败。

`docs/user/develop/basic/index.zh.md`（master）：
- patch 只贡献配置，不改 loader 解析锚点；`--patch` 覆盖层启动；`inject` 声明服务依赖；
  `ctx.effect()` 清理。

`docs/cookbook/extension-cookbook.zh.md`（master）：
- UI 插件模式：从 `session/event` 渲染，经 `agent.followup()/steer()` 驱动输入；
  浏览器业务行注册 `ConversationNodeDefinition` + keyed Chat renderer。

## 5. 进程级注册冲突（P7 复核）

`dsh-cordis-host-runner/lib/index.js`：
- :730-745 `register(registration)`：`if (this.providers.has(manifest.id)) throw new Error(
  'Host Cordis inspect provider "' + manifest.id + '" is already registered');`
- 该注册表是进程全局 `CordisInspectRegistryService`；disposer 可逆。
- P7 实测输出见 `docs/evidence/probes.md`。
