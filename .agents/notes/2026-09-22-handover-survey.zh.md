# CiteCiter 接手前调查报告

调查日期 2026-09-22，对象为工作树 HEAD `e6d03f9`（0.8.2，2026-09-14）。本记录只做只读调查，未修改任何源文件；唯一的写入是本记录本身。记录中区分三类证据：「实测」为本机实际执行或读取的结果，「代码」为源文件行号可查的实现，「文档」为仓库既有记录的陈述。

## 一、接手结论摘要

CiteCiter 是一个已经发布到 0.8.2、功能面远超其文档描述的成熟插件。它的核心不是聊天侧栏，而是「用宿主原生会话承载的、来源绑定的、默认只读的独立学习/调查工作区」。代码质量与工程纪律明显高于同类第三方插件：严格 TypeScript、宿主生命周期正确释放、迁移与删除有完整的核验和回滚、发布包与安装包逐字节比对。

但接手时有三件事必须先知道。第一，**仓库已没有任何自动化测试**：33 个测试文件在 0.8.0 开发期间（提交 `bf34088`，2026-09-13）被整体删除，CI 只剩锁文件、类型、构建和打包；任何改动现在只有「真实模型 + 真实 UI」这一条手工验收路径。第二，**包声明的宿主版本已经落后于实际安装的宿主**：包把 peerDependencies 钉在 DSH `0.1.5-rc.1`，而本机 `dsh` CLI 内部实际解析出 230 个 `0.1.5-rc.3` 子包。第三，**产品文档与已交付功能严重脱节**：`docs/product-strategy.zh.md` 的「明确不做」清单里仍写着「不做学习卡片」，而 0.7/0.8 已经交付了学习卡片和板书。

另有一个与插件无关但在飞的工作流：一条约两分钟的 CiteCiter 宣传片，全部产物在 Git 忽略的 `.refs/video-production/` 下，等待 B 站投稿，当前被一个未解决的 Edge 浏览器控制故障阻塞。

## 二、项目是什么

产品定位（`README.md:7`）：CiteCiter 为 DeepSeek Harness 提供带来源引用的独立工作区；可从主对话、工具结果和文档建立 Topic，处理文字、编程、图像和学习任务；新 Topic 使用 DSH 原生会话、权限、模型、附件与消息队列，来源对话继续独立工作。

实际使用回路：在已提交的助手回复、工具结果或文档中选文 → 右键八槽轮盘或原生入口 → 打开独立草稿，来源地址与选文作为**可移除的附件** → 用户**手动发送**后模型才开始回答 → Topic 是一个真正的 DSH Session，默认只读，可带小黑板、学习路线和学习卡。

仓库里有两份互相冲突的产品主张，后来的覆盖了先前的。旧主张见 `docs/product-strategy.zh.md:9`：成为「source-bound、verifiable、read-only 旁路调查层」，首要楔子是 Verify 单条声明。新主张见同文件 `:3` 的 2026-09-07 优先级横幅：用户已明确选择「学习理解优先」，Verify 优先路线「不再作为当前实施顺序或现状依据」；`docs/design/learning-workspace.zh.md:11` 确认声明核验与 Evidence Map 被推迟且「不占据首页」。**接手时应以新主张为准，但旧文档的正文没有改写，仍是误导源。**

目标用户与竞品分析（`product-strategy.zh.md:35-54`）记录完整：审阅长任务结果的开发者、排障中的开发者、阅读陌生代码的学习者、PR/Issue 协作者；明确不以「所有 DSH 用户」为目标，纯 TUI/headless 暂不覆盖。

## 三、仓库与交付状态

「实测」`git status` 干净，`main` 与 `origin/main` 同步，HEAD `e6d03f9`，tag 到 `v0.8.2`。未跟踪项只有四项宣传片笔记和 `.vscode/`。仓库最后一次活动是 2026-09-16，至调查日静默六天。

版本线上：npm 已发布 0.1.0 到 0.8.2，`latest` 为 0.8.2（2026-09-14 发布）。**0.7 从未发布**——没有 `v0.7.*` tag，只有三份 beta 发布说明；轮盘、原生文档预览、玻璃视觉这些功能是随 0.8.x 一起上的，本身从未有过独立发布记录。0.1.0、0.4.2、0.8.0 三个版本在案弃用（打包缺陷、回归、Linux 符号链接启动失败）。

