# Agent Note: 来源绑定的无引用 Topic 与所有者删除

Status: implemented

## Problem

CiteCiter 只能从选中的 Citation 或其他证据声明创建 Topic，因此 Topic 栏无法诚实地发起一个关联当前来源 Session 的普通问题。私有 Remote 虽然已经暴露 delete 命令，但该命令把 `SessionPersistence.locate()` 当成删除 API 使用，删除 JSONL 前没有写入崩溃恢复记录，也没有让所有 metadata 写入与删除串行。

DSH rc.2 明确不提供 Session 删除或保留 API。`locate()` 只是无副作用的制品目标提示；`AgentHandle.dispose()` 会让 Agent 达到静默，但本身不承诺 persistence coordinator 的异步 retirement 已完成。

## Decision

无引用 Topic 仍然绑定来源。创建命令携带当前 `sourceSessionId`、首个问题、Observer 模式，以及 `qa` 或 `present` 场景。Host 在预留 Topic 存储前验证来源 Session，继承其 cwd 和最新已提交模型路由，并记录 `citation: null`。metadata schema v2 明确表达 Citation 缺失；读取时把含 Citation 的 v1 metadata 正规化为 v2。首问提供临时标题，并通过普通的持久 Agent 路径接纳。仅打开客户端草稿不会创建 Topic Session。

无引用 Topic 不注入 Citation Context。其只读 `read_source_session` 工具仍永久绑定记录的来源 Session，但导师仅在问题需要来源上下文时读取它。含 Citation 的 Topic 保留现有首问证据行为。Topic 继续按来源 Session 分组，不按 cwd 分组，也不增加全局索引。

永久删除是 CiteCiter 所有的 JSONL 维护操作，不扩展 `SessionPersistence`。它只适用于 CiteCiter 私有 Context 挂载的固定 `$DSH_HOME/citeciter/sessions` backend。当前版本假定一个 DSH home 只有一个活动 CiteCiter 进程；在没有第二个受支持消费者的情况下不发明跨进程锁。

所有 Topic mutation 和延迟 metadata patch 共用一条逐 Topic admission 链。删除在进入该链前发布 deleting 状态，立即拒绝待处理的用户问题、取消活动 Agent，并拒绝已经排队或后来提交的 mutation。删除在链尾获得接纳后 dispose Agent，再调用 rc.2 的 `readFrom(id, 0)`。该读取会等待 persistence retirement 和逐 id 串行链，同时不保留 prepared Session 缓存。完成后 CiteCiter 才原子写入最小 `deleting.json` 标记。标记存在即为逻辑删除提交，并让 list/load 忽略 `topic.json`。

提交后，浏览器取消不能中断物理清理。CiteCiter 只移除 `kind: "jsonl"` 且规范父目录仍位于规范私有根目录下的制品。最终 symlink 或 junction 只解除链接，不跟随目标；目录和特殊文件会被拒绝。清理只使用非递归文件 unlink 和空目录删除。Remote 服务 ready 前，启动流程会重试遗留标记。删除响应用 `cleanup: "complete" | "pending"` 独立报告物理清理结果。

Archive 仍是可恢复操作，并保留 metadata 和 Session 历史。永久删除不提供用户回收站；`deleting.json` 只是内部恢复记录。

## Alternatives considered

**创建伪 Citation。** 已拒绝，因为虚构的偏移量和引用文本会让未经证明的记录与 Host 验证证据无法区分。

**全局显示无引用 Topic，或按 cwd 分组。** 已拒绝，因为多个 Session 可以共享同一个 cwd，而发起创建的来源 Session 已经是准确的导航身份。

**给 SessionPersistence 增加 `delete()`。** 已拒绝，因为 rc.2 明确把 retention 和 pruning 留给 backend 维护。CiteCiter 只拥有一个固定 JSONL 部署，不拥有 SQLite 或第三方存储的语义。

**用 `inspect()` 作为 retirement barrier。** 已拒绝，因为它会在 prepared-session LRU 中保留完整的冷 Session。`readFrom(id, 0)` 等待同一条 rc.2 retirement 链，但不会创建 preparation 缓存。

**提交 metadata 删除前先删除 JSONL。** 已拒绝，因为失败会留下仍然可见、但历史已经无法读取的 Topic。标记在不可逆制品删除前固定可恢复的逻辑决定。

## Consequences

旧的含 Citation Topic metadata 仍然可读，并投影为 v2。新的无引用 Topic 在 Host 和 Remote 协议中始终以 `citation: null` 区分，因此消费者必须渲染来源 Session 上下文，而不是解引用不存在的引文。

物理清理失败不会复活 Topic。响应和删除事件报告 `pending`，标记让 Topic 保持隐藏，启动流程会重试所有者清理。来源 Session、workspace 文件、导入文档、设置和共享浏览器 Citation anchor 都不在删除目标内。

永久删除保证刻意窄于通用 DSH Session 删除。若要支持多个活动 CiteCiter 进程共享一个 DSH home，需要单独设计所有权，或等待上游 persistence 删除能力。
