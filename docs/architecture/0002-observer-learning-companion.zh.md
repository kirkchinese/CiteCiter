# ADR 0002：以 Observer Workspace 组织 CiteCiter 学习对话

- 状态：已实现于 CiteCiter v0.3.0
- 日期：2026-08-20
- 目标：记录 CiteCiter v0.3 的 Observer Topic 架构与实现限制
- 决策所有者：CiteCiter 维护者
- 需求记录：[`../citeciter-product-interview.zh.md`](../citeciter-product-interview.zh.md)
- 相关决策：[`0001-model-input-layering.md`](0001-model-input-layering.md)

## 摘要

CiteCiter 是 DeepSeek Harness 的只读学习伴侣。用户可以在来源 Agent 仍执行长任务时，选择一条已经提交的助手文本，在选区旁输入问题，并立即创建独立的 CiteCiter 对话。用户可以围绕引用继续多轮追问，也可以谈论题外话；CiteCiter 不评价、控制或回写来源 Agent。

默认上下文模式是 Observer。每条 CiteCiter 对话绑定一条来源 DSH Session，并通过专用只读工具按需读取来源的最新消息、模型调用、工具结果和 reasoning。该模式以已提交的 `assistant/message` 为最小 Citation 边界，不等待来源轮次结束。

每条来源 Session 拥有一个 Companion Workspace。每次“选择、输入、提问”创建一个新的数字 Topic；一个 Topic 对应一个符合 DSH 标准的 CiteCiter Session。Topic 标题由独立标题生成流程产生，用户不需要在创建时命名。

## 问题

长程 Agent 可以在一个轮次中执行多次模型调用和工具调用。要求用户等待整个轮次结束后才能提问，会错过监控过程中最需要理解和核实的时刻。

把 CiteCiter 对话作为普通 DSH 子会话暴露在主 Session 列表中，会让学习讨论与主要任务混在一起。用户需要的是附着于来源任务、但拥有独立导航和生命周期的学习空间。

物理 fork 只能选取结束时没有开放轮次的前缀。它不能把开放轮次内已经提交的某次模型输出作为可执行子会话前缀，因此不能承担模型调用级即时问询的默认路径。

直接让模型解析来源 Session 的物理文件会把产品行为绑定到路径编码、压缩格式和持久化后端。v0.3 因此保留“独立 Observer 按需读取来源”的体验，同时通过 DSH SessionQuery 和专用工具隔离磁盘实现。

## 产品目标

- 用户可以在来源轮次仍开放时引用任何具有非空可见文本的已提交 `assistant/message`。
- 选区旁浮层完成首问输入，不要求用户先打开或配置学习空间。
- 每次浮层提交创建独立 Topic，不自动复用相同选区或已有讨论。
- Topic 支持正常多轮问答和题外话，不强制每条回答围绕原始 Citation。
- 首问在回答前读取相关来源证据；后续问题可以按需再次读取，题外话不强制加载来源日志。
- CiteCiter 对话从主 Session 列表和导航中隔离，但复用 DSH Session 日志、回放、模型配置、工具、标题和错误语义。
- 用户通过 CiteCiter 侧栏恢复、重命名、归档或恢复旧 Topic；Host 删除命令要求精确 Session id 确认，v0.3 UI 暂不暴露删除按钮。
- CiteCiter 始终只读，不向来源 Agent 发送 steering，不提供纠偏按钮，也不主动提出对来源工作的评价。

## 非目标

- CiteCiter 不监控来源 Agent 并主动发出提醒。
- CiteCiter 不判断用户是否应该纠正来源 Agent。
- CiteCiter 不修改来源 Session、来源工作区、仓库、配置或外部状态。
- CiteCiter 不重新实现 DSH agent loop、LLM streaming、工具调度、压缩或 Session 日志格式。
- CiteCiter 不要求 DSH 主界面识别或列出 CiteCiter 的独立存储目录。
- CiteCiter 不把“将 CiteCiter Session 重新挂入主列表”作为产品功能；相同 Session 规格只保证技术兼容性。

