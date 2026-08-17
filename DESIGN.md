# CiteCiter 历史调研与设计记录

> 本文保留 2026-08-17 的方案探索和探针结论，不描述当前实现。当前行为、验证命令和 HMR 说明见 `packages/citeciter/README.zh.md` 与 `docs/implementation-milestones.md`。

- 版本：v1（本阶段交付）
- 日期：2026-08-17（本机时间）
- 环境取证基准：Node.js v22.23.2、pnpm 11.21.0、已安装 DSH `@deepseek-ai/dsh@0.1.0-rc.6`
  （全局安装树全程只读）。
- 工作区：本仓库根目录（git 已初始化，探针与报告均已提交）。
- 结论一句话：**CiteCiter 可以做成“纯外部 client 插件 + 一次 profile patch 行 + 复用官方
  `session.fork`/`session.prompt` 会话 API”，不需要修改 DSH 主仓库，不需要注册任何 Host
  service；“继承但不影响主 session”已用探针证明（fork 子会话 + prompt 子会话，父会话日志逐
  事件不变）。**

---

## 0. 证据来源与限制（先声明，避免“凭印象”）

| 层级 | 来源 | 用途 |
|---|---|---|
| L1 实测 | 本报告 §3 探针 P1–P8（临时 `DSH_HOME=/tmp/citeciter-dsh-home`，真实浏览器 headless 渲染，0 次成功模型调用（无 key 临时环境）） | 挂载、渲染、侧边栏、选中菜单、fork 隔离、富媒体、注册冲突 |
| L1 只读 | 本机安装树 `node_modules/@deepseek-ai/dsh-*/lib/**` 与 `cordis.patch.yml`、README | 机制级源码取证 |
| L1 只读 | 通过 jsDelivr 镜像取到的 master 分支文档（保存于 `.refs/docs/`，只读）：`AGENTS.md`、`CONTRIBUTING.zh.md`、`docs/architecture.zh.md`、`docs/development.zh.md`、`docs/cordis-primer.zh.md`、`docs/cordis-tutorial/01-first-plugin.zh.md`、`docs/user/develop/basic/index.zh.md`、`docs/subsystems/{client-modules,session,subagent,session-reference,session-projection}.zh.md`、`docs/cookbook/extension-cookbook.zh.md` | 编码规范、平台语义 |
| L2 前序调研 | 早期工作区中的 `whoami-cordis-{phase1,phase2,audit}-report.md` | 仅作线索；本报告结论全部重新取证 |
| 限制 | `git clone` GitHub 超时（网络到 github.com 443 不通）；改为 raw/jsDelivr 逐文件拉取文档成功。GitHub 仓库未完整落盘，`packages/**/tests/` 源码测试目录本地不可得，故“官方测试用法”以安装树 lib + 类型 + README + 文档 + 自跑探针替代 | 已如实标注 |

只读纪律执行记录：探针全部使用临时 DSH_HOME；真实 `~/.dsh` 仅做了 `curl` GET 读 boot graph
取证，未写任何文件；本机安装树未改；所有探针代码在工作区内，可复现。

---

## 1. 前提核验与能力边界（任务 1a–1d 逐题回答）

### 1a. 文本选中 + 右键菜单 `Citer!` 如何实现？走哪个 UI 扩展点？

**事实**：官方 slot 体系里**没有**“消息文本选中/右键菜单”专用扩展点。`ui-conversation` 的
`SlotMap` 提供的与消息相关座位是：`conversation.chat.node`（keyed，按节点 kind 渲染整行）、
`conversation.chat.assistant-actions`（消息尾按钮，list）、`conversation.chat.turnTail`（chain）等；
没有任何 selection/contextmenu 契约。已用 `grep` 对安装树确认（`window.getSelection` 只出现在
`ui-primitives` 的 HoverCard 复制保护与 JsonTree 右键复制里，不在会话消息上）。

**可行实现（已用探针 P3 验证）**：

1. 插件在 `apply()` 内通过 `ctx.effect()` 安装**文档级** `contextmenu` 监听（返回
   removeEventListener 作为 disposer——符合 AGENTS.md “registrations are effects”）。
2. 事件处理：`window.getSelection()` 非空且非 collapsed → 取 `range.commonAncestorContainer`
   最近的 `[data-chat-flow-kind]` 元素 → 命中才 `event.preventDefault()` 并弹出菜单。
   - 依据：`ui-conversation` 的 `ChatNodeSeat` 为每条会话流节点渲染
     `data-chat-anchor-key / data-chat-flow-key / data-chat-flow-kind`，外层还有
     `data-slot="conversation.chat.node"`（本机安装树
     `dsh-client-ui-conversation/lib/client.js` 中 `ChatNodeSeat` 的 render；P3 在真实临时会话
     DOM 中实测到 `kind=user/context/turn-error/turn-tail` 的节点均带这些属性）。
   - `data-chat-anchor-key` 就是 `ConversationSnapshot.chat.nodes` 的 key，可在 slot 组件里用
     `useSession(s => s.chat.nodes.get(anchorKey))` 反查节点的类型化数据（含 assistant 节点的
     `finalNode.seq`、blocks 文本等）。
