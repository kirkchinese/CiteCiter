# Agent Note: Host 权威引用与元数据级 Topic 列表

Status: implemented

## Problem

DSH 回答的浏览器投影不是持久证据：分支、Markdown 渲染、翻译覆盖层和并发 UI 刷新都可能不同于已提交的 Session 事件。Topic 创建还曾允许私有 Agent 在导航元数据存在前启动，而列表轮询会重放无关日志并放大竞态。

## Decision

浏览器发送 `CitationSelectionClaim`，其中包含来源 Session id、已提交助手锚点、可见引用和附近渲染上下文。Host 读取对应的 `assistant/message`，使用共享 GFM 映射器把 claim 映射到 Markdown UTF-16 范围，并创建不可变 Citation 指纹。

Host 在热升级期间接受 v0.3.1 旧版 Citation 请求。Topic 与 Session 磁盘格式保持不变。

Topic 创建先持久化初始私有 Session 并原子写入 `topic.json`，再启动首个 Agent 请求。创建失败会释放 Agent 并删除两项产物。Topic 列表只读取元数据，对缺失的缓存标题投影一次，并把来源可用性读取推迟到创建、打开或来源工具执行时。

Exact Fork 保持 DSH 的已结束轮次要求。仅 `exact-when-available` 会在开放轮次回退；强制 Exact 会在创建 Topic 前失败。继承的标题不会进入 Topic 标题，现有 DSH LLM 标题服务只根据 seed 后第一条问题生成一次标题。

## Alternatives considered

**信任浏览器 Markdown 与偏移。** 请求更小，但展示状态会决定持久证据，并在分支或渲染投影与 Session 日志不一致时失败。

**把来源日志复制到每个 Topic。** 每个 Topic 更自包含，但会重复大型历史，而且 Observer Topic 无法读取新提交的证据。

**在每次列表轮询时重放全部 Topic 和来源日志。** 可即时派生所有字段，但导航成本随对话历史增长，并产生不必要的并发读取。

## Consequences

引用创建会执行一次权威来源读取并拒绝歧义映射。旧页面继续使用兼容请求路径，新页面不再提交浏览器生成的指纹。

导航在个人常见 Topic 数量下保持轻量。没有缓存标题的 Topic 会在每个 Host 进程内执行一次私有日志投影；打开 Topic 时才执行完整增量投影。元数据查询仍会线性扫描私有 Topic 目录，个人存储达到数千个 Topic 时可增加 id 索引。