## 术语

### 来源 Session

用户正在观察的普通 DSH Session。它可以继续运行、压缩、归档或结束。CiteCiter 对其只有读取权限。

### Companion Workspace

一条来源 Session 所拥有的 CiteCiter 导航范围。Workspace 对 Topic 进行分组，不是模型对话，也不是 DSH Session。

### Topic

一次“选择、输入、提问”创建的独立 CiteCiter 对话。Topic 使用来源 Session 内单调增加的数字 id，并拥有一条标准 DSH Session 和一个 AI 生成标题。

### Citation

Topic 创建时捕获的不可变选区证据，包括来源 Session id、来源助手消息 seq、原始 Markdown 中精确的 UTF-16 选区与前后文、浏览器捕获的可见引用和证据指纹。`sourceText` 是 Host 可以对照 `assistant/message` 复验的权威原文；`displayText` 仅用于 UI、临时标题和学习焦点，不充当来源真值。

### `anchorSeq`

被引用 `assistant/message` 的固定 seq。来源后续推进不会改变它。

### `observedThroughSeq`

该 Topic 日志中最近一次成功来源读取所记录的结束 seq。每次读取都形成新的 `tool/result`，不会改写较早结果；如果模型显式回读较早范围，投影值也可以变小，因此它不是全局高水位。

### Observer

默认模式。Topic 不继承来源日志；Tutor 通过专用只读工具获取所需来源证据。

### Exact Fork

高级模式。Topic 从结束时没有开放轮次的来源前缀 fork，并保持冻结。它不能作为开放轮次内模型调用级引用的默认实现。

## 用户流程

### 创建新 Topic

1. 用户在 DSH Web 中选择一条已提交助手消息里的文本。
2. 用户右键点击 `Citer!`。
3. CiteCiter 在选区旁显示小型问题输入浮层。
4. 用户输入问题并提交；不填写标题，不选择或复用旧 Topic。
5. Client 把渲染后的 GFM 选区映射回原始 Markdown 范围并与问题一起交给 Host；Host 验证来源消息、原文 UTF-16 范围、前后文和证据指纹。
6. CiteCiter 在来源 Session 的 Companion Workspace 中分配下一个数字 Topic，创建标准 DSH Session，并复制来源当前的模型调用配置。
7. CiteCiter 安装 Topic 作用域的 Tutor、Citation Context、来源读取工具和只读策略，然后提交真正的用户问题。
8. UI 打开宽的可调分栏并显示新 Topic 的流式回答。
9. DSH 首问标题提供方根据初始对话写入 `session/title`；模型标题失败时由标题服务保留 fallback 标题，不阻止首轮回答。

相同选区和相同问题可以创建多条 Topic。Citation 指纹负责证据校验，不负责讨论去重。

### 继续旧 Topic

1. 用户主动打开 CiteCiter 侧栏。
2. 侧栏显示当前来源 Session 的 Topic，按最近活动排序并展示 AI 生成标题。
3. 用户选择一条 Topic，在可调分栏中恢复其标准 DSH Session。
4. 用户继续普通多轮对话。问题涉及来源时，Tutor 先调用来源读取工具；题外话可以直接回答。

关闭分栏只关闭视图，不归档或删除 Topic。运行中的请求由明确的停止操作控制。

## UI 结构

### 选区浮层

浮层锚定当前选区，包含引用预览、问题输入和发送操作。它不包含 Topic 命名、历史 Topic 选择或模式教学，从而保持“选取、输入、提问”的短路径。

默认提交动作创建 Observer Topic。Exact Fork 作为高级动作放在次级菜单；设置页允许改变新 Topic 的默认偏好。

### Companion 分栏

