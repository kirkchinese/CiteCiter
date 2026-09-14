# 来源读取与建议追问验收

基线：DSH 0.1.5-rc.1、Desktop 2.0.9、Node 24.19.0。使用主要 DSH home 和真实来源分支；静态检查不代替模型与界面验收。

## 读取契约

通过 DSH 公开持久化 read 句柄读取真实主会话的 23 个事件，最高 seq 为 22。只请求 0–10 时，availableThroughSeq 为 10、sourceMaxSeq 为 22、truncated 为 false、hasMore 为 true、nextFromSeq 为 11。用 11 续读后到达 22，hasMore 为 false、nextFromSeq 为 null。

同一批真实事件还覆盖超出末尾、只含过滤事件、只读继承前缀、空前缀，以及缩小字节预算后的分页和超大事件占位。结果预算与 events 数组实际 UTF-8 长度一致，游标单调推进并最终结束。非法起止值被拒绝。未构造人工模型或伪造 Session 事件。

## 安装

0.8.2 候选已安装至主要 Web 与 Desktop profile，安装期间停止 Desktop，未同时运行两个 home 写入进程。两个已安装 Host bundle 与本地构建的 SHA-256 均为 d321c93faf8d25b65411f730f939062a7b45c8d14565a0b84611676863c22b54。Desktop 重启后原有 Topic 与历史消息正常恢复。

最终包补正设置页文案与 README 链接，Host bundle 未变。重装时发现相同路径、相同版本的本地 tarball 被安装器复用，改用新的包路径后核对 Host、Client 和两份 README 均逐字节一致。最终 Client bundle SHA-256 为 f8d654948a9ed2394e868819484cb1d70f0521b27cf5aaaa902bbd8667b7778e。

## 真实模型与界面

在主要 Desktop 使用 DeepSeek-V4-Flash-Vision-Exp / Max，所有模型请求均从原生 Citer 输入框手动发送，默认只读。通过 UI 创建两个真实来源分支，未新增独立 home。

| 操作 | 实际结果 |
| --- | --- |
| 首次要求先读 seq 0–10，证据不足时自行核查后文 | 模型先调用 `{fromSeq:0,throughSeq:10}`，收到 `sourceMaxSeq:22,hasMore:true,nextFromSeq:11,truncated:false`，随后自行调用 `{fromSeq:11}`，未保留旧上界 |
| 核查来源对 Promise.all / forEach(async) 的结论 | 最终回答使用后半段来源证据，并指出结论成立的条件，没有声称短窗口就是来源终点 |
| 首答建议追问 | 日志中首答只有一个合法控制块，UI 显示三个问题按钮，未显示原始协议标签 |
| 点击第二条建议 | 输入框填入问题，日志仍只有一轮完成记录；按 Enter 才产生第二轮请求 |
| 第二轮回答 | 正常完成，整个 Topic 仍只有首答的一个追问块 |
| 关闭“首答附追问建议”，创建另一 Topic | 实际 system/message 不包含追问指令，首答无追问块或按钮 |
| 删除新 Topic 未发送的来源附件，再询问来源结论 | 一次 read_source_session 被拒绝；模型没有重试或换工具绕过，明确要求手动附加来源或提供原文 |
| 核对提示词传递 | 实际 system/message 包含来源范围、分页与附件门禁说明；未隐式注入来源地址或静态引文 |

来源读取拒绝消息仍记录为工具错误，UI 正常显示失败卡及随后回答。没有文件工具调用。来源主日志 SHA-256 在回归前后保持 b24a20d3427b8f3c85be1484889f65de92f68500276545c433ad10d4e2296036。

验收后已在 UI 恢复“首答附追问建议”为开启，保留真实 Topic 记录。没有保留临时测试脚本；候选包与构建日志只在被 Git 忽略的 .refs 中。

## 覆盖边界

本轮聚焦来源读取、提示词传递和首答追问，不重复无代码变化的绘图、编程写入、归档、文件拖放及所有布局组合。Linux/macOS 的完整 UI 与在线对话不列为本轮已验收。

## 发布核对

用户随后授权测试通过后发布 0.8.2。修复提交 df76eb2 的 [Windows 与 Ubuntu CI](https://github.com/kirkchinese/CiteCiter/actions/runs/34802662004) 均通过。发布包与本机已验收候选包均含 120 个文件，逐文件比较仅两份 README 改变，全部运行代码、声明和配置一致。发布包 SHA-512 为 `sha512-MOcf/JfQXaxMqLcfEFOm96HjKuwL3rfWYQm9PLQZTCKjf8Al3HFBBJuGDC9jSmiAxGyLBXXCyQWZRRiHLsa79g==`。

0.8.2 于 2026-09-14 正式发布。PR #7 已合并；tag v0.8.2 指向 e5f0f09d4ce6fd02b2dd004444456107c0953b32，该提交的 [Windows 与 Ubuntu CI](https://github.com/kirkchinese/CiteCiter/actions/runs/34813457287) 均通过。npm latest 为 0.8.2，从 registry 下载的 tarball 与发布包逐字节一致；[GitHub Release](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.8.2) 为正式版，附件 SHA-256 为 f55329eccf2b8d8e7c1898782b4ef2b10b10f0c2fa54cd60c9479226b2f65974。

主要 Web、Desktop profile 均已从 npm 安装 0.8.2，全部 120 个安装文件与发布 tarball 一致。Desktop 重启后原 Topic 及历史正常恢复。0.8.0 的 npm 弃用提示与 GitHub 公告保留 Linux 符号链接错误说明，并指向 0.8.2。发布凭据仅用于临时配置，命令结束即删除；未写入仓库或用户 npm 配置。
