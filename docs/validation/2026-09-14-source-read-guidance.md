# 来源读取契约与 0.8.2 发布核对

历史基线为 DSH `0.1.5-rc.1`、Node `24.19.0`。本文保留真实来源记录的工具契约检查与 Web 发布事实，不将静态检查视为界面验收。

## 读取契约

通过 DSH 公开持久化 read 句柄读取真实主会话的 23 个事件，最高 seq 为 22。只请求 0–10 时，availableThroughSeq 为 10、sourceMaxSeq 为 22、truncated 为 false、hasMore 为 true、nextFromSeq 为 11。用 11 续读后到达 22，hasMore 为 false、nextFromSeq 为 null。

同一批真实事件还覆盖超出末尾、仅过滤事件、继承前缀、空前缀、字节预算与超大事件占位。返回预算等于 events 数组实际 UTF-8 长度，游标单调推进并结束，非法范围被拒绝。没有构造人工模型或伪造 Session 事件。

来源工具声明与提示词分别位于 source-read-tool.ts、topic-prompts.ts。来源内容仍由手动提交的引用授权；首次建议追问遵循设置，点击仅填入草稿。以上为实现契约，不新增平台通过声明。

## Web 安装与发布

0.8.2 候选安装至主要 Web profile。Host bundle SHA-256 为 d321c93faf8d25b65411f730f939062a7b45c8d14565a0b84611676863c22b54。相同路径与版本的 tarball 曾被安装器复用；使用新的包路径后逐字节核对 Host、Client 和两份 README。最终 Client SHA-256 为 f8d654948a9ed2394e868819484cb1d70f0521b27cf5aaaa902bbd8667b7778e。

修复提交 df76eb2 的 [Windows / Ubuntu CI](https://github.com/kirkchinese/CiteCiter/actions/runs/34802662004) 通过。发布包与候选均为 120 个文件，运行代码、声明与配置一致，仅两份 README 更新。发布完整性为 `sha512-MOcf/JfQXaxMqLcfEFOm96HjKuwL3rfWYQm9PLQZTCKjf8Al3HFBBJuGDC9jSmiAxGyLBXXCyQWZRRiHLsa79g==`。

0.8.2 于 2026-09-14 发布，PR #7 合并，tag 指向 e5f0f09d4ce6fd02b2dd004444456107c0953b32；[该提交 CI](https://github.com/kirkchinese/CiteCiter/actions/runs/34813457287) 通过。发布时 npm latest 为 0.8.2，registry 包与 [GitHub Release](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.8.2) 附件相同，SHA-256 为 f55329eccf2b8d8e7c1898782b4ef2b10b10f0c2fa54cd60c9479226b2f65974。

Web profile 从 npm 重装后全部 120 个文件一致。0.8.0 弃用提示保留 Linux 符号链接错误并指向 0.8.2。发布凭据仅用临时配置，未保存到仓库或用户 npm 配置。Linux/macOS 的完整界面和在线对话没有新增验收结论。