3. 菜单 UI 注册进官方 **`shell.overlay`**（`ui-layout` 声明的 list 槽：frame 级浮层、可加性、
   默认 click-through、条目自己选择 pointer-events）。这是官方点名“想要自己的全局浮层就注册
   `shell.overlay`”的座位（`dsh-client-runtime/lib/types/client/slots.d.ts` 的 root 槽注释明确
   禁止注册 `root`，并指向 `shell.overlay`）。

**结论**：扩展点组合 = 文档级 DOM 事件（新代码）+ `shell.overlay` 槽（官方）。不需要替换
`conversation.chat.node` 的 `assistant-step` renderer（那是 single-cell keyed 抢占，会迫使
CiteCiter 重画整个助手消息，且 `AssistantNodeView` 不是包的导出面，耦合极重；不推荐）。

### 1b. 可调整宽度的侧边栏如何注册与渲染？能否注入 HTML/SVG/演示代码等富媒体？

**事实与实现**：官方三栏布局 `ui-layout` 的 AppFrame 已有**右详情栏（details）**：
- SlotMap `details`：`kind: 'single'`、`scope: 'session'`（`dsh-client-ui-layout/lib/types/client/index.d.ts:62`）。
- 宽度契约：`computeColumns` 把 details clamp 到 **300–520px**（`dsh-client-ui-layout/lib/client.js:36`）；
  `ctx.layout.openDetails()` 打开且默认写 **360px**（同文件 :302）；关闭写 0。
- AppFrame 渲染 `renderSlot('details', {})` 与 `data-side="details"` 拖拽 handle，拖拽调宽。
- 该槽当前由 `ui-conversation` 的 `DetailsPanel` 以默认 priority 0 占用（`dsh-client-ui-conversation/lib/client.js:9774-9793`）。

**CiteCiter 的用法（P2 实测通过）**：只有当侧边栏需要打开时才动态注册
`slots.inject('details', () => slots.register({ name:'details', priority: -1 }, Panel))`；
关闭时调用返回的 disposer 释放，工具详情面板自动恢复。`SlotCore.register` 的规则是
single 槽按 priority 升序、最低者渲染、同 priority 重复抛错（`dsh-client-ui-slots/lib/index.js:68-84`），
因此 priority -1 会合法地临时遮挡 priority 0 的 shipped 面板。

**富媒体（P6 实测）**：
- 任意 React 元素可以在面板里渲染（panel 就是我们的组件）——包括内联 SVG。
- `@deepseek-ai/dsh-client-ui-primitives` 的 `MarkdownText`：GFM + KaTeX 数学 + fenced code
  （语言标签、复制、shiki 高亮）；**raw HTML 被平台有意丢弃**，只放行 http(s) 图片/链接。