回答界面使用比当前 details 侧栏更宽的可调右侧分栏。分栏作为 DSH 编程母界面的第三列，保留左侧项目与 Session 导航以及中央编程对话，并展示 Topic 标题、Citation 卡片、来源状态、对话记录、模型配置入口和停止操作。可用宽度不足时，它退化为覆盖式面板；v0.3 不提供独立全屏学习工作区。

### Topic 侧栏

Topic 侧栏是 CiteCiter 自己的导航，不复用 DSH 主 Session 列表。每条来源 Session 的 Topic 独立分组；用户通过标题恢复旧讨论，并可重命名、归档或恢复。

新 Topic 在标题生成完成前使用选区的截断文本作为临时标题。正式标题到达后原位替换临时标题。

## 上下文模式

### Observer：默认模式

Observer Topic 在创建时只持久化 Citation 和真正的用户问题，不复制或 fork 来源历史。来源 Agent 可以继续执行，Topic 的模型历史不随来源自动变化。

Topic 作用域的 Tutor 策略要求首问先调用来源读取工具。后续问题由模型按需调用；明显的题外话不要求读取，也不会被强行拉回 Citation。

Observer 的第一次来源读取默认覆盖从 seq `0` 到当前已提交事件，也可以由模型指定 `fromSeq` 与 `throughSeq`。后续调用同样使用显式 seq 范围；`observedThroughSeq` 只供 UI 展示，v0.3 不把它自动注入下一次工具参数。

每次工具结果携带 `sourceSessionId`、请求范围、`capturedThroughSeq`、截断信息和结构化事件。该结果作为普通 DSH `tool/result` 写入 Topic Session，因此每次实际进入模型的来源证据都可以回放。

### Exact Fork：高级模式

Exact Fork 只接受 Citation 所在来源轮次已经出现 `turn/end` 的稳定边界。v0.3 不把 Topic 注册为主运行时的子 Session，而是在私有 DSH runtime 中以截至该 `turn/end` 的来源事件作为标准 Session seed，并使用与 Observer 相同的 Citation Context、Tutor 和只读策略。

Exact Fork 默认不读取来源的后续变化。用户需要实时状态时，应显式创建新的 Observer Topic；实现不得悄悄把冻结 Topic 变成实时观察。

设置页提供 `observer` 和 `exact-when-available` 默认偏好，初始值为 `observer`。`exact-when-available` 的名称和说明明确约定开放轮次自动使用 Observer；用户在选区浮层强制选择 `exact-fork` 时，开放轮次会报错而不会降级。

## 来源读取工具

### 职责

Topic 作用域提供一个专用只读工具 `read_source_session`。工具由 Host 使用 DSH Session 与查询服务实现，不向模型暴露物理文件路径、JSONL 编码或压缩格式。

工具支持从 seq `0` 开始读取，也支持显式 `fromSeq` 与 `throughSeq` 范围。返回值包含形成用户问题所需的以下事件信息：

- 真人 `user/message`；
- 已提交 `assistant/message` 的可见正文；
- 与模型调用对应的 `tool/call` 名称和原始参数；
- 配对的 `tool/result` 内容、错误和结果元数据；
- 来源 `assistant/message` 中已记录的 reasoning，受 Topic 设置控制；
- 识别模型调用范围所需的 `step/start`、`step/end`、`turn/start` 和 `turn/end` 位置。

工具默认不返回原始 `assistant/chunk`。组装后的 `assistant/message` 是模型调用证据；只有专门的回放诊断需求才需要增加分片读取。

### reasoning 设置

`includeSourceReasoning` 默认开启，并可在 CiteCiter 设置中关闭。该设置控制 Tutor 是否能通过来源读取工具取得来源 reasoning，不控制 UI 是否直接展示 reasoning，也不改变 Tutor 自身的 reasoning effort。

### 来源工作区

CiteCiter Session 的工作目录继承来源 Session 的 `cwd`。Tutor 使用 DSH 标准只读文件工具访问来源工作区；专用工具只负责 Session 日志，不复制文件读取能力。

### 安全处理