依赖矩阵（`.github/workflows/ci.yml`）：Ubuntu + Node 22.19.0、Windows + Node 24，pnpm 11.21.0，步骤为 `install --frozen-lockfile`、`typecheck`、`build`、`pack`、`git diff --check`。**没有测试作业。**

「实测」本机 Web profile 已从 npm 安装 0.8.2，~/.dsh/profiles/web/package.json 声明 @kirkchinese/dsh-citeciter: 0.8.2，并装有 dsh-codex-connect 0.1.0-alpha.4.34。

## 四、运行环境实测与版本漂移

「实测」本机 Node v24.19.0、pnpm 11.21.0、全局 `dsh` CLI 顶层版本 `0.1.5-rc.2`、`DSH_HOME=C:\Users\13642\.dsh`、Web 宿主监听 `127.0.0.1:3080`。

关键发现：**全局 CLI 顶层写 `0.1.5-rc.2`，但它内嵌的 `@deepseek-ai/*` 子包有 230 个是 `0.1.5-rc.3`**，包括 `dsh-agent-loop`、`dsh-scope`、`dsh-session`、`dsh-client-ui-sidebar-documentpreview`、`dsh-util-workspace-path`。而 CiteCiter 的 peerDependencies 与 devDependencies 全部钉在 `0.1.5-rc.1`（`dsh-client-ui-sidebar-documentpreview` 与 `dsh-util-workspace-path` 钉 `0.1.5-rc.2`）。`AGENTS.md:7-8` 与 `README.md:15` 声称的基线 `0.1.5-rc.1` 因此已经落后于实际运行环境。

这不是纯粹的记账问题。`host-agent-modules.ts` 在运行时从宿主安装解析 `dsh-agent-loop`/`dsh-scope`/`dsh-session`，拿到的是 rc.3；原生文档预览服务来自 rc.3 的 `documentPreviews`，而类型基线是 rc.2。

为了判断是否已经出问题，我做了三项针对已安装 rc.3 的实测：

- 宿主 DOM 标记 `data-shell-overlay`、`data-rightbar-fullscreen`、`data-chat-flow-kind`、`data-chat-anchor-key`、`data-chat-call-id` 在已安装包中全部仍然存在。
- 宿主 AppFrame 仍以内联 `gridTemplateColumns: ${sidebar}px minmax(0, 1fr) ${rightbar}px` 渲染，与 `host-dock.ts` 的正则完全匹配；`[data-shell-overlay]` 仍在 overlay 层上，其 `parentElement` 仍是 frame。
- 原生 composer 所依赖的 `sendSession`、`createDrafts`、`fileUploads`、`updateQueue`、`pendingInteractions`、`loadOlder`、`loadThrough`、`settingsScope`、`openSettingsDocument`、`documentPreviews`、`chat.assistant-actions` 在 rc.3 中全部仍可解析。

结论：**两处宿主耦合例外目前对 rc.3 仍然成立**，但这只是当前快照的一致性，不是兼容承诺。

## 五、架构地图

### 5.1 Host 面（`src/*.ts`）

入口 `src/index.ts` 只有 185 行：`apply(ctx)` 挂载 `CiteCiterHost`，后者 `extends TypertRemoteService` 并以 `super(ctx, 'citeciter')` 发布 Remote 服务。`inject` 声明 13 个宿主服务（`llm, sessionQuery, subprocess, agents, agentPresets, sessionController, systemPrompt, tools, sandboxPolicy, sessions, sessionPersistence, sessionTitle, attachments`）。对浏览器暴露两个 Remote 方法：`@Remote('request')` 与 `@Remote('checkUpdate')`；对进程内暴露 `ctx.citeciterRuntime`（`CiteCiterService` 窄接口）。`[Service.init]` 先 `await topics.initialize()`，保证私有运行时就绪前不发布 Remote 服务。对外事件为 `citeciter/topic-created`、`citeciter/topic-updated`、`citeciter/topic-deleted`。