- 因此“HTML”不能直接 `dangerouslySetInnerHTML` 进正文；设计用三层富媒体：Markdown/KaTeX/代码
  （默认）、` ```svg ` 围栏经白名单解析后渲染为 SVG、HTML 演示放进 `sandbox` iframe（不带
  allow-scripts）——后者为可选安全增强，见决策点 D6。

### 1c. “继承当前 session 上下文但不影响主 session”有哪些候选机制？各自读什么、写什么？

| 机制 | 读什么 | 写什么 | 对主 session | 浏览器侧可用性 | 取证 |
|---|---|---|---|---|---|
| `session.fork`（host `SessionStore.fork` / wire `session.fork` RPC） | 源会话已完成轮次前缀（deep clone seed，含工具结果等全部日志事件）；`atSeq` 控制截止边界 | 只创建新子会话（header 记 `parentSession`/`seedLength`，日志追加 `session/end-seed`） | **0 写入** | `ctx.sessions.fork()` 官方；P4/P5 实测 | api-proxy `async fork`（lib/index.js:2749）；session 子系统文档“fork(source, boundary…)”；P4 |
| 新建普通解释会话 + `session.prompt`（`session.create` + 自组上下文包） | 父会话窗口内 ConversationSnapshot（≤ 已加载窗口）或 `session.history` 任意历史页 | 只写新建子会话 | **0 写入** | `ctx.connection.api.sessions.create/history/prompt` 官方；P8 实测 | IApiClient 类型；P8 |
| `dsh-session-projection`（`ctx.sessionProjections`） | 对已提交事件做纯函数 fold，输出客户端 read model（UI 值） | 无（可选投影缓存写的是旁路 storage，不写会话日志） | 0 写入 | 客户端经 `useProjection`/history 尾页被动接收 | 包 README + subsystem 文档 |
| `dsh-session-reference`（`ctx.sessionReferenceResolver`） | `sessionQuery.readSurface()` 只读投影：user/assistant 文本 + compact checkpoint，预算 64KiB/源 | `prepare()` 本身只读、只**返回** `additionalContext`；是否落盘取决于调用方把返回内容 enqueue 进**目标** agent | 0 写入（若目标=主 session 则写主；CiteCiter 会令目标=解释子会话） | 仅 host 服务，浏览器无直接 RPC；需 host half 或复用现有 mention 宿主流程 | README + lib/index.js:341-350 |
| `dsh-subagent` + `dsh-subagent-fork-in-process` | fork provider 读取父日志到最后一个 `turn/end` 的平衡前缀作为 seed（`completedTurnPrefix`，lib/index.js:23） | 创建子 agent/session；one-shot 父侧只有在模型调用 `subagent` 工具时才会收到工具结果；continuable 子 agent 的 `reportFrom`/settlement 才会写父 | 取决于消费者，不自动写回 | **仅 host 服务**（`ctx.subagents`），浏览器没有 start RPC；模型工具专用 | README + subsystem/subagent 文档 |
| 动态 Cordis 插件（`cordis_define/run`） | 运行时内存定义 | 进程内存、会话日志只记 define 元数据；不持久、重启消失 | 可跨会话影响进程（工具/提示） | 浏览器经 cordis-client-runner 加载 | README；P7 冲突 |

**“继承且不影响”的证明（不只靠假设）**：P4/P5。父会话 18 个事件在“fork + 向子 prompt”前后
seq/type 完全一致；子会话历史 = 父前缀逐事件一致 + 自己的新 turn；浏览器当前会话仍是父会话。
主机 `prompt` 实现只对 `turnAgentFor(sessionId)` 解析出的目标 agent 调 `followup/steer`
（`dsh-host-apiproxy/lib/index.js:2822-2877`），不存在任何父写路径。

### 1d. 侧边栏里的解释由谁生成？复用现有 Agent/Subagent 还是需要新服务？

**答案：复用现有 Agent 会话（普通 session），不新增任何生成服务。**
- 生成器 = 现有 `agent-loop` + 现有 LLM 路由 + 现有 agent preset 组合，跑在**独立子会话**里。
  两个启动通道：
  - 通道 A（推荐）：`session.fork(parent, atSeq=所选消息 finalNode.seq)` → 子会话已带父前缀，
    再 `session.prompt(解释模板)`。
  - 通道 B：`session.create({cwd, agentPreset})`（P8 证明官方可用）→ `session.prompt(自组上下文包)`。
- 浏览器没有创建 subagent 的 RPC（RPC map 只有 `subagent.list/history/prompt/interrupt`，
  prompt 仅限 session-backed subagent；`SubagentRuntime.start` 是 host 服务），所以
  “复用 Subagent 注册表”只能通过 host half 实现，不是 v1 的零侵入路径。
- 动态 Cordis 插件不适合作为产品载体：定义只活在进程内存、不持久、重启消失，README 明说
  “To keep an experiment, … implement a normal local plugin”，且浏览器半运行需要页面应答/授权。

---

## 2. 选定机制的原理精读（数据流、生命周期、挂载点、事件流、隔离边界）

### 2.1 UI slot 系统的挂载与生命周期（官方能力）

- `SlotCore`（`dsh-client-ui-slots`）持有声明账本：owner 注册条目时可在 `children` 中**声明**
  子槽（声明 = 渲染授权 = 运行时 spec）。slot 有 single/list/keyed/chain 四种，scope 有
  root/session-maybe/session 三种。
- `SlotRegistry`（`dsh-client-runtime`）是 cordis Service 层：`register()` 是唯一注册 API，注册
  挂在**调用方 fiber** 上（插件卸载即级联释放条目、子槽与 store）；`inject(slotKey, cb)` 等待
  声明存在后同步执行 cb；`entriesOfSlot()` 返回 shadowing 赢家（最低 priority）。
- 渲染入口只有 `root`；`ui-layout` 注册 AppFrame 进 root 并声明 `sidebar / conversation /
  details / shell.overlay` 四个子槽。所有 CiteCiter UI 都挂在这四个官方槽下面，不替换任何
  owner（符合文档 “To ADD rather than replace” 规则）。

### 2.2 侧边栏（details 槽）生命周期

- 打开：`ctx.layout.openDetails()` 写 layout store `details=360`（P2 实测 grid
  `… 360px`）。
- 渲染条件：AppFrame 只在“当前会话存在且非 blank”时给 details 非零宽度
  （`detailsSession` 推导），所以侧边栏天然绑定当前主会话；切换主会话时 AppFrame 自动
  `closeDetails()`。这与“跨消息常驻、不跨会话常驻”的推荐语义一致。
- 拖拽：handle `data-side="details"`，`onDetailsDrag` 写 `setDetails(base - dx)`，clamp 300–520。
- 关闭：`ctx.layout.closeDetails()` 写 0（DOM 保留 mounted，视觉隐藏）；CiteCiter 再调用注册
  disposer 恢复工具详情面板。
- 富媒体渲染：panel 组件内部用 `MarkdownText` + 自定义 fence 渲染器（§4.5）。

### 2.3 解释会话数据流与隔离边界（核心）

推荐通道（fork）端到端数据流：

```
[主会话 DOM] 选中文本 + anchorKey
      │  contextmenu listener（P3）
      ▼
[菜单 shell.overlay] Citer!
      │ 点击：取 useSession 快照 -> nodes.get(anchorKey) -> finalNode.seq / 文本 / turn
      ▼
[client sessions 服务] ctx.sessions.fork({ sessionId: parent, atSeq: seq })
      │  host api-proxy: readSessionState(parent)（只读快照，不 acquire Agent）
      │  -> ctx.agents.create({ seed: events.slice(0, cut), meta:{parentSession,seedLength} })
      ▼
[host 新子会话 agent] 普通 agent-loop + 父 prefix seed
      │  客户端 ctx.sessions.binding(childId).session
      │  -> open() 拉基线（注意类型面缺口 D8）-> prompt([解释模板])
      ▼
[子会话运行] host mux 广播 session/event -> 客户端子绑定折叠为 ConversationSnapshot
      │  panel 订阅 child snapshot 渲染（P5：running true→false、events 18→27）
      ▼
