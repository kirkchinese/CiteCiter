# Native Topics and manual drafts

The user's September 12 instructions supersede the former read-only private-runtime default and deterministic test requirement. New Topics must use native DSH permissions, start read-only, and never prompt automatically. The source conversation may have full access; that must not grant a new Citer Topic write access. Old records migrate through verified full-log copies into source-owned directories; failed migrations retain their original storage and permissions.

The installed baseline is DSH 0.1.5-rc.1 and Desktop 2.0.9, compared with upstream revision 183f08e9c6dde7e36cd2318eaee70b0da08fb35e. Native preview's optional client service resolves to 0.1.5-rc.2. The architecture references and interface findings are maintained separately in E:/project/DSH-Plugin-Development-Guide/13-native-session-and-manual-drafts.md.

HostSessionAdapter owns native factory handles and scoped Citer contributions, not the Agent Loop. New Topics are native Sessions with parentSession metadata and an empty seed. Source addresses and excerpts are explicit removable draft references; source/document tools require the corresponding address in a human message before reading it. An unsent reference cannot silently remain in inherited history. Sent references remain part of the durable conversation and cannot be retroactively withdrawn by deleting a later draft chip.

TopicIndex isolates metadata validation, navigation and legacy deletion. source-session.ts isolates source observation and attachment gating. Native client composition uses the installed public ConversationController and SessionFace methods for draft attachments, sending, queue updates and image loading. Full host chat/composer components are not exported as supported arbitrary-session embeddings; no private component imports or shadow queue are used. React receives callbacks and snapshot faces, without Cordis discovery.

BoardCaptureBroker correlates a model tool call to one browser capture, times out or aborts with its owner, and stores the returned PNG through DSH attachments. BoardCaptureSurface uses the same BoardView renderer as the native blackboard. It captures the visible board when possible, otherwise renders an offscreen 1000 × 680 board. Sandboxed HTML frames are explicitly unsupported. This is a visual rendering check, not a proof of mathematical or factual correctness.

Native readSession failed on a genuine seeded fork with later events because the constructor asserted seed equals inherited prefix. The adapter uses public observeSession with projectionMode 'none' and disposes its observation. It does not patch DSH or rewrite stored seedLength. Runtime access to sandboxPolicy and persistence is routed through explicitly injected Host services.

Current test/provider trees and temporary runner entry points are removed as requested, while Git history is preserved. CI now provides static and package checks only. Real-model evidence and open items are in docs/validation/2026-09-12-native-real-model.md. Final package regression is recorded in the validation document. The user confirmed source-owned Citer storage and deletion. Topic cleanup releases its native world and removes only its verified owned subtree; source logs and migration backups are excluded.

Desktop regression exposed split module identity: the packaged host and the external plugin fallback resolved separate dsh-scope copies, each with its own private Symbol. The adapter now mounts a dependency-declared child with agent.ctx.plugin, inheriting the Host context and scope without extracting or recreating its identity. Both the Agent and plugin owner dispose the contribution fiber idempotently. Full Desktop restart restored the same real Web Topic and its native tools. This avoids patching host module resolution.

The real vision test exposed a rendering bug: MathElement fixed its font to 15px even when the model requested 34px. It now inherits the element font size. Visible captures additionally match both Topic identity and board revision. Failed native creation retains an archived index instead of trying to delete host-owned persistence with legacy paths.

The final storage contract is `.dsh/sessions/<workspace>/<sourceSession>/citeciter/`. SourceStorage validates physical ownership, TopicIndex owns metadata and archive state, SessionMigration compares headers and all events through public persistence APIs, and OwnedSessionCleanup rejects symlinks and foreign paths. Seven verified root copies were moved to the approved migration-backups directory; the source hash remained unchanged. New owned creation, archive/restore, deletion and restart absence were observed in Web before the live-navigation isolation change.

The Host list leak was not recursive disk discovery. The shared SessionStore's live membership and session/created event advertised Citer rows. CiterSessionWorld now owns a native SessionStore and factory. Its creation filter restricts announcements to the Citer realm; event/projection routing retains native scope behavior. Native modules are resolved from the actual launcher to preserve Desktop's private module identities. The factory carries its explicitly injected sessions service into child context views; typert is isolated to avoid duplicate global lookup registration.

Native checkpoint-policy closes over the root store and previously rejected an owned session before the first model step. CiterSessionAccess is an intentional compatibility adapter: it reversibly wraps the existing public get/flush methods, routing only exact registered Citer identities and object instances to their stores. It does not replace list, alter persistence files or patch the Agent Loop. Real Desktop text generation now passes and the main list remains free of Citer rows. This adapter is an upgrade-sensitive exception and must be regression-tested with host checkpoint, tool, compaction and disposal behavior.

CiterSessionFace implements the published client contract without opening the host's navigation binding. Native ConversationController still owns draft attachment serialization and admission; native prompt/updateQueue/cancel APIs own execution. Citer state reads native inbox and durable admission receipts, including inbox insertions consumed by a failing pre-step. An accepted prompt is never retried because observation temporarily failed. Rendered image reads are authorized against the exact owned log.