核心是 `src/topic-runtime.ts`，2575 行，一切在此汇合。它内部**同时维护两套运行时**：一套是自建的私有 Cordis Context（`topic-runtime.ts:768`），依次挂载 `SessionStore`、`SessionProjectionRegistry`、只读 `SandboxPolicyService`、`AgentRegistry`、`SystemPrompt`、`ToolRuntime`、`UserQuestionService`、`ToolAskUser`、`ToolFs`/grep/glob、`JsonlSessionPersistence`（根指向遗留的 `~/.dsh/citeciter/sessions`）、`SessionTitleService` 与自己的 `AgentLoop`；另一套是 0.8 起的原生路径，直接用宿主自己的服务。`topic.json` 的 `hosted` 与 `storage` 字段就是这两条路径的分流标记。

命令面共 21 个 action（`topic-runtime.ts:854-935`）：`create`、`list`、`get`、`ask`、`stop`、`answer-question`、`cancel-question`、`rename`、`archive`、`delete`、`models`、`set-permission`、`set-model-route`、`set-reasoning-effort`、`select-model`、`board-capture`、`native-state`、`native-attachment`、`document-import`、`documents`、`document-get`。所有命令都经过 schema 校验并运行在 `AbortSignal.any([lifecycleAbort, callerSignal])` 之下。

**三处被明确许可的宿主耦合例外**，是接手后最需要盯的代码：

- `citer-session-access.ts`：用 `Object.defineProperty` 语义包装宿主根 `SessionStore` 的 `get` 与 `flush`，只把 CiteCiter 自有身份路由到自己的 store，`list` 不动，因此 Citer 成员不会出现在宿主列表；卸载时按保存的 descriptor 精确还原，且在还原前先 `drain()` 自有 Agent 的最后一次 flush。依赖宿主 `get`/`flush` 仍是普通自有属性。
- `host-agent-modules.ts`：从 CLI 的 `realpath(process.argv[1])` 解析宿主的 `dsh-agent-loop`/`dsh-scope`/`dsh-session`。0.8.1 修的就是 CLI 符号链接导致 `MODULE_NOT_FOUND` 的问题。
- `src/client/host-dock.ts` 及其 CSS：唯一修改宿主 AppFrame 布局的地方，向 frame 写入 5 个自定义属性并临时替换 `grid-template-columns`，把原 details 列平移出视野而非关闭它。

模型可见的工具按场景授权（`topic-runtime.ts:125-137`）：`read_source_session`、`ask_user_question`、`blackboard_apply`、`learning_cards` 恒可用；`read`/`glob`/`grep` 在 `allowSourceFiles` 下可用；`read` 场景额外有 `read_document`、`search_document`。`blackboard_view`（截图返回视觉模型）只在原生路径注册。

来源读取是 0.8.2 的招牌修复。工具输出字段语义（`source-read-tool.ts`、`observer.ts:70-87`）已逐字段写明：`sourceMaxSeq` 是本次快照的可读上界；`availableThroughSeq` 是**受请求上界约束的遗留标记，甚至可能低于本次 fromSeq**；`capturedThroughSeq` 是包含被过滤事件的扫描游标；`truncated` 只表示字节预算在请求范围内停止；`hasMore` 与 `nextFromSeq` 才是续读依据。分页预算 128 KiB。

删除的语义值得单独记住：`delete` 要求调用方回填完整 session id，拒绝尚未迁移到自有目录的 hosted 记录；在**加入准入队列之前**先写入意图，然后落 `deleting.json` 标记——**标记存在即逻辑删除提交**，物理清理只 unlink 私有根之下的 jsonl 产物，符号链接只删链接不跟随；物理清理失败返回 `cleanup: 'pending'`，启动时 `recoverDeletions()` 重放标记。迁移 `migrateStorage()` 逐条核验头部与全部事件，目标已有内容必须是源前缀，核验通过才切换索引，旧副本保留在 `migration-backups/`，核验失败只 warn 并保留旧存储。

### 5.2 Client 面（`src/client/**`）

入口 `src/client/index.ts` 234 行。全部注册都在 `ctx.inject(['remote.citeciter'], …)` 内部完成：5 个 `shell.overlay` 注册（轮盘、启动器、面板、阅读器、更新提示）、1 个 `conversation.view`（小黑板，order 30）、1 个 `settings.section`（order 45），外加可选的原生文档预览注入。所有扩展点都是公开 slot，唯一例外是 `host-dock.ts`。React 只拿到 `SnapshotStore` 选择器 hook 与 `viewActions()` 剥离后的业务回调，不接触 Cordis 服务。