[父会话] 不出现任何新消息/事件；父日志保持不变（P4/P5 实测）
```

关键边界（源码级）：
- fork 读取：`readSessionState(sessionId)` 取 attached session 或 `inspectServable` 的
  `{header, events:[...]}`，**不获取 Agent、不 resume、不发布**（api-proxy :2010-2022）。
- fork 截止：`boundary = events.find(e => e.type==='turn/end' && e.seq >= atSeq)`；边界后
  `cut = boundary.seq+1`，再跳到下一 `turn/start` 之前；种子为 `events.slice(0, cut)`
  （api-proxy :2749-2810）。含义：**解释子会话只看到“到所选消息那一轮为止”的历史**，
  看不到之后的追问——这正好是“在该文本写出时刻的上下文”。
- fork 创建：`ctx.agents.create({sessionId: childId, seed, meta:{cwd, parentSession, seedLength,
  agentPreset}, agentOptions: agentOptions(), setup})`（api-proxy :2792-2800）。子会话继承父的
  cwd、模型路由与 preset 组合；来源会话只被读。
- prompt 写边界：`turnAgentFor(request, sessionId)` → 只对该 session 的 agent
  `followup/steer`（api-proxy :2822-2877）。主会话从任何路径都不可达。
- 客户端子流：`SessionManager` 对未实例化 session 只缓冲 pending frame；实例化后
  `handleMuxEnvelope` 路由。注意 `acceptLiveEvent` 要求 `openState === 'open'` 才折叠内容
  （`dsh-client-runtime/lib/client.js:7654-7661`），所以 CiteCiter 必须在绑定后调
  `session.open()`（具体类公开方法，类型面缺口见 D8）。

### 2.4 官方能力 vs 需要新增的插件行

| 环节 | 官方能力（直接复用） | 新增插件行/代码 |
|---|---|---|
| 包挂载 | profile patch 行 + `dsh.client` package 协议 + `/plugins/<id>/client.js` 服务 | 1 行 patch + 1 个 npm 包 |
| 选中与右键 | 无专用 API；transcript 的 `data-chat-flow-*` 与 `window.getSelection` 是既有事实 | 文档级监听器 + 菜单组件 |
| 菜单浮层 | `shell.overlay` list 槽 | 注册 1 个条目 |
| 可调宽侧边栏 | `details` 单槽 + `ctx.layout.openDetails/closeDetails` + 拖拽 handle | 动态注册 1 个条目（priority 计算 + disposer） |
| 上下文继承 | `session.fork` RPC（种子深拷贝、lineage）或 `session.create+history` | 无（客户端编排代码） |
| 解释生成 | 普通 session agent-loop + `session.prompt` | 无（提示词模板是插件数据） |
| 子会话流 | `ctx.sessions.binding(childId).session` ObservableSnapshot | 订阅/渲染代码 |
| 停止 | `SessionFace.cancel()` | 按钮接线 |
| 清理 | `workspaces.archiveSession()` / 保留 | 按钮接线 |
| 富媒体 | `MarkdownText`（GFM/KaTeX/code）、React SVG | 自定义 fence 解析器与组件 |

即：**核心机制全部官方；新增代码集中在交互编排、面板 UI、提示词模板与 fence 渲染器。**

---

## 3. 最小可行性探针汇总（细节、命令与原始输出见 `docs/evidence/probes.md`）

| # | 问题（是/否） | 结论 | 关键证据 |
|---|---|---|---|
| P1 | 树外 client 包能否只靠 `--patch` 行被挂载并服务？ | 是（须按包名安装进 profile node_modules；目录路径 ESM 导入失败） | boot graph 39 行含 `citeciter-probe-p1`；`/plugins/.../client.js` 200 |
| P2 | client 包在真实浏览器渲染 `shell.overlay`？ | 是 | markerCount=1 |
| P2b | `details` 槽动态抢占/打开/拖拽调宽/dispose 恢复？ | 是 | 360px→拖拽 440px；afterDispose 恢复 priority 0 |
| P3 | 文档级右键监听 + flow 属性 + overlay 菜单可行？ | 是（且流外选择不拦截） | 合成 assistant-step 节点选中后菜单带 kind/anchor/text |
| P4 | fork+prompt 子会话，父会话不变（API 级）？ | 是 | 父 18 事件前后 seq/type 全同；子=前缀18+新turn9 |
| P5 | 浏览器侧 fork→bind→open→prompt→流式子会话，当前会话不变？ | 是（发现 `ISession` 缺 `open()` 类型面） | parentEvents 18→18；childEvents 27；sawRunning true→false |
| P6 | 面板渲染 KaTeX/代码/SVG？ | 是 | katexCount=3、codeBlocks=2、svgCount=1 |
| P7 | 进程级 Host provider 重复注册抛错？ | 是（复核既有陷阱） | `Host Cordis inspect provider ... is already registered` |
| P8 | `ctx.connection.api` 官方创建/读会话？ | 是 | `session.create` ok；`session.history` 3 事件 |

所有探针 0 次成功模型调用（P4/P5 的 prompt 在无 key 临时环境里被接受、LLM 请求随即失败并产生
`turn-error`，仍足以验证日志写边界与流行为）。探针没有修改主 session 与本机 DSH，
没有写入 `~/.dsh` 配置或会话。

---

## 4. CiteCiter 端到端流程设计（选中 → 菜单 → 上下文引用/快照 → 解释会话 → 富媒体渲染 → 关闭清理）

### 4.1 状态机

```
IDLE ──(非空选中且 anchor 命中 assistant-step 流节点, contextmenu)──> MENU_SHOWN
MENU_SHOWN ──(点 Citer!)──> OPENING（openDetails + 注册 details 槽）
MENU_SHOWN ──(点别处/Esc)──> IDLE
OPENING ──(槽已渲染、节点校验通过)──> RESOLVING（fork 子会话或复用已有子会话）
OPENING ──(校验失败)──> ERROR_TOAST → IDLE（面板留空提示）
RESOLVING ──(子会话就绪+open)──> PROMPTING → RUNNING
RESOLVING/PROMPTING/RUNNING ──(错误/取消)──> ERROR（保留面板，可重试/新开）
RUNNING ──(child snapshot 出现 assistant 最终消息)──> ANSWER（渲染富媒体）
ANSWER/RUNNING ──(再次 Citer 同一主会话)──> PROMPTING（复用同一子会话）
ANSWER ──(用户关闭面板)──> CLOSED（dispose details 注册 + closeDetails）
CLOSED ──(同一主会话再次 Citer)──> OPENING（重注册，历史仍在子会话）
主会话切换/移除 ──任意状态──> CLOSED（AppFrame 自动 closeDetails；CiteCiter 释放本会话 UI 状态）
```

### 4.2 选中与菜单（对应任务目标 1）

1. `contextmenu` 处理器读取 `window.getSelection()`；空选/折叠/不在
   `[data-chat-flow-kind]` 内时不作为（保留浏览器默认右键）。
2. 只接受 `kind === 'assistant-step'`（v1）；user/context 节点不弹菜单（可选后续扩展）。
3. 选中文本 `sel.toString().trim()` 截断到 4000 字符显示；跨多个流节点（range 祖先不在单一
   flow 内）时提示“请在一条回复内选择”。
4. 菜单条目 `Citer!` 渲染于 `shell.overlay`，位置 = 鼠标坐标，带 pointer-events:auto；
   点击后立即隐藏菜单并进入 OPENING。

### 4.3 上下文引用/快照（对应任务目标 3：继承但不影响）

- 解析：面板组件用 `useSession(s => s.chat.nodes.get(anchorKey))` 取节点：
  - `data.status === 'settled'` 且有 `finalNode` → 取 `finalNode.seq`、blocks 文本、
    turn/step、messageId；
  - `running`（流式未完成）→ 提示“回复尚未完成”，不发起 fork（避免 `fork-unavailable`）。
- 子会话策略（推荐）：
  1. **同一主会话第一次 Citer**：`ctx.sessions.fork({ sessionId, atSeq: finalNode.seq })`；
     子会话标题 `child.rename('Citer · ' + 选中文本前 24 字)`。
     创建并 `open()` 后立即执行 `child.command('/permission read-only')`
     （官方 `SessionFace.command` 走 `/permission` 命令），把解释子会话的沙箱模式切到
     `read-only`（写入被沙箱拒绝），同时 approval policy 保持 `ask`；P9 实测子会话追加
     `permission/preset: read-only` 与 `sandbox/mode: read-only`，父会话不变。
  2. **后续 Citer 同主会话**：复用已记录的子会话（模块内 Map<parentSessionId, childId> +
     `defineStore` 持久化到浏览器 localStorage），调用 `child.prompt()` 追加追问。
     不提供“新开解释”按钮；面板内提供 **Cite 会话管理 UI**（按父会话列出其下所有 Cite
     解释子会话，可打开历史解释、归档或切换到某个旧子会话继续追问；数据来源 =
     `session.list` 的 `parentId` 为当前父会话的行，动作 = 归档/重命名/继续追问）。
  3. 提示词模板（子会话 user/message）：
     ```
     [角色] 你是 CiteCiter 解释器。只解释下面引用的内容，不执行任务、不修改文件。
     [引用自主会话 turn=T, seq=S] <selected text>
     [要求] 先一句话直觉解释，再展开原理；数学用 $...$；代码用带语言围栏；
     如需图，输出一个 ```svg 围栏（不要脚本/foreignObject）；HTML 演示输出 ```html
     由前端放入沙箱 iframe。不要输出与引用无关的内容。
     ```
  4. 上下文由 fork seed 自动携带（截至所选轮次）；**不**再把主会话快照塞回主会话。
     可选：若子会话为空/全新创建（通道 B），则从父 `ConversationSnapshot` 构造
     ≤8KiB 上下文包（所选消息 + 同轮次 + 前 2 轮 user/assistant 文本）写入子会话。
- 隔离断言（代码阶段用测试固化）：发起解释前后，`binding(parent).session.events.length`
  不变、父快照 promptError 不变、父当前会话指针不变。

### 4.4 解释会话运行与生命周期

- 创建后立即 `const child = ctx.sessions.binding(childId).session`；调用 `child.open()`
  （缺口 D8）拉基线并订阅 `child.subscribe(...)`（返回 unsubscribe，挂在 `ctx.effect`）。
- 设置只读权限：`await child.command('/permission read-only')`（P9）；失败不阻塞解释，
  但在面板上标出“当前解释会话继承父级写权限”。
- `child.prompt([{type:'text', text: template}], 'queue')`；失败显示 `promptError`。
- RUNNING：面板显示 loading；`child.cancel()` 按钮（官方 `SessionFace.cancel`）。
- 结束判定：child snapshot 中新的 settled assistant 节点（排除 seed 前缀：记录
  `header.seedLength` 或 fork 时子会话已有事件数作为基线）。
- 主会话结束/切换：`useSessions` 检测父 id 不再 listed/current 变化 → 面板进入 CLOSED，
  释放本会话 UI 状态；子会话可保留（成为普通历史分支）或按 D7 归档。

### 4.5 富媒体渲染协议（对应任务目标 4）

- 默认：子会话最后一轮 assistant 文本走 `MarkdownText`（GFM/KaTeX/代码高亮/复制）。
- 扩展 fence（CiteCiter 自有解析，在 settled 文本上做，streaming 期间只渲染 MarkdownText）：
  - ` ```svg `：DOMParser 白名单解析（允许 svg/g/circle/rect/path/text/defs 等；丢弃
    script/事件属性/`javascript:`/foreignObject），通过 `dangerouslySetInnerHTML` 放进
    `<svg>` 元素。
  - ` ```html `：默认关闭（D6），以普通代码块展示；用户手动开启后渲染进
    `<iframe sandbox="allow-same-origin">`（不带 `allow-scripts`）作为静态 HTML/CSS 演示。
  - 解析失败：该 fence 降级为普通代码块 + 一行“渲染失败，显示源码”。
- 渲染失败兜底：CiteCiter 面板组件自身 try/catch 边界 + `slots.onEntryError` 监督（官方
  slot 崩溃观测）；崩溃时显示纯文本（取 assistant blocks 的 text 字段），不影响主会话。

### 4.6 失败路径矩阵

| 失败 | 检测 | 处理 | 主 session 影响 |
|---|---|---|---|
| 选中内容被编辑 | 主会话 settled 消息只追加，不会编辑；若节点被 compaction shadow 出窗口，`nodes.get` 返回 undefined | 提示“上下文已不可用，请重新选择” | 无 |
| 选中跨两条消息 | range 祖先不是单一 flow 元素 | 提示“请在一条回复内选择” | 无 |
| 流式消息未完成 | `data.status === 'running'` 或无 `finalNode` | 禁用 Citer/提示稍候 | 无 |
| fork 时该轮次未完成 | host `fork-unavailable` | 面板显示错误码与重试 | 无 |
| 父会话已结束/归档 | `useSessions` 列表变化 | 关闭面板、释放状态 | 无 |
| fork/历史读取失败 | RPC error（`session-not-found` 等） | 面板错误 + 重试按钮 | 无 |
| 子会话 prompt 被拒 | `promptError`（如 credential 缺失） | 面板显示错误；不重试风暴 | 无 |
| 解释轮超长/超限 | child snapshot 出现 `turn-error`/`max-tokens`/stop reason | 显示 stop reason；提供“停止/换一种问法”，必要时在管理 UI 中归档后重来 | 无 |
| 富媒体渲染失败 | 组件边界异常 | 降级纯文本/源码 | 无 |
| 子会话并发解释 | 对同一 child 的 in-flight prompt | 队列由 host inbox FIFO 保证；面板显示排队状态 | 无 |
| 插件被 HMR/unload | ctx.effect 统一释放监听、槽注册与订阅 | 面板消失，工具详情面板恢复（P2b 语义） | 无 |

---

## 5. 设计讨论：至少两个候选方案与推荐

### 方案 A（推荐）：纯外部 client 插件 + 复用现有会话 RPC

- 包：`@deepseek-ai/dsh-citeciter`（host half 为无副作用空壳；browser half 全部逻辑）。
  安装：`dsh plugin --profile web add @deepseek-ai/dsh-citeciter` +
  `~/.dsh/profiles/web/cordis.patch.yml` 插入 1 行 `- insert: [{ id: citeciter, name: '@deepseek-ai/dsh-citeciter' }]`。
- 机制：§4 全流程；上下文继承用 `session.fork`（主）+ `session.create`/`history`
  （P8，备选/降级）；生成复用普通 session agent；不注册任何 Host service。
- 冲突处理：无进程级 Host 注册（P7 陷阱不触发）；details 槽动态注册时计算
  `min(现存 priority)-1` 避免同 priority 抛错；`shell.overlay` 用唯一 id；插件行 id 唯一。

### 方案 B：定制 host half + 官方 Host 服务（session-reference / subagent fork）+ 新 Remote 面

- 在 DSH 主仓库新增 `packages/host/citeciter`（或等效路径），提供 `ctx.citeciterExplainer`：
  用 `ctx.sessionQuery.readSurface(parent)` 或 `ctx.sessionReferenceResolver.prepare()` 做
  服务端有界快照；用 `ctx.subagents.start('fork', { toolFilter, persona })` 或
  `ctx.sessions.create/fork` 创建解释子会话并 `followup`；用 `@Remote` 暴露
  `startExplain/getStatus`；client 包经 `api-remotes` 装配调用。
- 优点：能**硬性**限制解释会话工具面（`toolFilter`）、注入 persona、走官方 session-reference
  预算语义；快照由 host 读，不依赖客户端窗口。
- 代价：需修改主仓库（新包 + `api-remotes` client 装配 + Typert 生成 + 测试/快照/Agent Note），
  工作量大；host 服务名与注册要过 P7 类冲突审计；升级需跟随 DSH 版本。

### 方案 C（不推荐，记录备查）：动态 Cordis 插件（`cordis_define/run`）承载 UI

- 可快速试验 UI，但定义只在进程内存、不持久、重启即失、跨会话全局副作用、浏览器半需应答授权；
  官方 README 明确引导“保留实验应实现普通插件”。仅适合现场验证 UI 想法，不适合产品。

### 对比表

| 维度 | A 纯 client + session RPC | B host half + Remote | C 动态 cordis |
|---|---|---|---|
| a. 选中+右键 | 满足（P3） | 满足（UI 同 A） | 满足（临时） |
| b. 可调宽侧边栏 | 满足（P2b 官方 details） | 同 A | 同 A |
| c. 继承且不影响 | 满足且已实测（P4/P5） | 满足（官方 host 服务），需更多测试 | 进程内存，不满足持久语义 |
| d. 解释生成 | 复用普通 session agent，零新服务 | 复用 subagent/agent，新增编排服务 | 临时运行 |
| 富媒体 | 满足（P6） | 同 A | 同 A |
| 硬性工具限制/解释 persona | 不能（fork 继承父 preset；只能提示词约束） | 能（subagent toolFilter/persona） | 能（临时作用域） |
| 对主 session 风险 | 极低（只读父快照 + fork；写路径只达子） | 低（同样只写子；host 代码需防误写父） | 中（进程级副作用） |
| 侵入性 | 最小：1 包 + 1 patch 行 | 高：主仓库多包/装配/生成 | 无文件（但临时） |
| 挂载/注册冲突 | 不注册 Host service；槽 priority 动态计算 | 需处理 Remote/Host 服务唯一性与 P7 | P7 相关（tool-cordis 已知冲突） |
| 工作量估计 | S：1 个 client 包（约 8–15 文件）+ 测试 + 快照 | L：主仓库 2+ 包、api-remotes、生成与门禁 | S（试验） |
| 维护 | 仅依赖公开 client API（`ISession.open` 类型缺口 D8） | 跟随 DSH 主仓库升级节奏 | 每次重启消失 |

**推荐**：方案 A 先行。它已把目标交互四要素全部用官方能力+最小探针证明；上下文隔离是
fork 的既有语义并经 P4/P5 实测。方案 B 作为“需要硬工具限制/服务端快照”时的第二阶段，
是否改主仓库由用户拍板（D1）。

---

## 6. 关键歧义与决策记录（用户已拍板，2026-08-17）

### 6.1 假设确认表

| 假设原文 | 用户结论 |
|---|---|
| 侧边栏是否跨消息常驻：同一主会话内常驻 | 正确 |
| 解释会话是否允许工具调用：v1 允许 | 正确 |
| 解释结果富媒体：Markdown + KaTeX + 代码 + 白名单 SVG；HTML 用沙箱 iframe 且默认关闭 | 正确（D6 默认关闭、手动开启） |
| 一个主会话的解释子会话数量：默认复用 1 个 | 默认一个；默认保留、显式归档；**不提供新开按钮**，提供一个管理父会话下 Cite 会话的 UI |
| 解释上下文窗口：fork 截止在所选消息所在轮次 | 正确 |

### 6.2 决策清单（最终）

- **D1 纯外部插件**：采纳方案 A。不修改 DSH 主仓库。
- **D2 fork**：采纳。解释子会话一律 `session.fork` 继承所选轮次为止的历史。
- **D3 子会话生命周期**：每主会话默认一个 Cite 解释子会话并复用；不提供“新开解释”按钮；
  面板内提供 Cite 会话管理 UI（按父会话列出/打开/归档/切换旧解释）。子会话默认保留，
  用户可显式归档（`workspaces.archiveSession`）。
- **D4 工具权限 = 全部读权限、禁止写**：fork 后立即 `child.command('/permission read-only')`
  把解释子会话沙箱切到 `read-only`（写入被沙箱拒绝；P9 实测）。保留说明：v1 无法把
  approval policy 单独设为 `never`（`/permission` 只成组设置），若解释模型主动请求
  `sandbox_permissions` 提升，approval 问题属于子会话，需在 Cite 会话管理 UI 或子会话视图中
  应答/拒绝；提示词模板明确“不要请求提升权限”。
- **D5 侧边栏同会话常驻、切换会话自动关闭**：采纳平台原生 details 槽行为。
- **D6 HTML 演示默认关闭、手动开启**：采纳。关闭时 ` ```html ` 以代码块源码展示；开启后
  渲染进 `sandbox` iframe（不带 `allow-scripts`）。
