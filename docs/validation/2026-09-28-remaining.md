# 0.9.0-alpha.1 残余项

2026-09-28 核对。当前主 Web 为 DSH 0.1.7-rc.2，Desktop 为 2.0.15 / DSH 0.1.7-rc.2，两个 Profile 安装 Citer 第二十二候选包 4dcee0711a68 与未修改的 Codex Connect 0.1.0-alpha.4.52。npm 的 DSH latest/next 仍为 rc.2；Connect alpha 为 4.52、latest 为 4.50。本文保留发布前问题与历史失败；完整过程见 [RC2 联调记录](2026-09-27-connect-450.md)。用户随后接受上游 PowerShell 限制并授权 next 预发布；最终结果见发布检查。

## 可继续推进

| 项目 | 当前证据 | 下一步与边界 |
| --- | --- | --- |
| 已归档 Topic 的自由提问 | 第二十包 Web 实际右键轮盘从归档 Topic 22 新建 Topic 23；原归档、日志不变，没有模型请求 | 已通过；随后对活动 Topic 23 追加另一真实选文，文字、模型、只读权限与已有引用均保留。Desktop 手动向归档 Topic 22 发送后恢复的独立行为也通过 |
| Topic 创建延迟 | 本轮连续三次新建均成功，只产生会话、只读模式与一次手动标题事件，没有模型请求；一次用唯一旧标题到新标题观测的完整耗时为 613 ms，包含浏览器控制开销 | 尚未稳定复现旧长等待，不能声称根因已修复。下一次复现时对创建、来源载入和 UI 呈现分别计时；不凭旧控制超时添加重试 |
| Unicode 搜索范围 | 第二十包真实 GPT-6-Sol：Web 搜索导航符与 İstanbul，Desktop 搜索 🧭 与 İSTANBUL；均用工具返回范围精确读回，独立比对 UTF-16 偏移和 UTF-8 字节一致 | 已通过；两端工具参数、结果和最终表格可见，没有额外来源读取、路线、卡片或追问 |
| 最终包验收 | 第二十包两套类型检查、完整 prepack 首次通过，144 个文件与两个 Profile 一致；双端新增真实文档与草稿组合通过 | 与第十九包逐项对比，仅包内两份 README 改变，运行时代码一致。历史证据仍保留包次；此等价性不能清除 PowerShell 缺陷和矩阵中尚未完成的项目 |

创建耗时测量注意：第二次创建过快，控制工具未捕获中间的“正在准备 Topic”而报告等待超时；持久化目录和 UI 证明创建成功。此失败属于观测方法，不应记为产品创建超时。第三次先将当前验收 Topic 改为唯一标题，再等待新 Topic 标题和准备状态消失，避免把旧输入框当成完成信号。

Desktop 第二十包冷启动后主动选择 Topic 23，恢复 Web 保存的 revision 3、文字、三份引用、GPT-6-Sol 与只读权限，日志没有 request/header。其后切换到已归档 Topic 22，Enter 明确发送新问题，四次文档调用完成于 turn/end seq 63；Topic 恢复活动状态，draft revision 7 为空。来源 v3/v4 压缩日志与验收前摘要一致。Topic 23 未发送草稿继续保留。

## 外部阻塞与环境限制

| 项目 | 已定位的卡点 | 可行处理路径 |
| --- | --- | --- |
| 只读 PowerShell | 官方 RC2 与当日 master 的 pwsh-local 仍无条件创建 UTF8Encoding 并设置 Console.OutputEncoding，受限语言模式拒绝；本机 Windows PowerShell 5.1 另有中文编码不匹配 | 需要宿主 PowerShell 提供方修复，并验证实际运行时和 stdout/stderr 编码。单加 FullLanguage guard 只能消除初始化错误，不能证明 5.1 中文正确；不能靠 Citer 隐藏输出、提升权限或提示模型绕开 |
| Windows 构建偶发 UNKNOWN | 在 tsc 或 normalize-bundle 写文件时偶发；独立步骤和后续完整 prepack 通过，未确定持有文件的进程或稳定触发条件 | 需要捕获失败当时的文件占用/系统 I/O 证据。不将重跑通过当作根因修复，不添加无证据的构建重试 |
| 原生文件选择 | Desktop 选择器目标校验与缓存元素失败，Web 自动上传受扩展文件 URL 权限限制；用户手动添加后应用上传、恢复、读取和下载通过 | 必须区分工具控制限制与上传产品缺陷。不能绕过扩展权限或原生窗口校验；必要的原生选择仍由用户完成 |
| 旧开发目录清理 | host-dsh-0.1.2 已经核对为空并以非递归方式删除；三个编译目录的受限删除仍被自动审批返回 blocked by policy，命令未执行。其余六个目录保留，64 份旧会话文件备份再次逐文件核对一致 | 不更换工具规避本次拒绝。旧环境内部含指向主安装和源码的链接，后续清理必须只移除链接自身，不删除共享目标。拒绝未提供具体规则，与 npm 发布权限无关 |

上游定位：[PowerShell 实现](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/pwsh-local/src/index.ts)、[Discussion #4924](https://github.com/deepseek-ai/deepseek-harness/discussions/4924)。讨论中的第三方 guard 分支不是官方已发布修复，本机没有安装该分支。

## 发布判断

可以继续修复和验收 CiteCiter；当前没有理由把整个任务视为无法推进。用户于本日接受 PowerShell 上游限制，不再将其作为 alpha 发布阻挡项。实际功能证据与未覆盖平台保持原样，不宣称所有场景零缺陷。源码、真实会话、回滚包与备份继续保留；不改写 Git 历史，不宣称 Linux 已验收。


## 本轮发包补查

[发布检查](2026-09-28-release-gate.md)单独记录 Issue #9：当前候选的 RC2 兼容闸门和全部 Typert 工厂通过实际双宿主校验，无需版本例外。四份 README 的旧版安装警示与流程图已修正。第二十二包与第二十包仅两份 README 和发布元数据不同，运行时代码相同；完整 prepack 与双端安装一致性通过。显式使用官方 registry 和 next 的 dry-run 通过，但不代表正式发布鉴权或完整产品门槛通过。

发布准备更新：用户清理后，六项中五项已不存在，`.refs/dsh-rc1` 仍在且不在发布包内。最终包 15b722387edf 只更新第二十二包的两份 README，运行时代码与声明文件相同；完整构建、双套类型检查和双端 144 项安装一致性通过。详细摘要及最终发布结果见 [发布检查](2026-09-28-release-gate.md)。

最终发布：用户完成 npm 上传后，已核对 next=0.9.0-alpha.1、latest=0.8.2；npm 公开包、GitHub 附件与本地验收包逐字节一致。PR #10 已合并，双平台 CI 通过。PowerShell 保留为已接受的宿主限制；发布不扩展任何未验收平台声明。