中心控制器 `companion-controller.ts` 1147 行，采用代际守卫（generation guard）模式：每次切换来源、切 Topic 或异步操作都会推进 generation，迟到的响应被 `isCurrentTopicResponse` 丢弃；`retainVisible()` 用引用计数驱动 250 ms（运行中）/700 ms（空闲）轮询，面板、轮盘、黑板、设置页任一可见即开始轮询；`dispose()` 会 abort 生命周期信号并 drain 所有在途操作。

提交纪律在客户端被严格执行：创建 Topic、选择轮盘动作、切换模型都**不调用模型**；草稿按 `active.topic.sessionId ?? sourceSessionId ?? 'new'` 分键保存，切 Topic 不丢；`action.ask` 槽位在未补充问题时自动提交，标记 `ask: true` 的槽位只打开输入框；序列化（`serializeDraftReferences` + 可选的学习路线指令）只在 submit 那一刻发生。附件走宿主公开的 `createDrafts`/`sendSession`，草稿附件 id 由客户端持有并在 dispose 时释放。

选区链路是本项目最精巧也最脆弱的部分：`conversation-dom.ts` 集中定义宿主 DOM 标记 → `entries.ts` 的注册表按顺序 claim（只有成功 claim 才 `preventDefault`）→ `selection.ts` 计算可见文本偏移并附 ±240 字符上下文 → `markdown-source-map.ts` 用 mdast+GFM 建可见文本投影并在三种策略下匹配 → 宿主 `citation-mapping.ts` 再对已提交日志复验，多个候选打分相同时直接抛错而不是猜。轮盘是 8 个 45° 扇区、半径 42–180、π/8 死区，右键短按（≤220 ms）保留可点击轮盘，长按拖动选择。

板书协议 v4 是纯工具的原子提交：一次 `blackboard_apply` 的 `ops`（1–50 条）要么整体生效要么不生效，上限 50 个元素、500 000 字节。渲染按 kind 隔离——`math` 走 katex、`svg` 需通过 `isSafeSvg`（禁 script/foreignObject/href/`url(` 等）、`html` 进 `sandbox=""` 且 CSP `default-src 'none'` 的 iframe、`image` 只接受 `data:` 内联。截图由 `html-to-image` 生成 PNG，优先复用屏幕上真实的板书节点，否则用 1000×680 离屏渲染，含 iframe 的板书按设计拒绝截图。

### 5.3 磁盘布局

「实测」本机真实数据印证了代码中的布局：

```text
~/.dsh/sessions/<工作区>/<来源Session>/citeciter/
├── owner.json                     {kind:'citeciter-source',version:1,sourceSessionId}
├── migration-backups/<citer-session>/session.v3.jsonl.zstd
└── <Topic编号>/                    1,2,3… 按来源递增
    ├── topic.json                  schemaVersion 2
    ├── deleting.json               仅删除在途时存在
    └── sessions/<工作区>/<citer-session>/session.v3.jsonl
```

「实测」`topic.json` 的真实内容确认了 `hosted: true`、`storage: "source"`、`scenario`、`citation.schemaVersion: 4`、`observedThroughSeq` 等字段；Topic 自身的 JSONL 头是 `{"type":"session","version":3,…,"parentSession":"session-<来源>","isSeeded":false,"delegationDepth":0,"agentPreset":"standard"}`，也就是**原生会话带 parentSession 关系但不继承事件**。旧版私有存储 `~/.dsh/citeciter/{documents,sessions,workspaces}` 本机仍然存在，是迁移的来源；`~/.dsh/compat/citeciter-0.1.1-rc.2/` 下另有一份 DSH compat 数据。

## 六、本轮实测验证结论

| 检查 | 结果 |
| --- | --- |
| `pnpm typecheck`（host + client 双 tsconfig） | 通过，退出码 0 |
| `pnpm build`（tsc + tsdown 打包） | 通过 |
| 构建产物与提交的 `lib/` 是否一致 | **逐字节一致**，`git status` 无变化，说明源码与已提交的发布产物同步且构建可复现 |
| `git diff --check` | 干净 |
| 工作树污染 | 无，构建前后 `git status` 相同 |
| 宿主 DOM 契约（rc.3） | 5 个关键标记与 AppFrame grid 形状仍匹配 |
| 原生 composer API（rc.3） | 全部仍可解析 |
| 已安装插件版本 | Web profile 为 0.8.2，与 npm latest 相同 |