- **D7 默认保留、显式归档**：采纳。Cite 管理 UI 提供归档动作。
- **D8 插件内解决 `ISession.open()` 类型面缺口**：采纳。插件内做窄化声明
  `type OpenableSession = ISession & { open(): Promise<void> }` 并写测试锁定，不等待上游。

---

## 7. 与 DSH 编码/插件开发规范的符合性核对（本阶段先读条款，设计不与规范冲突）

以下条款来自 master 的 `AGENTS.md` / `docs/development.zh.md` / `docs/cordis-primer.zh.md` /
`docs/user/develop/basic/index.zh.md` / `docs/cookbook/extension-cookbook.zh.md`
（`.refs/docs/` 已保存只读副本）：

1. 万物皆插件、不在 loop 里加行为：CiteCiter 是挂在 profile patch 上的普通插件，只使用
   UI slot 与 wire RPC，不改 agent-loop。✅
2. ESM + `@deepseek-ai/dsh-<name>` 命名 + `@deepseek-ai/cordis` peerDep：包骨架照此设计。✅
3. registrations are effects：contextmenu 监听由 `ctx.effect()` 清理；`slots.inject()` 在 DSH runtime
   内部用 effect 管理 slot 注册；子会话订阅由插件 lifecycle effect 释放。✅