来源消息、reasoning、工具参数、工具结果、文件内容和 Citation 都是不可信证据。它们只能进入 user-role 上下文或工具结果，不能进入 Tutor system 权限。

来源读取工具必须验证绑定的 `sourceSessionId`，拒绝模型任意选择其他 Session。读取范围和字节预算在 Host 边界校验；截断必须显式报告。

## 模型输入分层

Observer Topic 使用以下输入层：

```text
1. system：Topic 作用域的 CiteCiter Tutor 和只读策略
2. history：该 CiteCiter Topic 自己的标准 DSH 对话历史
3. user context：持久 Citation Context，标记为不可信引用数据
4. tool result：按需读取并记录的来源 Session 或工作区证据
5. user：用户真正输入的首问和后续问题
```

该结构保留 ADR 0001 对权限和来源的分离，但 Observer 不再把 fork 历史作为默认历史层。来源历史通过可审计的工具结果按需进入 Topic。

Tutor 直接回答用户问题，不主动审查来源 Agent，不主动提出纠偏建议，也不把每个题外话强行拉回 Citation。用户明确询问来源是否正确时，Tutor 可以基于读取证据作答；如何处置答案由用户决定。

## 模型配置

创建 Topic 时，CiteCiter 复制来源 Session 当前有效的 provider、model、reasoning effort 和采样配置。复制是创建时快照，来源后续切换模型不会改变已有 Topic。

CiteCiter 用专属 Tutor、Citation Context 和只读工具集合替换来源 Agent 的任务行为，不继承来源 Agent 的写入能力。

Topic 创建后通过 CiteCiter 分栏中的 DSH 模型目录独立切换模型和 reasoning effort。选择先原子写入 `topic.json`，随后由标准 Agent model-selection 在下一次请求中生效并进入 DSH 请求日志。

## 存储与发现

### v0.3 物理目录

v0.3 把导航索引和标准 Session 日志分为两个私有根目录：

```text
$DSH_HOME/citeciter/
├── workspaces/
│   └── <base64url(sourceSessionId)>/
│       ├── 1/topic.json
│       ├── 2/topic.json
│       └── ...
└── sessions/
    └── <DSH project key 或 _no-cwd>/
        └── <DSH 编码后的 citeciterSessionId>/
            └── session.jsonl
```

`workspaces` 体现产品关系：来源 Session id 经 UTF-8 base64url 编码为一个安全目录，每个数字 Topic id 在该来源内单调增加且不复用。`sessions` 直接使用 DSH JSONL persistence 的项目键与 Session id 编码；Topic 继承来源 `cwd`，没有 `cwd` 时进入 `_no-cwd`。

两个目录通过 `topic.json` 中的 `sourceSessionId`、`topicId` 和 `sessionId` 关联，而不是把 Session 日志复制进 Topic 索引目录。这样既保持用户要求的“来源下按数字 Topic 组织”的逻辑结构，也复用 DSH 已有的持久化定位规则。v0.3 明确配置 `compression: none` 与 `packChunks: false`，所以物理文件是未压缩 `session.jsonl`，不是 `session.jsonl.zstd`。

### `topic.json`

`topic.json` 是 CiteCiter 导航索引，不是聊天记录。当前 schema 保存：

- metadata schema version；
- 数字 Topic id；
- 来源 Session id；
- 来源工作目录；
- CiteCiter Session id；
- `observer` 或 `exact-fork` 模式；
- Citation 身份和 `anchorSeq`；
- 创建时模型配置与 Exact Fork 的冻结 seq；
- 临时标题、标准标题的缓存投影及标题来源；
- 创建、最近活动和归档时间；
- 来源可用状态的缓存提示。

真正的消息、模型输出、工具调用、工具结果、错误和取消存在于标准 DSH Session 日志。Topic 标题以 Topic Session 中的标准 `session/title` 事件为权威，`topic.json` 的标题字段用于无需加载完整日志的目录展示，并可从日志重建；模型选择先保存在导航元数据中，再由后续标准请求事件记录实际调用。

