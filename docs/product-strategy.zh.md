# CiteCiter 产品边界与增长壁垒决策

> 状态：产品方向决策稿，依据 2026-08-23 的本仓库源码、DSH `master` 公共文档及下列竞品一手资料。本文不采用“插件总数”等目录聚合数字作为市场事实：社区目录对 GitHub topic 命中、静态 manifest、可安装与真实运行的口径并不一致；DSH 官方贡献指南只把 `dsh-plugin` topic 定义为发现入口，而非兼容或质量认证。

## 决策摘要

CiteCiter 不再以“更完整的学习侧聊”为产品终局。它应成为 **DSH 输出的 source-bound、verifiable、read-only 旁路调查层**：用户看到一句可疑、重要或不理解的 Agent 输出时，可以在不改变主 Session 和工作区的前提下，解释它、核验它、追溯它所依赖的可观察证据。

首要楔子是 **Verify 单条声明**，不是泛化聊天。Explain 保留为低门槛入口；Trace 只重建可观察的用户要求、Session 事件、工具调用、结果和文件证据，不声称展示或还原模型的完整内部思维。Evidence Map 在单条 Verify 被证明有用后，把一段回答拆成可核查声明，并把每条声明映射到支持、部分支持、反证或缺失证据。

长期壁垒不是右侧面板，而是四项可以累积的资产：稳定且可复验的来源标识、结构化证据与结论状态、可机械验证的只读不变量，以及供其他插件打开调查的最小生态服务。公共 API 必须晚于第二种来源适配器和真实外部消费者，避免先冻结一个只适合 assistant 文本的抽象。

## 当前事实基线

### 已经成立的能力

- 浏览器只接受带稳定 DSH assistant anchor 的有效选区，并把 DSH DOM 与 Read Frog 的 best-effort 标记集中在独立适配层；无效区域的右键保持透传（[`conversation-dom.ts`](../packages/citeciter/src/client/conversation-dom.ts)、[`selection.ts`](../packages/citeciter/src/client/selection.ts)）。
- Host 不信任浏览器给出的文字和坐标，而是重新读取来源 Session、定位已提交的 `assistant/message` 并复验上下文和指纹（[`observer.ts`](../packages/citeciter/src/observer.ts)）。
- 每个 Topic 是独立、可恢复的 DSH Session；它可以有界读取一个固定来源 Session，并在允许时通过 `read`、`glob`、`grep` 调查来源工作区（[`topic-runtime.ts`](../packages/citeciter/src/topic-runtime.ts)）。
- Topic 强制使用 read-only sandbox 和工具白名单；提示词也明确要求区分 Session 证据、一般知识和推测，不得修改来源 Session、工作区或外部状态（[`topic-runtime.ts`](../packages/citeciter/src/topic-runtime.ts)）。
- 当前持久引用模型只覆盖 assistant 文本：`sourceSessionId + anchorSeq + offsets + fingerprint`。Topic、设置和 Typert 请求均是 CiteCiter 私有实现，不是供生态调用的稳定调查协议（[`topic.ts`](../packages/citeciter/src/topic.ts)、[`index.ts`](../packages/citeciter/src/index.ts)）。

### 尚未成立的能力