4. 通过 `inject` 声明硬依赖：当前 browser half 声明 `layout`、`slots` 和 `sessions`；本实现
   没有未声明的 `ctx` 服务读取。✅
5. 不替换 shipped UI 的整块 seat：只在打开时用 priority 遮挡 details 单槽并保证 dispose
   恢复；菜单使用可加的 `shell.overlay`；不注册 `root/sidebar/conversation`。✅
6. Model-visible ⟺ logged：解释提示词作为子会话 `session.prompt` 的 user/message 落盘；
   上下文若自组，同样写入子日志；没有任何旁路注入主会话。✅
7. 当前没有 deployment policy Config。菜单预览长度是本地呈现常量，富媒体长度上限是固定的
   安全资源限制；若加入会影响部署策略的限制或开关，必须先增加经 cordis.yml 验证的 Config。✅
8. misconfiguration fails loud：包缺 `exports["./client"]`/bundle 未构建时 client-modules
   在启动扫描大声抛错（官方行为）；我们的发布脚本 `pnpm run build` 与 `dsh plugin add`
   验证包可解析。✅
9. 测试与快照：当前有 focused unit tests 和 browser smoke；尚未接入上游的 keyless snapshot
   harness。若将本包作为 DeepSeek Harness 源码工作区内的贡献，必须在同一变更补上该快照。