### 标题生成

首轮对话进入日志后，CiteCiter 复用 DSH 的 FirstPromptTitle 与 SessionTitle 服务，由标题请求生成短标题并写入标准 `session/title` 事件。标题产生前使用选区截断文本作为临时标题；标题请求失败时使用 DSH fallback 标题，不阻止 Topic 创建或回答。

### 与主 Session 列表隔离

CiteCiter 使用独立目录、目录索引和 Client 导航发现 Topic。普通 DSH Session 列表不扫描该目录，因此学习对话不会干扰主要任务列表。

CiteCiter Session 本身使用 DSH Session header、事件和 JSONL 格式。该兼容性不要求 DSH 官方支持发现 CiteCiter 私有根目录，也不要求 CiteCiter 提供“显示在主列表”功能。

### 运行时组合

CiteCiter 创建一个进程内私有 Cordis Context，安装 DSH SessionStore、AgentRegistry、SystemPrompt、ToolRuntime、可选 ToolFs、JSONL persistence、SessionTitle、FirstPromptTitle 和默认 AgentLoop。它桥接主组合提供的 LLM 与可选 FS 服务，并通过 Host/Client Remote 和 UI slot 连接 DSH Web；不修改 DSH core，也不自定义 loop。

来源读取工具从主组合的 SessionQuery 读取绑定来源。私有 runtime 只拥有 CiteCiter Topic，不通过磁盘轮询模拟主运行时事件，也不把 Topic 注册进主 SessionStore。

## 身份与持久状态

Topic 身份由 `sourceSessionId + topicId + citeciterSessionId` 确定。Citation 指纹验证浏览器提交的选区证据，但不用于查找或复用 Topic。

Citation 在 Topic 创建后不可变。`observedThroughSeq` 从 Topic 日志中最后一次成功的来源读取工具结果派生，不写入 `topic.json`。

Topic 元数据用 `archivedAt` 表示归档状态；归档只影响默认列表并保留日志。Host 删除命令要求请求中的确认 id 与目标 Session id 完全一致，然后删除该 Topic 的索引和私有 Session artifact，不触碰来源 Session；v0.3 UI 只提供归档与恢复。

## 来源生命周期

来源 Session 归档不影响 Observer 读取，因为归档是导航状态而不是日志删除。

来源 Session 无法读取、移动到未知后端、删除或损坏时，Topic 保留既有 Citation、用户问题、回答和已经记录的来源工具结果。UI 显示“来源不可用”，Tutor 不得声称已观察到最新状态。

来源恢复后，下一次快照读取会清除来源不可用提示，下一次成功工具读取会记录新的 `observedThroughSeq`。来源 id 不匹配时不得按路径猜测替代 Session。

## 只读与隔离

每条 Topic 在接受首问前把标准 DSH sandbox mode 设为 `read-only`。工具执行 guard 只允许绑定的 `read_source_session`，以及设置开启且 Host 提供 FS 时的标准 `read`；system-prompt 组装再次过滤模型可见工具列表。

来源读取工具只读取绑定 Session；标准文件工具只读取来源 `cwd`。CiteCiter 不提供写文件、执行具有副作用的命令、修改 Session、发送 steering、插件管理或外部写操作。

用户切换模型和 reasoning effort 不改变只读策略。私有 runtime 启动、Topic 创建和恢复错误会向 Host/Client 传播，不会静默退化为可写 Agent。

关闭 UI、切换 Topic、页面刷新、Host 重启和插件卸载不得让延迟异步结果安装到已经销毁的 Client 或 Agent 作用域。

## 对 ADR 0001 的调整

ADR 0001 的权限分层、Citation 不可信性、真正用户问题、只读隔离和父 Session 零写入继续有效。

以下 v0.2 决定已被 v0.3 实现替换：

