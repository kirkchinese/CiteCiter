# CiteCiter 探针记录（全部为最小可行性探针，仅验证关键假设）

- 日期：2026-08-17（本机时间）
- 运行环境：Node.js v22.23.2、pnpm 11.21.0、DSH 安装树 `0.1.0-rc.6`
- 只读纪律：所有探针使用临时 `DSH_HOME=/tmp/citeciter-dsh-home`，从不使用真实 `~/.dsh`；
  对真实 `~/.dsh` 仅做了 HTTP GET 读页面（`curl http://127.0.0.1:3080/`）用于取证 boot graph。
- 探针代码位置：`<repo>/probes/p1`、`p2`、`p3`、`p6`、`p7`、`p8`
  （P4/P5 复用 P2 服务器与临时 DSH_HOME 中由 API 创建的会话）。
- 每个探针只回答一个“是/否”问题；失败与修正过程也保留，因为失败原因本身就是结论。

## P1：外部本地 client 插件能否只靠 profile patch 挂载并被 `/plugins` 服务？

问题：一个树外、本地、未修改 DSH 的包，能否以 `--patch` 插入的 row 成为浏览器插件，并出现在
`window.__DSH_BOOT__` 中？

关键实现证据（失败与修正）：

第一次直接使用目录路径作为 row 的 `name`，Loader 失败：

```
failed to import loader entry citeciter-probe-p1 (<repo>/probes/p1):
Directory import '<repo>/probes/p1' is not supported resolving ES modules
  ... ERR_UNSUPPORTED_DIR_IMPORT
```

结论 1（失败本身是发现）：**ESM 目录导入不受支持**。client 包必须按包名从 profile 的
`node_modules` 解析（这正是 `dsh plugin --profile web add <pkg>` 的安装路径）。修正方法：
在临时 profile 中建立软链：

```sh
ln -sfn <repo>/probes/p1 /tmp/citeciter-dsh-home/profiles/node_modules/citeciter-probe-p1
```

patch 改为包名：

```yaml
- insert:
    - id: citeciter-probe-p1
      name: citeciter-probe-p1
```

启动（临时 home、独立端口）：

```sh
DSH_HOME=/tmp/citeciter-dsh-home dsh --profile web \
  --patch <repo>/probes/p1-web.patch.yml --port 3901
```

观测输出：

```
[citeciter-probe-p1] host half apply
dsh web: http://127.0.0.1:3901
```

页面 boot graph 中出现：

```json
{
  "id": "citeciter-probe-p1",
  "url": "/plugins/citeciter-probe-p1/client.js?rev=5cfe90b75a84",
  "inject": ["@deepseek-ai/dsh-client-runtime", "@deepseek-ai/dsh-client-ui-layout"]
}
```

`GET /plugins/citeciter-probe-p1/client.js`：HTTP 200，1082 字节，包含
`window.__ModuleLoader__.load` 工厂与 `P1 overlay OK` 标记。

结论：**是**。条件：包必须能被 profile 的 Node 解析链按包名解析；`--patch` 只贡献配置，
不改变解析锚点。

## P2：client 插件是否在真实浏览器里运行，并把 `shell.overlay` 渲染出来？

问题：P1 只证明“被服务”。浏览器半是否真正 apply 并渲染？

命令：

```sh
node /tmp/citeciter-p2-test.mjs   # playwright(chromium headless) 打开 3901
```

输出：

```json
{"markerCount":1,"errors":[...]}
```

结论：**是**。树外 client 插件在浏览器内核中激活并渲染（`shell.overlay` 中
`data-citeciter-probe="p1-overlay"` 数量为 1）。

## P2b（同一个包内的第二个问题）：`details` 槽动态抢占 + 可拖拽宽度 + dispose 恢复

问题：侧边栏能否动态注册进 `details`、打开、拖拽调宽、关闭后恢复原 occupant？

浏览器端探针输出（`node /tmp/citeciter-p2-page.mjs`，临时 session 已通过
`session.create` + `session.prompt` 变成非 blank）：