未做（需要真实模型和 UI，属功能验收）：任何一次真实对话、轮盘手感、布局组合、重启恢复。本报告不声称这些通过。

## 七、风险清单

按接手后可能咬人的顺序排列。

**极高：没有自动化回归网。** 33 个测试文件（含 `read-only.test.mjs`、`session-boundary.test.mjs`、`topic-index.test.mjs`、快照测试与 `dev/run-smoke.mjs`）在 `bf34088` 一并删除，`package.json` 不再有 `test` 或 `test:snapshot`，CI 无测试作业。历史测试数量（142→148→160→165→178→184）无法从当前树复现。这些文件仍在 Git 历史中可恢复。任何触及 `citer-session-access.ts`、`host-dock.ts` 或宿主版本的改动，现在都只能靠手工验收兜底。

**高：宿主版本漂移。** 包钉 rc.1，宿主实际 rc.3。`AGENTS.md`、`README.md`、CI 作业名都写 rc.1。

**高：宿主内部 API 是承重墙。** `source-storage.ts` 要求持久化后端实现 `resolveCurrentLog`，否则在 `discover()` 里直接抛错——**这会让插件启动失败，而不是单个命令失败**。`topic-index.ts` 的 `removeOwnedTopicGenerations` 硬编码 `.dsh/sessions/<project>/<session>/session[.vN].jsonl[.zstd]` 与 `session.lock` 命名，并在注释中承认「DSH 0.1.5 没有公开删除/定位 API」。`citer-session-store.ts` 改写 Cordis 私有 Symbol（`Context.filter`）。

**高：文档与已交付功能脱节。** `product-strategy.zh.md` 的「明确不做」仍写着不做学习卡片；其 Verify/Trace/Evidence Map 路线全部未建且被新主张推迟。`docs/design/learning-workspace.zh.md` 整个文件被 `.gitignore:6` 忽略，不在版本控制内——一份关键设计文档随时可能丢失。

**中高：0.7 功能没有独立发布记录，UI 验收从未关闭。** 轮盘真实按住/拖动/松开手感、原生预览查看方式与选文、设置页交互、完整玻璃视觉、明暗主题、缩放/DPI、窄窗口与最大比例、原生详情全屏，都在 `docs/validation/2026-09-11-wheel.md:36` 明确列为未完成。

**中：中英文 README 不对齐，违反 `AGENTS.md` 自己的规定。** 「权限、输入与队列」一节中文版多一段审批卡说明（`README.md:75`），英文版没有，导致 140 行对 138 行；`CONTRIBUTING.md` 表格 17 行对 `CONTRIBUTING.zh.md` 16 行。

**中：平台覆盖不均。** macOS 从未实测（`README.md:35`、`v0.8.1.md:37`）；Linux 只验证了启动模块解析，没有完整 UI 与在线模型验收。0.8.1/0.8.2 之后没有重跑过布局、工具和模型组合回归。

**中：模型内容质量不等于流程成功。** `docs/validation/2026-09-12-acceptance.md:44` 记录流程通过但事实质量验收未通过——模型在平坦环面 Levi-Civita 平移上保留了错误结论，并把文档中未定义的符号归给来源。`v0.8.0.md:51` 记录模型曾把错误结论写进学习卡，经追问才纠正。这是产品级已知限制，不是工程缺陷。

**中：来源读取可能静默跳过一条事件。** 当事件本身和它的 `oversized` 占位都放不进剩余预算时，游标会越过一个模型从未看到的事件（`observer.ts:434-446`）。同时 `hasMore` 在请求窗口已读尽时仍为 true，这是有意设计但需要提示词反复解释。

**中：附件门禁是子串匹配。** `hasSentSource` 只检查任意用户消息文本是否 `includes` 地址，因此正文里引用一次地址或粘贴一段日志就会永久授予读取权；而已发送的引用按设计无法撤回。

**中：读取会写盘并触发事件。** 任何非 create 的 topic 响应都被命名为 `updated` 并 emit，而 `snapshot()` 会写回 `updatedAt`、`observedThroughSeq` 和缓存标题。轮询因此在持续修改 `topic.json` 并广播事件。`patchMetadata` 是无 CAS 的 last-writer-wins。

