# CiteCiter 0.4.0 发布验收报告

日期：2026-08-22

结论：**GO**。未发现可复现的 CiteCiter P0、P1 或 P2 缺陷；npm 0.4.0 与 GitHub `v0.4.0` 可以发布。

## 候选产物

- 包：`@kirkchinese/dsh-citeciter@0.4.0`
- 文件：`~/.dsh/candidates/kirkchinese-dsh-citeciter-0.4.0.tgz`
- SHA-256：`e3da7205798a5ff46e49158fdf4855dca4d35979b10bdc8809b7d3fbc665455d`
- Client bundle：424,719 bytes，与 npm 0.3.2 相同，增长 0%
- 演示 GIF：398,467 bytes，12 秒，低于 5 MB 门禁
- 包内容已核对入口、声明、双语 README、`dsh.bundle`、仓库反向链接和全部 DSH peer 范围

## 兼容性和包级门禁

| 环境 | 结果 | 证据 |
|---|---|---|
| Node 22.23.2 + DSH 0.1.1-rc.2 | PASS | 36/36 测试、类型检查、构建、打包通过 |
| Node 24.19 + DSH 0.1.1-rc.1 | PASS | 36/36 测试、类型检查、构建通过 |
| dataelement DSH Desktop 源码壳 + DSH 0.1.1-rc.1 | PASS | 宿主 264/264 测试和类型检查通过；实际随机 loopback Web profile 完成安装和 UI 验证 |
| npm 0.3.2 → 0.4.0，rc.2 隔离 profile | PASS | 设置、活动/归档 Topic、来源绑定及全部 CiteCiter 文件哈希不变 |
| npm 0.3.2 → 0.4.0，Desktop rc.1 隔离 profile | PASS | 设置与全部 CiteCiter 文件哈希不变；重启后首问、追问和回答完整恢复 |

0.3.2 仍是 DSH 0.1.0-rc.7 用户的稳定版本；0.4.0 只声明 `>=0.1.1-rc.1 <0.1.1-rc.3`。没有宣称 macOS、Windows 安装器或 TUI 已验证。

## Browser 真实使用结果

测试只操作 8081 和 Desktop 随机端口。3080 主进程始终为 PID 983174，命令为 `node /home/misaka/.local/bin/dsh web`，未停止、替换或修改其 profile。

| 用例 | 结果 | 观察 |
|---|---|---|
| 普通正文、翻译正文和跨节点选区 | PASS | 正确映射到最后一个相交的已提交助手调用 |
| 用户消息、纯 reasoning、纯工具行、空白和未提交正文 | PASS | 不创建 Topic |
| Observer | PASS | 已提交调用可立即创建私有 Topic，来源后续事件仍只读可见 |
| Exact Fork | PASS | 已结束轮次显示 Exact；开放轮次请求 Exact 时显示实际 Observer 回退 |
| 连续追问 | PASS | 首问、手工追问及快捷问题均可连续回答，来源 Agent 不被阻塞 |
| 来源会话工具 | PASS | `read_source_session` 始终存在；reasoning 开关改变返回内容 |
| 工作区调查 | PASS | 开启时实际完成 `glob → grep → read`；关闭后 schema 中移除三项工具 |
| 只读边界 | PASS | Bash、写入、编辑、删除和命令执行工具始终不存在；来源 Session 哈希不变 |
| 工具和 reasoning UI | PASS | 默认一行摘要；展开显示完整参数/结果；提示词注入、实时 reasoning 和错误状态使用 DSH 视觉语言 |
| 快捷问题协议 | PASS | 首轮严格控制块显示三个问题，第二轮不再生成；控制文本不泄漏到正文 |
| Topic 生命周期 | PASS | 切换、刷新、自动恢复、归档、恢复和来源隔离通过；私有 Topic 未进入主会话树 |
| 设置持久化 | PASS | Observer/Exact、reasoning、工作区、28/34/55% 宽度、键盘调节和自动恢复均即时生效并可刷新回读 |
| 视觉和布局 | PASS | 明暗主题、窄窗口、覆盖模式、鲸鱼入口、左侧折叠箭头、输入框和编程区并排使用正常 |
| Desktop 安装/重启/卸载 | PASS | rc.1 profile 安装后可用；重启恢复 Topic；卸载后宿主正常且插件入口消失，私有数据保留 |

稳定状态下 8081 与 Desktop 浏览器控制台均无 warning 或 error。测试期间看到的 `connection lost` warning 均发生在主动停止隔离测试进程之后，详见 [browser-logs.json](browser-logs.json)。

## 性能

| 指标 | 结果 | 门禁 |
|---|---:|---:|
| 7 个 Topic 首次恢复到可交互 | 1,882 ms | ≤ 2,000 ms |
| 可见 Topic 切换 | 307 ms | ≤ 2,000 ms |
| Desktop 未装插件三次冷启动 | 7,315 / 7,297 / 7,916 ms；中位数 7,315 ms | 基线 |
| Desktop 装插件三次冷启动 | 7,419 / 6,608 / 6,942 ms；中位数 6,942 ms | 不超过基线 15% 或 2 秒 |
| Client bundle 增长 | 0% | ≤ 5% |

Topic 列表保持元数据级读取；活动 Topic 才进行增量事件读取。Browser 操作中未观察到并发轮询、列表清空或重复读取完整来源 Session。

## 数据和边界核验

- rc.2 与 Desktop 中的两份来源 Session 在测试前后 SHA-256 完全一致。
- 0.3.2 → 0.4.0 的设置、Topic 元数据、Topic Session 日志和归档状态按文件哈希保持不变。
- 归档当前 Topic 后列表、详情和归档计数一致；恢复后回到活动视图。
- 8081 与 Desktop 使用隔离的 DSH home；没有向来源工程写入测试文件。
- 本仓库只包含计划内的 0.4.0 代码、文档、演示和验收证据变更。

## Desktop 宿主说明

dataelement Desktop 当前源码 checkout 的首次 `npm run dev` 会因其新 profile 未声明仓库内私有依赖 `dsh-desktop-hmr-fallback` 而在 CiteCiter 加载前失败。验收仅在隔离 profile 中加入该 Desktop 仓库自身的 `file:` 依赖，没有修改 Desktop 源码；随后使用其真实 Electron 源码壳、随机 loopback URL 和内置 DSH 0.1.1-rc.1 完成全部门禁。该问题属于 Desktop 源码开发环境，不是 CiteCiter 安装或运行缺陷。

## 关键截图

- [8081 来源会话](02-source-1440x900.png)
- [选区与提问](04-question-ready.png)
- [工具展开](06-tool-expanded.png)
- [浅色设置](07-settings-light.png)
- [深色设置](08-settings-dark.png)
- [运行中 Observer 回退](12-live-observer-fallback.png)
- [7 Topic 与工作区工具](13-seven-topics-tools.png)
- [Desktop rc.1 设置页](14-desktop-settings.png)
- [Desktop rc.1 实机 Topic](15-desktop-source-shell.png)

## 缺陷结论

- P0：0
- P1：0
- P2：0
- 外部宿主开发环境说明：1（Desktop 源码 profile 缺少其内部 HMR fallback 依赖；有界测试前置处理后不影响 CiteCiter 门禁）

最终判定：**GO**。