```json
{
  "beforeMount":       [{"priority":0}],          // 唯一 occupant：shipped 工具详情面板
  "mount":             {"requested":true},
  "afterMount":        [{"priority":-1}],          // 我们的 entry 获胜（最低 priority 渲染）
  "open":              true,
  "detailsCount":      1,
  "frameColsBefore":   "280px minmax(0px, 1fr) 360px",  // openDetails() 默认 360px
  "handleCount":       1,                          // 可拖拽 handle 存在
  "frameColsAfterDrag":"280px minmax(0px, 1fr) 440px",  // 向左拖 80px -> 宽度 440px
  "dispose":           {"disposed":true},
  "detailsCountAfterDispose": 0,
  "afterDisposeSlots": [{"priority":0}],           // 恢复为原 occupant
  "errors": []
}
```

结论：**是**。注册进 `details`（single 槽，priority -1）即可拿到官方三栏布局中的右栏；
宽度契约 300–520px（源码 `computeColumns` 中 `clampWidth(details, 300, 520)`）；
`ctx.layout.openDetails()` 打开、拖拽 handle 调宽、注册 disposer 释放后工具详情面板恢复。

## P3：选中文本 + 右键菜单机制是否可行？

问题：文档级 `contextmenu` 监听 + transcript DOM 的 flow 数据属性 + `shell.overlay` 菜单，
能否只对“消息流内的选中文本”弹出 `Citer!`？

真实 transcript DOM 取证（临时会话已渲染的 user/context/turn-error 节点）：

```
count=5
kind=user        anchor="13:input-message04cf…"
kind=context     anchor="13:input-message63bc…"
kind=turn-error  anchor="10:turn-error1"
kind=turn-tail   anchor="9:turn-tail1"
```

每个 flow item 都带 `data-chat-anchor-key`、`data-chat-flow-key`、`data-chat-flow-kind`；
slot 包装层为 `data-slot="conversation.chat.node"`。

浏览器端合成 assistant-step 节点并派发右键的输出（`node /tmp/citeciter-p3-page.mjs`）：

```json
{
  "outside": {"defaultPrevented":false,"menuExists":false},
  "inside":  {"defaultPrevented":true,"selectedText":"iemann curvature tensor,"},
  "menu": {
    "kind":"assistant-step",
    "anchor":"42:assistant-step7",
    "label":"Citer! iemann curvature tensor,",
    "style":"position: fixed; left: 220px; top: 140px; ..."
  },
  "errors": []
}
```

结论：**是**。官方没有“选中文本右键菜单”专用 slot；可行方案是文档级监听 +
`window.getSelection()` + 解析 `closest('[data-chat-flow-kind]')` + `shell.overlay` 菜单。
选择发生在消息流之外时不拦截浏览器右键；选择在消息流内时 `preventDefault()` 并弹出菜单。
该 DOM 契约的耦合风险见 DESIGN.md §8。

## P4：`session.fork` + 向子会话 prompt 是否“继承但不影响父会话”？（HTTP API 级）

前置：临时 DSH_HOME 中 API 创建父会话 `session-c4622904-…`，prompt 后父历史 18 个事件
（seq 0–17，含 turn/start…turn/end）。命令与观测：

```sh
curl -X POST …/api/session.fork   {"sessionId":父, "atSeq":14}
# -> {"ok":true,"value":{"sessionId":"session-ec29d918-…"}}

curl -X POST …/api/session.prompt {"sessionId":子, "mode":"queue",
                                   "content":[{"type":"text","text":"解释：Riemann curvature tensor"}]}
# -> {"ok":true,"value":{"accepted":true}}
```

prompt 子会话并等待 6 秒后重新读取：

- 父历史：`ok=true events=18`，seq 序列 `[0..17]`，类型序列与 prompt 前**完全相同**。
- 子历史：`ok=true events=27`；seq 0–17 与父前缀逐事件一致（继承的种子），
  seq 18–26 为子自己的新 turn（`agent/inbox/spliced`、`turn/start`、`user/message user`、
  `request/header`、`assistant/chunk`、`step/end`、`turn/end`）。
- `session.list`：子行 `parent= session-c462…`、`origin=None`、`blank=False`；父行不变。

结论：**是**。fork 创建独立子会话并深拷贝已完成轮次前缀；向子会话 prompt 只写子日志；
父日志字节级不变（本次为 18/18 事件、seq/type 全同）。