**中：索引查找是每次命令全量扫描。** `loadBySessionId` 调 `all()`，后者 readdir 每个来源目录并解析每个 `topic.json`。

**低但需知道：** 文档库没有删除路径，`document-import` 会永久累积；失败的 hosted 创建会留下一条归档且不可删除的记录；`cleanup: 'pending'` 的残留会让 `deleting.json` 长期留在磁盘上，Topic 隐藏但占空间且没有重试入口；更新检查用 `createRequire` 读自己已安装的 manifest，从打包或搬迁目录加载时会判为 `installed-version-invalid`。

**代码卫生：** 问题长度上限三处不一致（`prompt.ts` 12 000 / 面板 11 000 / 轮盘 7 500）；`composerFolded` 硬编码为 `false`；`appendBoardCitation`、`resolveTopicModeAndSeed`、`foldBoardSnapshot`、`latestLearningStage` 导出但无调用者；`entryId` 每次选区都写但从不读；`settings-document.ts` 手写 `memoryStore` 与 `types.ts` 手写 `CiteBus`，重复了 `@deepseek-ai/dsh-client-store` 的能力；面板的按 Topic 映射表（草稿/文件/引用/视图）从不在切 Topic 时回收。

## 八、在飞工作流与未完成线索

**宣传片工作流（未跟踪，与插件解耦）。** 约两分钟的中文宣传片，受众为现有 DSH 用户，基调为克制的产品演示加鲸鱼引导动画。产物全部在 `.refs/video-production/citeciter-0.8.2/`（`revision-v4/`、`revision-v5/`、`recordings/`、`audio/`、`review/`、`deliverables/`、`bilibili/`），四份笔记未跟踪。已获用户批准的是 v5 pickup 剪辑（116.63 s）与结尾动作 J1；最新一步是 4K 重渲染 `revision-v5/edit/quality-4k/CiteCiter-v5-pickup-4K.mp4`（3840×2160、3499 帧、149 667 715 字节、SHA-256 `d1b81981…`），技术校验通过但主观画质验收未完成。**投稿状态：未上传。** 阻塞点是 Edge 浏览器控制故障，`.refs/diagnostics/edge-connection-20260916.md` 记录其未解决：扩展可发现，但标签页请求在约 2.1 或 21.1 秒后以 `nodeRepl.fetch request failed` 失败，根因未确立。笔记中提到的 `127.0.0.1:29182` 本地审查服务器**经实测已停止**（连接被拒），与笔记描述不一致。该工作流遵守「真实 OBS 录制是产品 UI 的唯一来源，生成图只做角色动画」的规则，MiniMax 语音预算在 125 元硬上限内实际用掉约 120.59 元。

**产品路线未建部分。** `product-strategy.zh.md` 的 Verify / Trace / Evidence Map / 脱敏导出 / 版本化 JSON 证据包 / 各类来源适配器 / `openInvestigation` 生态服务全部未实现，且被 2026-09-07 的优先级变更推迟。

**学习工作台设计 B/C/D 批未做**（`learning-workspace.zh.md:142-147`）：学习卡的手工编辑、列表、搜索与 Markdown 导出；独立于开关的主动回忆界面；绑定板书版本与步骤的精确引用；概念关联视图与用户更正；跨 Topic 检索；间隔复习（被有意移除）；跨设备同步。

**上游诉求已提交但无回应。** `docs/discussions/dsh-public-right-dock-proposal.md` 请求宿主提供公开的右侧 dock/concession API；另两项诉求是为 Tool 行提供与 `conversation.chat.assistant-actions` 对称的动作位，以及 `sessionId + seq` 的精确事件导航。

**仓库卫生。** `.refs/` 总计约 6.3 GB，含开发 home、tarball、OBS 检查产物；`.gitignore` 已覆盖，但其中包含 `minimax-key.dpapi` 等敏感文件与多份 `.credentials.yaml`，迁移或分享仓库时需注意。`.vscode/settings.json` 是与本项目无关的 MicroPython 配置残留且中文乱码。`packages/citeciter/README.md:9` 的示意图仍指向 `v0.8.1` 的 raw URL，而根 README 用仓库内相对路径。

