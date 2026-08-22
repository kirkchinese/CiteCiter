# CiteCiter 0.3.2 候选版验收报告

## 结论

CiteCiter 0.3.2 候选版通过本轮限定范围内的根因修复验收，结论为 **GO**。未发现可复现的 P0–P2 缺陷、Topic 泄漏、来源写入、升级丢失数据或阻断编程区的问题。本轮未发布 npm 或 GitHub Release。

## 候选产物与环境

| 项目 | 结果 |
|---|---|
| 候选包 | `/home/misaka/.dsh/candidates/kirkchinese-dsh-citeciter-0.3.2.tgz` |
| SHA-256 | `3dc96d14506de5f7f09a1b34d5231a34de4ef8f35e71e7943f56fcfc6bec8737` |
| 安装版本 | `0.3.2` |
| 安装后 Client 哈希 | 与源码构建产物一致：`3c29e6847599c86fd677c759ce537671550e03a54a3c6fa1574f36a451f223b7` |
| 验收实例 | 隔离 Harness home，Web 端口 `8081` |
| 3080 | 本轮未发送信号、未替换 profile、未启动或停止；收尾核验时该端口处于外部既有的未监听状态 |

## 用例结果

| 范围 | 结果 | 证据摘要 |
|---|---|---|
| 0.3.1 原位升级 | PASS | 候选安装前后的既有 Topic、设置和 Session 哈希一致；0.3.2 可直接恢复旧 Topic |
| Host 权威引用解析 | PASS | 官方分支正文、GFM、行内代码、重复文本、UTF-16、翻译提示和跨节点选择均由已提交 `assistant/message` 校验；伪造序号、非正文和流式未提交选区被拒绝 |
| Topic 原子创建与幂等 | PASS | 快速双击只创建一个 Topic；9 个 `topic.json` 与9个 Topic Session 一一对应、JSON 均有效，无临时或半成品目录、无 `ENOENT` |
| Exact Fork | PASS | 已结束模型调用创建 Exact；标题不继承来源标题，首轮后由标题能力生成“曲率与平行移动”；开放调用按策略回退 Observer，强制 Exact 明确失败且不创建 Topic |
| 运行中调用并行 | PASS | 来源轮次停在提问工具期间，已提交正文可创建 Observer Topic；来源和 CiteCiter 可分别继续，不阻塞、不串话 |
| 模型与思考强度竞争 | PASS | 快速交错选择后最终稳定为目标模型和强度，`topic.json` 与 UI 一致，迟到响应未覆盖新值 |
| 工作区能力开关 | PASS | 开启后实际请求包含 `glob / grep / read` 并完成目录枚举、全局搜索和文件读取；关闭后仅保留 `ask_user_question / read_source_session`；始终不存在 Bash、写入、编辑或删除能力 |
| reasoning 开关 | PASS | 关闭时 `read_source_session` 输出不含来源 reasoning，开启后恢复；两种结果均由实际模型请求捕获 |
| 快捷问题协议 | PASS | 首轮合法控制块生成恰好三个理解导向按钮；畸形控制后缀从正文隐藏、不生成按钮，刷新不重复记录错误 |
| 停止与继续 | PASS | 停止后保留已生成正文并显示可继续状态，下一次追问正常完成 |
| 提问工具 | PASS | 原版风格问题卡可选择、提交、显示回答，并可展开工具参数和结果 |
| 工具与提示词披露 | PASS | 工具默认显示一行摘要，展开显示完整参数/结果 JSON；提示词注入可展开为完整 Host 引用上下文 |
| Topic 生命周期 | PASS | 切换、刷新恢复、来源隔离、归档、恢复和当前 Topic 清理一致；私有 Topic 未进入 DSH 主会话树 |
| 设置持久化 | PASS | Observer/Exact、reasoning、来源文件、28%/34%/55% 宽度、键盘调节和自动重开均即时生效并经刷新回读；最终恢复原值 |
| 性能 | PASS | 7 Topic 自动恢复并稳定可交互用时 1637ms；Topic 切换用时 302ms；轮询未出现并发覆盖或列表闪空 |
| 视觉与可访问状态 | PASS | 三倍入口、左侧折叠箭头、原版风格输入框、明暗主题、禁用态、鲸鱼娘回答/读取/完成状态及引用水线淡入淡出均可达 |
| 浏览器运行日志 | PASS | 最终警告和错误日志为 `[]` |
| 来源工程只读性 | PASS | `/home/misaka/Drone_3D-01` 工作树收尾为干净状态；测试只写入隔离 Harness home 的 Topic 数据和证据目录 |

## 调用与持久化统计

隔离验收最终保留 9 个 Topic Session。Topic 日志记录 46 个 `step/start`，其中 44 个具有完成流事件；另记录 9 次独立标题能力请求。日志中共有 23 条 `tool/call` 与 22 条 `tool/result`，差额是一条从故意中断的 Exact 来源种子继承的既有未完成工具调用；候选版本轮发起的 22 次工具调用均有结果。浏览器实测覆盖连续追问、三次目录调查、提问卡、停止后续问、Exact 与 Observer 两条路径。

## 关键视觉证据

| 文件 | 内容 |
|---|---|
| `01-upgrade-preserved-topic.png` | 0.3.1 Topic 升级后恢复 |
| `03-tool-expanded-exact.png` | Exact Topic 与工具参数/结果展开 |
| `04-live-observer-fallback.jpg` | 运行中调用回退 Observer |
| `06-dark-settings.jpg` | 深色主题设置页 |
| `09-glob-grep-read-pass-dark.jpg` | `glob → grep → read` 成功链路 |
| `10-citer-question-card-dark.jpg` | CiteCiter 提问工具卡片 |
| `12-seven-topics.jpg` | 7 Topic 性能样本 |
| `13-waterline-hover.jpg` / `14-waterline-faded.jpg` | 引用水线悬停显示与离开淡出 |
| `15-whale-reading.jpg` | `read` 阶段鲸鱼娘举放大镜状态 |
| `16-prompt-injection-expanded.jpg` | 提示词注入完整展开 |

以上证据位于 `/home/misaka/.dsh/candidates/citeciter-0.3.2-evidence/`。Bash“潜水”状态按只读产品设计不可达，不计为失败。

## 缺陷记录

本轮没有遗留的 P0、P1 或 P2。目录调查首次调试曾由假模型使用非标准 `read.path` 参数产生失败，该测试夹具已改为 DSH 标准 `read.file_path` 后重新执行，完整链路通过；这不是候选包运行时缺陷。来源夹具中还保留一条用于验证错误展示的历史 `unknown tool` 事件，它属于来源 Session 的既有测试数据，不由 CiteCiter 0.3.2 产生。

## 恢复与清理

隔离设置已恢复为 `observer`、包含来源 reasoning、允许来源文件、34% 宽度、重新打开上次 Topic 和系统主题。候选 Topic 与截图保留在隔离 Harness home 作为可复查证据；来源工程未产生文件变化。验收结束后 8081 进程按正常中断流程停止。