10. 文档双语/README/JSDoc：正式包随 README（含 Model Experience 小节）与 JSDoc 交付；
    本报告为设计文档，不在该门禁范围。✅

---

## 8. 残余风险与边界条件（如实声明）

- **DOM 契约耦合**：`data-chat-anchor-key / data-chat-flow-kind` 是 ui-conversation 的实现
  事实（本机实测存在），但未出现在其 README 公共契约中；上游重命名会破坏选中解析。
  缓解：包内把选择器常量集中 + 每次版本升级跑 P3 类快照；若上游将来提供官方 selection
  slot，切过去。
- **`ISession.open()` 类型缺口**（D8）：本地窄化声明是对公开类方法的依赖，需测试锁定。
- **fork 长前缀成本**：子会话首请求继承前缀（fork README 声称同 provider/model 下可复用
  KV 前缀，但 billing/磁盘成本仍存在）；阈值策略待 D2。
- **槽 priority 竞争**：别的第三方插件也可能用 priority -1 注册 details；设计改为注册前
  计算 `min(existing)-1`，避免同 priority throw。极端情况下两个插件都动态注册时，后注册者
  会赢，属平台既有 shadowing 语义。
- **解释会话工具面仍继承父 preset**：沙箱已按 D4 切到 read-only，写操作会被沙箱拒绝；
  但工具 schema 仍可见，approval 提升请求需人工/管理 UI 处理（见 §6.2 D4）。