Narrow layouts now occupy the main area with Back navigation, as requested. Returning restores the source and its original styles; no below-source layout is introduced. Transcript position is separated from portal/docking logic.

真实模型回归发现 Citer 未呈现宿主 pending interaction，表现为工具永远等待授权。新增 NativeInteraction 消费 uiSession.pendingInteractions，使用原生一锤定音的 answer/cancel，QuestionCard 仅接收数据与回调并呈现 detail，兼容计划评审。真实 ask_user_question 的选择、回答入日志和模型恢复已通过。审批按钮禁止自动放行，人工允许/拒绝验收仍未完成。

Cordis _unload 并发清理 effect，因此检查点适配在 drain CiterSessionWorld 后才恢复原 get/flush 属性描述符。拖动实测发现像素位置在宽度变化后落到末尾，transcript-position 改为消息 ID 和消息内相对位置。

思考内容消失由两处客户端回归造成：topic-presentation 隐藏无回答正文的 assistant 消息，AssistantTurn 不渲染已有 reasoning 字段。日志和实时流均保留数据。ReasoningDisclosure 独立接收文本与活动状态，复用 DSH 公共 DisclosureRow、MarkdownText 和思考图标，不依赖服务、不产生模型请求、不改写历史。

实时思考展开后，旧的 partial ID 在提交时被 durable message ID 替换，导致组件重新挂载。TopicStreamProjection 现在保留公开 end-frame 的 committed seq 到显示标识映射，仅作用于所属 Agent 生命周期；原始日志及消息 ID 不变。真实 DeepSeek 两轮教学问答已验证实时思考、完成后内容以及展开状态保留。

420 像素真实浏览器验收发现独立阅读器按钮覆盖模型选择。阅读器通过注入的 overlay 快照控制入口可见性；TopicActions 复用 ChoicePopover 并接收打开阅读器/设置回调。Citer 关闭时恢复独立入口，不增加工具栏按钮，不让 React 查找服务。

来源文档显示名通过 DocumentStore.summary 读取经验证的不可变元数据；snapshot 只传递 documentTitle。草稿和已发送消息的引用组件从序列化内容重建文件名与路径，路径按纯文本呈现。引用 ID 从 Topic 身份和引用种类稳定派生，避免 350ms 快照刷新重挂载菜单项。ChoicePopover 把关闭回调放入 ref，初始化焦点的 effect 只依赖稳定 anchor，方向键选择不再被刷新打断。source-world-25 Desktop 已通过方向键选择、跨多次刷新保持焦点、Enter 添加且不自动发送。

繁忙发送设置由独立 submission-preference 模块通过公开 settingsScope 绑定 ui-conversation，使用 ConversationSettings 类型，不导入宿主运行时常量、不访问私有 ComposerBar、不写宿主设置。React 接收快照 hook，当前 Topic 的显式覆盖与来源身份、宿主当前默认值绑定。输入框在繁忙时用 Ctrl/Cmd+Enter 临时反转 delivery，Enter 和发送按钮使用当前默认。source-world-25 的两组真实 DeepSeek 请求分别验证 queue/steer 默认及反向快捷键，实际 inbox next-step/next-turn 和后续轮次一致；原生提问卡等待期间可同时保留两类消息，提交答案后继续运行。宿主默认已恢复 queue。

source-world-25 原生文件写入审批由真实 write 工具触发。工作区外路径先得到 FS_SANDBOX_DENIED，继而显示宿主一次性审批。用户手动拒绝后，tool/result seq 353 明确 rejected，模型终止，目标未创建，UI 卡片收起。Citer 没有增加权限或拦截宿主决策。兼容/扩展/增强模式、120% 缩放和原生详情组合已记录；详情全屏的原生窗口控件重叠属于需单独处理的宿主界面边界，不通过扩大 Citer 布局改写范围来修复。

用户随后手动允许同一 write 操作一次；tool/result seq 368 创建成功，核验实际一行内容后移除临时文件，Topic 的 workspace-write 默认没有改变。实际约 902 像素 Desktop 与原生文件详情组合已验证独立页面及返回，恢复比例 28%、100% 缩放和默认排队。

运行中热卸载在 source-world-26 复现最终事件丢失。根因是仅延后 checkpoint 适配不足以保护同级持久化 fiber：Cordis 同时撤销它的 session/event 监听器，正在结束的 Agent 因此无法写入终帧。CiterSessionWorld 现在保留原生 handle，用公开 generator effect 收集子 fiber disposer，使 Agent 排空先于 Session 服务卸载；HostSessionAdapter 先排空 world 再释放工具贡献。source-world-27 在同一主 Web 进程禁用时保存 interrupted assistant/message seq 391、step/end 392 与 aborted/disposed turn/end 393，重新启用后仍可查看思考并通过 blackboard_view 取得真实图像。来源哈希未变。网页插件入口同步需要刷新，此项为宿主客户端生命周期约束；没有通过隐藏错误或补写日志模拟完成。