- 精确历史 fork 不再是每条 CiteCiter 对话的默认历史来源；
- Thread 身份不再由 Citation 指纹决定，Topic id 和 CiteCiter Session id 决定讨论身份；
- 相同 Citation 可以创建多条独立 Topic；
- Topic 从普通 DSH 子会话导航迁移到来源 Session 下的独立 Companion Workspace；
- 默认上下文通过按需来源读取工具获得，Exact Fork 保留为冻结的高级模式。

ADR 0001 继续记录 v0.2 的模型输入实验与旧架构；当前实现以本 ADR 为准。

## 验收场景

### 开放轮次内创建

来源 Agent 已提交一个 `assistant/message` 并继续执行工具。用户选择其中一段文本并提交问题，CiteCiter 立即创建 Observer Topic；来源 Agent 不停止，来源日志不被修改。

### 最新来源问答

用户在 Topic 中询问来源 Agent 当前做到哪里。Tutor 先调用来源读取工具，工具读取模型所请求的 seq 范围并记录 `capturedThroughSeq`，回答只声称该位置以前的事实。

### 题外话

用户提出与来源无关的问题。Tutor 可以不调用来源读取工具，继续同一 Topic 的普通多轮对话。

### 重复选区

用户对同一段文字两次执行 `Citer!` 并提交不同问题。系统创建两个数字 Topic，两条标准 DSH Session 都保留各自问题和 AI 标题。

### 来源 reasoning 设置

默认 Topic 的来源读取结果包含已记录 reasoning。用户关闭 `includeSourceReasoning` 后，后续读取不返回 reasoning，既有工具结果不被改写。

### Topic 恢复

用户关闭分栏、刷新页面或重启 Host，随后从 CiteCiter 侧栏按 AI 标题打开旧 Topic。完整多轮历史、Citation、模型配置和最后观察位置从标准 Session 日志恢复。

### 来源失效

来源日志被删除后，旧 Topic 仍可打开并基于既有历史聊天；UI 标记来源不可用，来源读取工具稳定失败，Tutor 不宣称已读取最新状态。

### Exact Fork

用户对已关闭来源轮次选择高级 Exact Fork。子 Session 继承稳定前缀并保持冻结；开放轮次中的同一操作被明确拒绝，并向用户提供 Observer 选择。

### 主列表隔离

创建、恢复、归档和删除 Topic 不在普通 DSH Session 列表中增加或改变用户可见条目。CiteCiter 的索引和日志全部位于 `$DSH_HOME/citeciter/`，来源 Session artifact 不因 CiteCiter 对话而变化。

## 当前验证范围

仓库单元测试覆盖开放轮次中的 `assistant/message` 锚点、跨 GFM 标记与代码/链接的可见选区源映射、UTF-16 原文与指纹校验、来源绑定、显式 seq 范围、字节截断、reasoning 开关、Citation 输入分层、严格 Remote schema 和发布清单。标准 runtime 的首问、工具调用、标题和第二轮续聊还必须由一次性组装应用 smoke 验证；UI 创建、重载恢复、第二 Topic、归档、主列表隔离和宽度则由浏览器 smoke 与视觉检查验证。

完整发布门禁与当前可复现命令见 [`../implementation-milestones.md`](../implementation-milestones.md)。文档不会把尚未运行的安装、升级或浏览器门禁写成已通过。

## v0.3 实施边界

v0.3 已交付 Observer 模型调用边界、独立 Topic 索引与标准 Session 存储、专用来源读取工具、浮层首问、宽分栏、多轮恢复、模型与设置控件以及只读隔离。它保留 DSH 编程母界面，不再把 CiteCiter 暴露为普通子会话。

本版本没有独立全屏工作区、Topic 搜索、批量标签、跨来源 Workspace、自动知识整理、主动提醒、来源纠偏、UI 删除按钮、Topic 日志压缩或完整国际化。只有真实使用证明现有 Topic 侧栏与私有 JSONL 存储不足时，才增加相应能力。