## 九、必须遵守的流程约束

摘自 `AGENTS.md` 与 `CONTRIBUTING.md`，接手后不可自行放宽：CiteCiter 是外部插件，DSH 架构文档只是设计参考且必须对照实际安装的产物核版本，不得声称本仓库跑过 DSH monorepo 专有门禁。行为放在插件和公开服务/事件里，**不得修改宿主 Agent Loop**。`.dsh/sessions/<工作区>/<来源Session>/citeciter/` 归 Citer 所有，来源日志与迁移备份必须保留，Citer 成员不得出现在宿主列表。不得把 Topic 工作追加到来源 Session，不得用隐藏 seed 泄漏已移除的草稿引用。模型可见输入必须能从 Topic 日志重建。新 Topic 默认只读，写权限必须来自用户显式选择或改过的默认值。创建 Topic 或选择动作只准备草稿，模型请求必须手动提交。迁移必须比对完整原始日志、保留原副本、永不扩大权限。注册即 effect，用 `ctx.effect()`/`ctx.on()` 并在 owner 释放时回收监听器、观察者、控制器和私有运行时。在读取处校验外部 JSON 与持久化数据，同进程类型化调用不重复解码。静态检查不等于功能验收，验收要用真实模型、真实来源分支和主安装 DSH 的实际 UI，并分别覆盖宽/窄布局、最大比例、原生详情、关闭重开。保留主 DSH home 与既有会话，同一 home 不得同时运行两个写入进程。`lib/` 是发布的一部分，改源码后必须重建；构建候选包不等于发布。非平凡改动要写 `.agents/notes/` 笔记，归档笔记冻结。中英文 README 保持对齐，一段一行，文件末尾一个换行。绝不提交凭据、`.env`、`.npmrc`、临时 home、会话、截图或 tarball。

## 十、建议的接手第一步

先决定要不要恢复测试网。历史测试文件在 `bf34088^` 仍完整可取，其中 `read-only.test.mjs`、`session-boundary.test.mjs`、`topic-index.test.mjs` 覆盖的正是当前最脆弱的只读不变量与身份边界；恢复它们的成本远低于重新发现回归。

其次把宿主基线对齐到实测环境。要么把 peerDependencies 与 CI 升到实际运行的 rc.3 并重跑一次真实模型验收，要么明确记录「声明 rc.1、实测 rc.3 可用」这一事实，不要让文档继续声称 rc.1。

再其次修正文档漂移：`product-strategy.zh.md` 的「明确不做」清单与已交付功能直接矛盾；补上 `README.md:75` 的英文对应段落。

最后确认宣传片工作流的处置：它是独立线索，需要用户决定是继续推进 B 站投稿（前提是解决 Edge 控制问题）还是暂时封存。

## 十一、证据来源

实测命令：`pnpm typecheck`、`pnpm build` 与构建前后的 `git status`/`git diff --check`；对已安装 `dsh` 包的版本与字符串检索；对 `~/.dsh/sessions/**/citeciter/**`、`~/.dsh/settings.yaml`、`~/.dsh/profiles/web/package.json`、`~/.dsh/compat/**` 的读取；对 `127.0.0.1:29182` 的可达性探测；`git log`/`ls-files`/`check-ignore`/历史删除文件枚举。

代码阅读：`packages/citeciter/src/**` 全部 Host 与 Client 源文件，重点为 `topic-runtime.ts`、`topic.ts`、`topic-index.ts`、`observer.ts`、`source-read-tool.ts`、`source-storage.ts`、`host-session-adapter.ts`、`citer-session-*.ts`、`host-agent-modules.ts`、`client/index.ts`、`client/companion-controller.ts`、`client/host-dock.ts`、`client/components/CitePanel.tsx`、`scripts/tsdown.client.ts`。

文档阅读：`.agents/notes/**`（含 `implemented/**`）、`docs/releases/v0.1.0.md` 至 `v0.8.2.md`、`docs/validation/**`、`docs/product-strategy.zh.md`、`docs/design/learning-workspace.zh.md`、`docs/discussions/dsh-public-right-dock-proposal.md`、`README.md`、`README.en.md`、`CONTRIBUTING.md`、`CONTRIBUTING.zh.md`、`AGENTS.md`、`.github/workflows/ci.yml`。