- UI 没有结构化区分“有证据、部分支持、存在反证、未核实、一般知识”；目前主要依赖模型遵循提示词。
- 没有 Claim Ledger、Evidence Map、可点击证据引用、脱敏导出或调查 API。
- 精确选区入口仍依赖 renderer DOM。DSH rc.2 已公开 `conversation.chat.assistant-actions`，但 owner 只提供 finalized assistant 的 `messageId`，足以增加整条消息的可见入口，不能表达选区范围；CiteCiter 当前尚未使用它。上游也允许插件注册自己的 Conversation Node，并允许工具所有者注册 keyed Tool view，但没有让第三方为任意已有 Tool 行附加通用动作的公共 seat（[DSH `ui-conversation` slots](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/packages/client/ui-conversation/src/client/contract/slots.ts)、[DSH `ui-tool`](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/packages/client/ui-tool/README.md)）。
- DSH `ctx.sessionQuery` 已提供精确事件读取、surface 分类和关系 trace，但它是可信的 context-wide 基础设施，不替调用方做权限控制；CiteCiter 仍必须把每次读取约束在已验证的来源上（[DSH Session Query](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/packages/session-query/session-query/README.md)）。
- DSH `ui-layout` 的 AppFrame、concession solver 和 details 几何仍由宿主内部拥有，没有第三方增量右侧 dock contribution point；这影响体验稳定性，但不是证据产品本身的壁垒（[DSH `ui-layout`](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/packages/client/ui-layout/README.md)、[分屏扩展提案 #2418](https://github.com/deepseek-ai/deepseek-harness/discussions/2418)）。

## 目标用户与真实任务

| 优先级 | 用户 | 高频痛点 | CiteCiter 应完成的任务 |
|---|---|---|---|
| 1 | 审阅长任务结果的开发者、维护者 | Agent 声称“测试都通过”“没有回归”“这是官方做法”，但人工要翻日志、文件和网页确认 | 选中声明后给出证据状态、精确事件/文件来源与缺口 |
| 2 | 排障中的开发者 | 终端报错、工具结果或 diff 很长，主 Agent 的归因可能过早 | 只读重查相关输出和项目文件，区分根因证据与推测 |
| 3 | 阅读陌生代码或新技术的学习者 | 解释需求高频，但普通聊天缺少精确来源，长追问又污染主任务 | Explain 绑定原文并保留独立 Topic；必要时升级到 Verify/Trace |
| 4 | PR、Issue 与团队协作者 | 需要分享“为什么相信或不相信这条结论”，而不是分享整段私密 Session | 预览并导出经过脱敏的调查证据包 |

当前不把“所有 DSH 用户”作为目标。交互式 Web/Desktop、长任务、代码审阅和排障用户最可能形成复用；纯 TUI、headless 和自动化用户只有在稳定调查 API 出现后才自然进入覆盖范围。

## 竞争差异与可占据位置

| 产品 | 已核验的强项 | 与 CiteCiter 的分界 |
|---|---|---|
| [`dsh-side-chat`](https://github.com/heartmove/dsh-side-chat) | 继承工具、模型、思考强度和权限；可以把结果带回主会话，并支持问题弹框旁路讨论 | 是通用、可执行、可回传的第二 Agent；不以来源范围复验和强制只读为核心 |
| [`dsh-sidechain`](https://github.com/Buyi-wsgzg/dsh-sidechain) | `/side` 持续侧会话与 `/btw` 一次性侧问；临时 fork，不写入主会话历史 | 已证明“不中断主会话”的需求；来源粒度仍是会话/fork，不是声明到证据的 ledger |
| [`dsh-explain`](https://github.com/yuezengwu/dsh-explain) | 本地优先的跨会话学习线程、讲解入口和学习状态 | 更适合长期学习体验；CiteCiter 不与其争夺记忆、掌握反馈和通用讲解面 |
| [Sourcegraph Cody](https://sourcegraph.com/docs/cody/capabilities/chat) | 可显式选择文件、符号、仓库和 URL 上下文，并告知回答读取了哪些代码文件 | 强项是代码检索与编辑协作，不是对一条 Agent 输出做不可变、只读的证据审计 |
| [GitHub Copilot agent sessions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/manage-and-track-agents) | 可查看工具与活动日志，commit 可链接回 agent session；PR 中还能询问“改了什么、验证了什么、为什么” | 证明可追溯日志具有审阅价值；尚不是 DSH 内对任意声明做细粒度 Evidence Map 的插件面 |
| [NotebookLM](https://support.google.com/notebooklm/answer/16164461?hl=en) | 对上传来源给出内联引用，用户可以回到原文核验 | 证明“回答旁边直接看到来源”是可理解的信任交互；不覆盖 coding-agent 事件、工具和可变工作区 |

因此不应与侧聊插件比较“功能更多”，而应稳定占据四个词：**source-bound、verifiable、read-only、evidence-backed**。最有价值的差异不是模型回答得更聪明，而是用户能看见“这条结论由什么支持、支持到什么程度、什么仍未知”。

## 不可破坏的产品契约

1. **来源可定位、可复验。** 每个调查必须绑定 Host 可重新读取的来源标识；文本范围需要内容指纹，文件范围需要内容哈希或版本标识，缺失来源必须显示为不可用，不能静默换成相似内容。
2. **默认且实际只读。** Topic 不获得写文件、执行任意命令、修改 Session、提交答案或调用有外部副作用能力的权限。只读不仅是文案，也必须由 sandbox、工具可见性、Host guard 和回归测试共同证明。
3. **不改变主流程。** 不自动向主 Session 注入结论、不替用户回答问题弹框、不自动修改工作区。用户可显式复制或导出，但 CiteCiter 不主动“带回”。
4. **证据状态诚实。** Verify 的结论只有 `支持`、`部分支持`、`存在反证`、`未核实` 四种；一般知识和推测是证据来源类别，不得伪装成项目事实。没有可定位证据时必须输出“未核实”。
5. **Trace 只展示可观察路径。** 它可以连接用户要求、Session 事件、工具调用/结果、文件范围、子 Session 关系和最终声明；不得声称还原完整 chain-of-thought，也不应默认导出隐藏 reasoning。
6. **可分享不等于默认外泄。** 导出必须由用户显式触发、先预览、默认脱敏凭据与绝对路径，并记录 DSH/CiteCiter 版本和来源可用状态。

## Explain、Verify、Trace 与 Evidence Map

### Explain

回答“这句话是什么意思、相关概念如何工作”。它可以使用一般知识，但必须把项目事实与一般知识分开。Explain 是当前能力的产品化命名和低门槛入口，差异化较弱，不单独形成新数据系统。

### Verify

回答“这句话有证据吗”。第一版只处理用户选中的一条声明，返回结论状态、简短理由、支持证据、反证和未覆盖部分。诸如“所有测试均通过”必须落到实际命令、退出码、测试范围和跳过项；证据不存在时只允许“未核实”，不能根据措辞推断成功。

### Trace

回答“这条可观察结论是如何形成的”。第一版从被选中的 assistant 事件向前查找相关用户要求、工具调用/结果、文件读取和 Session 关系，形成可点击时间线。它不展示隐含心理过程，也不把模型生成的解释当作历史事实。

### Evidence Map / Claim Ledger

在单条 Verify 的可用性成立后，允许用户选择一段已完成回答并拆成独立、可核查的声明。每条声明连接零个或多个证据节点，保留结论状态与 CiteCiter 自己的不确定性。它是“证据覆盖图”，不是“真假评分器”：一个结论可以有强支持但仍超出证据范围，两个证据也可以互相矛盾。

## 候选能力排序

排序综合用户痛点、差异化、工程成本和公共 DSH 扩展点依赖；高成本或依赖上游不等于不做，而是不得挤占已经能独立验证价值的步骤。

| 顺序 | 能力 | 痛点 | 差异化 | 工程成本 | 公共 DSH 依赖 | 决策 |
|---|---|---|---|---|---|---|
| 1 | 当前 assistant 选区上的 Verify | 高 | 高 | 中 | 无新增依赖 | 第一项新能力 |
| 2 | 可见入口与 Explain/Verify/Trace 意图选择 | 高（发现性） | 中 | 低 | rc.2 已有 `conversation.chat.assistant-actions`；精确范围继续走选区菜单 | 与 Verify 同期 |
| 3 | 当前 assistant 选区上的 Trace | 高 | 高 | 中 | `sessionQuery` 已有读取/trace，授权仍由 CiteCiter 约束 | Verify 后紧接 |
| 4 | 单段回答的 Evidence Map | 高 | 很高 | 高 | 当前来源即可启动 | 单条 Verify 达标后 |
| 5 | 脱敏 Markdown 导出 | 中 | 高 | 中 | 无 | Evidence Map 同期；先人读格式 |
| 6 | 版本化 JSON 证据包 | 中 | 很高 | 中 | 无 | Markdown 字段稳定后 |
| 7 | tool-result / terminal-output 来源适配器 | 高 | 高 | 中 | 需要通用 `tool.call.actions` 或已有 Tool 行的 action contribution；现有 keyed view 只由工具所有者注册 | 最优先争取上游贡献点 |
| 8 | diff-hunk / file-range 来源适配器 | 高 | 高 | 高 | 需要稳定 location、行范围动作和内容版本/哈希语义 | tool adapter 之后 |
| 9 | subagent-result 来源适配器 | 中 | 高 | 高 | 需要稳定 Session 关系入口、事件导航和非当前 Session UI 绑定 | 有审阅样本再做 |
| 10 | plan / Todo / Goal 来源适配器 | 中 | 中 | 中 | 需要现有 first-party 行的通用动作 seat | 不先做专用 DOM 解析 |
| 11 | question / approval 来源适配器 | 中 | 低至中 | 高 | pending interaction 的稳定来源与动作贡献点 | 侧聊竞品已强，不优先 |
| 12 | 生态 `openInvestigation` 服务 | 中 | 很高 | 高 | Host/Client 两侧生命周期、授权、能力协商 | 至少两种适配器和两个外部消费者后 |
| 13 | 图片局部区域 | 低至中 | 高 | 很高 | 需要附件身份、区域坐标、OCR/视觉证据版本 | 暂不进入路线 |

## 分阶段路线

### 阶段 0：把当前入口变成可验证的产品基线

保持 0.4.1 的 Topic 和 Citation 格式，不加入新来源协议。完成发布门禁后，用现有 assistant 选区观察安装、发现、首次提问、恢复 Topic 和只读失败路径。界面只需把用户动作讲成“选中 → Explain / Verify / Trace”，不要先增加更多面板、设置或 Agent persona。

退出条件：至少 10 名目标用户完成有主持的首次使用，其中 8 人能在 3 分钟内独立开始一次调查；所有有效来源引用在刷新后仍可复验；自动化中来源 Session、工作区和主 Session 写入数始终为零。这里的数量是下一阶段门槛，不是当前市场数据。

### 阶段 1：单条声明的 Explain / Verify / Trace

沿用 assistant 来源，先把意图和输出格式做清楚。Verify 产出结构化结论状态和证据列表；Trace 产出可观察事件时间线；Explain 继续使用自然回答，但标记项目证据与一般知识。先不自动拆整段回答，也不公开 API。

退出条件：准备至少 30 条人工标注用例，覆盖测试结论、代码行为、官方做法、未运行命令和相互矛盾证据；100% 的 `支持/部分支持/存在反证` 结论至少有一个可解析证据定位；无证据用例 100% 标为 `未核实`；“支持”误判率低于 5%；10 名目标用户中至少 7 人能根据任务正确选择 Verify 或 Trace。

### 阶段 2：Evidence Map 与证据包

将一段回答拆为 Claim Ledger，每条声明保留状态、证据和缺口。先提供可预览的脱敏 Markdown，再在字段稳定后提供版本化 JSON。导出的是一次调查记录，不是 Topic 全量备份，也不是知识库同步。

退出条件：在至少 50 条声明上，人工评审与产品状态分类一致率不低于 85%，且“支持”误判仍低于 5%；可用来源中的证据链接解析成功率不低于 95%；包含合成密钥、环境变量、用户目录和远程 URL token 的脱敏语料中出现零次秘密原文泄漏；用户能从导出包回到对应来源或明确看到来源已不可用。

### 阶段 3：扩展来源，而不是扩展聊天能力

复用已有 `conversation.chat.assistant-actions` 作为整条消息入口，并与上游协作获得任意 Tool 行的公共 action contribution，然后加入 tool-result / terminal-output；稳定后再加入 diff-hunk / file-range。到第二种来源适配器真正交付时，再提炼内部 `SourceRef` discriminated union 和 adapter registry，并一次性迁移所有引用，不为尚未实现的图片、审批或 Goal 预留空字段。

退出条件：每种来源都能由 Host 重新解析和复验，刷新与 Session 恢复后保持同一身份；来源内容变化时显示 stale 或 unavailable 而不是错误绑定；每个适配器至少有 20 个真实样本和一条 assembled Web/Desktop 浏览器回归；实现不读取其他插件的私有 store，也不新增 renderer DOM 选择器。

### 阶段 4：生态调查服务

只有在至少两种来源适配器稳定、并出现两个独立插件作者的真实集成需求后，才发布最小的 `openInvestigation` 能力。调用方只提交版本化 SourceRef、意图和可选首问；CiteCiter 自己负责 Host 复验、只读策略、Topic 生命周期和 UI 打开。外部插件不能注入“已验证”状态，也不能扩大 CiteCiter 的来源读取权限。

退出条件：两个独立插件只使用公开包入口即可完成集成，不依赖 DOM、私有 store 或 DSH 内部组件；插件卸载/重载无重复贡献；调用方越权 SourceRef 被 Host 拒绝；协议兼容测试覆盖当前支持的两个 DSH 版本。TUI/headless adapter 只有在这个服务稳定且有明确需求后再立项。

## 应向 DSH 上游争取的公共贡献点

1. **为 Tool 行提供与现有 assistant action 对称的增量动作 seat。** 复用 `conversation.chat.assistant-actions`，并让 Tool owner props 提供稳定 call identity、可选事件/location 和普通回调；第三方只能增加动作，不能替换整行。若上游未来扩展 assistant owner，优先增加 durable seq/location，而不是暴露 renderer DOM。
2. **宿主拥有的增量右侧 dock/concession API。** 插件声明期望宽度和最小 center 宽度，宿主决定 details、窄屏 overlay、拖动与偏好恢复。现有 AppFrame 私有兼容适配器只应是版本锁定的过渡方案。
3. **精确事件导航。** 提供 `sessionId + seq` 的安全打开/定位能力，并明确来源缺失、未加载分页和非当前 Session 的行为，让 Evidence Map 可以回到证据而不操作 DOM anchor。

不需要上游替 CiteCiter 定义 Evidence Map、Claim 状态或通用 SourceRef；这些属于尚待产品验证的业务语义。`ctx.sessionQuery` 已经提供足够的精确读取与关系 trace，当前缺口是调用授权和 UI 动作/导航，不应再请求一个重复的查询服务。DSH 官方架构也要求新行为走文档化扩展点、注册可逆，并把持久事实放入 Session 日志（[DSH 架构](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/docs/architecture.md)）。

## 增长机制与验证指标

增长不应依赖“功能很多”，而应让一次成功核验自然展示价值。

- **激活指标：** 安装后看到入口的比例、首次有效引用成功率、从选择到第一条结论的耗时、右键后取消率。首先解决“用户不知道可以划选调查”，再优化高级模式。
- **价值指标：** 每周完成的 Verify 数、同一 Topic 的续问率、从 Explain 升级到 Verify/Trace 的比例、用户主动查看证据定位的比例。
- **信任指标：** 可解析证据覆盖率、“支持”误判率、stale/unavailable 被正确识别的比例、只读不变量失败数、脱敏泄漏数。
- **留存指标：** 目标用户在四周内至少两周再次使用的比例；按审阅、排障、学习分群，不把只安装未使用计入成功。
- **生态指标：** Evidence Map/Markdown 被复制到 Issue 或 PR 的次数、外部插件集成请求数、无需私有 API 完成的独立集成数。

最有效的传播资产应是可复现案例，而不是更多宣传词：例如把“所有测试通过”“这个 API 向后兼容”“这是官方推荐写法”各做一份带原始 Session、证据状态和缺口的短案例。脱敏证据包若能直接进入 Issue/PR，会形成“看到证据包 → 安装 CiteCiter → 自己核验”的产品循环。

## 明确不做

- 不做另一个完整 side chat，不追逐权限继承、任意工具、模型军备竞赛和多窗格聊天。
- 不自动修改代码、配置、Session、Issue、PR 或外部系统；不提供“只读模式关闭”开关。
- 不自动把调查结论注入主会话，不替用户回答审批或问题弹框。
- 不宣称输出绝对真相，不生成单一“可信度分数”，不把证据数量等同于结论正确。
- 不展示或声称还原完整 chain-of-thought；Trace 只连接持久、可观察事实。
- 不做通用长期记忆、学习卡片、笔记库、项目管理、看板或多 Agent 编排。
- 不在结构化证据模型成熟前增加任意网页抓取；若以后读取外部网页，必须保存 URL、抓取时间、内容指纹和失败状态，并单独处理敏感请求与内容变化。
- 不为假想适配器预先发布庞大 SourceRef schema，也不在没有两个外部消费者时承诺生态 API。
- 不优先做图片区域、移动端独立客户端或 TUI 复刻；有稳定来源身份和明确需求后再评估。
- 不以社区目录中的插件数量、star 或下载量替代用户访谈、可复验案例和留存证据。DSH 官方当前鼓励通过 Discussions 与 `dsh-plugin` topic 贡献生态，但并未把第三方目录视为认证体系（[DSH CONTRIBUTING](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/CONTRIBUTING.md)）。

## 最终产品判断

值得押注的不是“用户能在旁边继续聊”，而是“用户第一次有一个不会动现场、能指出证据在哪里、也敢明确说证据不够的调查面”。短期用 assistant 选区上的 Verify 证明需求；中期用 Evidence Map 和证据包形成复用与传播；长期通过公共 DSH 贡献点把同一调查能力开放给工具结果、终端、diff 和其他插件。任何新功能若不能增强来源身份、证据质量、只读保证或可组合性，就不属于 CiteCiter 的主路线。