## P5：浏览器插件是否能 fork→绑定→prompt→流式子会话，且不切换当前会话、不写父会话？

浏览器端输出（`node /tmp/citeciter-p5-page2.mjs`，加了 `child.open()` 基线拉取后）：

```json
{
  "parentId":"session-c4622904-…",
  "childId":"session-1867f9dc-…",
  "promptAccepted":true,
  "currentAfter":"session-c4622904-…",   // 当前会话仍是父会话
  "parentEventsBefore":18,
  "parentEventsAfter":18,                 // 父事件数不变
  "parentUnchanged":true,
  "childEvents":27,                       // 子绑定 open() 后可见种子+新事件
  "childHasPromptEvent":true,
  "sawRunning":[true,true,true,true,false,false,false]  // 子会话 running 流到达
}
```

关键中间发现：若不给子绑定调 `open()`（`Session` 实例的公开方法，但不在客户端
`ISession` 类型面里），`acceptLiveEvent` 在 `openState !== "open"` 时直接丢弃事件，
快照只更新 running 位、不折叠内容。调 `open()` 后 27 个事件全部可见。

结论：**是**，但存在一个 **API 类型面缺口**：`ISession` 导出接口没有 `open()`/历史基线拉取，
需要上游扩类型或插件本地做窄化声明（列为待决策点 D8）。

## P6：details 面板能否渲染 KaTeX 数学、代码块与 SVG 等富媒体？

浏览器端输出（`node /tmp/citeciter-p6-page.mjs`）：

```json
{
  "panelText":"数学公式\n𝐸\n=\n𝑚\n𝑐\n2\nE=mc\n2\n 与代码：\n\njs\n复制\nconsole.log(\"demo\")",
  "svgCount":1,
  "svgMarker":1,
  "katexCount":3,
  "codeBlocks":2,
  "detailsCols":"280px minmax(0px, 1fr) 360px",
  "errors":[]
}
```

结论：**是**。`@deepseek-ai/dsh-client-ui-primitives` 的 `MarkdownText` 渲染 GFM +
KaTeX 数学（raw HTML 被有意丢弃）、fenced code 渲染为带语言标签与复制的代码块；
自定义 SVG 以 React 元素直接渲染。即富媒体能力 = React 组件 + MarkdownText；
“HTML 字符串”不能直接注入（平台设计如此），需用 SVG/组件/沙箱 iframe 替代（设计讨论见 DESIGN.md）。

## P7：进程级 Host 服务重复注册陷阱复核

问题：重复向进程级 `cordisInspect` 注册表注册同一 id 是否抛错？纯消费是否无副作用？

探针：`probes/p7.mjs` + `probes/p7-headless.patch.yml`，临时 DSH_HOME、headless、0 模型调用。

输出：

```
CITEciter_PROBE_P7_RESULT {"before":[],"first":"ok",
 "second":"throw: Host Cordis inspect provider \"citeciter-probe-dup\" is already registered",
 "afterDispose":false}
```

结论：**是**。进程级注册表按 `manifest.id` 去重，重复注册抛错；disposer 可逆。
该陷阱只影响**注册 Host service/Provider** 的插件。CiteCiter 推荐方案不注册任何 Host
service/Provider（host half 为无副作用空壳），因此天然规避。任何未来“加 host half”的
方案都必须显式处理此冲突。

## P8：静态 client 插件能否通过官方 `ctx.connection.api` 创建/读取会话（不切换当前会话）？

浏览器端输出（`node /tmp/citeciter-p8-page.mjs`）：

```json
{
  "createResult":{"ok":true,"value":{"sessionId":"session-1664cdff-…","agentPreset":"standard"}},
  "historyOk":true,
  "historyEvents":3,
  "historyTypes":["permission/preset","sandbox/mode","approval/policy"],
  "errors":[]
}
```

结论：**是**。`ctx.connection.api`（`ConnectionHandle.api: IApiClient`）是官方客户端 wire 面，
直接提供 `sessions.create/history/fork/prompt/selectModel/cancel`、`workspace.archiveSession`
等。这使“新建解释会话 + 读取任意历史页 + 模型选择 + 归档清理”全部可以在纯 client 插件内完成，
不需要 host half，也不需要修改主仓库。