- **会话列表累积**：每主会话一个解释子会话；管理 UI 支持显式归档（D7），因此列表不会
  无限增长。
- **本阶段未做真实模型调用验证**：P4/P5 的轮次在无 key 环境以 `turn-error` 结束，证明的是
  日志/流/隔离机制；真实解释质量（提示词模板、富媒体协议）需在下一阶段有 key 的会话里做
  快照测试。
- **GitHub 主仓库未完整克隆**：源码级取证来自安装树 lib（0.1.0-rc.6）与 jsDelivr 拉取的
  master 文档；官方 `packages/**/tests/` 未逐文件阅读，已用自跑探针补偿。

---

## 附录 A：探针文件清单（工作区内，均只读可复现）

- `probes/p1/**`、`probes/p1-web.patch.yml`
- `probes/p2/**`、`probes/p2-web.patch.yml`
- `probes/p3/**`、`probes/p3-web.patch.yml`
- `probes/p6/**`、`probes/p6-web.patch.yml`
- `probes/p7.mjs`、`probes/p7-headless.patch.yml`
- `probes/p8/**`、`probes/p8-web.patch.yml`
- 复现命令与原始输出：`docs/evidence/probes.md`
- 只读文档镜像：`.refs/docs/**`（jsDelivr 拉取，勿改）

## 附录 B：临时会话 id（探针产物，位于临时 DSH_HOME，可随时删除）

- `session-c4622904-5b66-4223-a2cb-b47a8eb9e954`（P4/P5 父）
- 其 fork 子会话若干（见 probes.md）；P8 新建的 blank 会话若干。
- 全部在 `/tmp/citeciter-dsh-home`，不涉及真实 `~/.dsh/sessions`。

（本报告与探针均已 commit；D1–D8 已拍板（见 §6），下一步可进入实现阶段。）
