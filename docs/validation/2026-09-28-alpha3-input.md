# 0.9.0-alpha.3 输入回归验收

基线：Windows、主 Web DSH 0.1.7-rc.2、Desktop 2.0.15 / DSH 0.1.7-rc.2、Codex Connect 4.52。此次检查输入法组合、自动保存、草稿恢复和手动发送，其他功能不因本次检查获得新的验收结论。

## 原因与对照

已发布 alpha.2：真实 Citer 输入框通过 Chromium Input.imeSetComposition 依次输入 n、ni，再通过 Input.insertText 确认“你”，得到 nni你；每步间隔超过自动保存的 150 ms。相同浏览器、相同宿主中的 DSH 原生输入框得到“你”。直接逐键输入 abcXYZ123 正常，排除字体和普遍字符编码错误。协议事件走真实浏览器的组合输入，不通过脚本修改输入框或应用状态。

旧实现 432ce93 / 0.8 使用同步 React setState；4b2a89e 的 alpha.1 持久草稿重构引入无条件 await ensure。即使草稿已就绪，也会先让出事件处理，导致 React 恢复旧值并结束组合。alpha.2 的版本检查修改未触及此路径。

先只改 ready 草稿的同步更新，打包安装到主 Web 后，原序列正确得到“你”；保存提示仍存在时已经通过，表明移除提示不是掩盖输入问题。随后删除提示文字，保留错误与冲突处理。

## 结果

| 检查 | 观察结果 |
| --- | --- |
| 中文组合 | 最终包中 zhong → zhongwen → 中文 正确替换，跨越多次自动保存，没有保留拼音残段 |
| 英文与数字 | 逐键 abcXYZ123 正常；拉丁组合 he → hello → hello 正确替换 |
| 取消与光标 | 组合 cancel 后取消，原内容完整；在 hello 的 h 后组合 ce → ceshi → 测试，再键入 !，得到 h测试!ello，光标没有跳到末尾 |
| 换行与确认键 | Shift+Enter 产生真实换行，磁盘 JSON 同样保留；活动组合期间 Enter 不发消息，确认汉字后普通 Enter 手动发送 |
| 真实模型 | 新建验收 Topic 24、只读、学习路线关闭，使用 Codex Connect 的 GPT-6-Sol；两次手动请求分别回答“输入验收通过”和 OK |
| 发送期间编辑 | 首次 Enter 后立即逐键输入 laterDraft123，模型只收到原提交快照；编辑后的完整文本保留。第二次发送后不再编辑，宿主接收后草稿清空 |
| 静默保存 | 界面和打包 Client 均不再包含保存中的提示；草稿 revision 持续递增，内容落盘；错误、冲突和待核对发送的 UI 代码保持原样 |
| 切换和重启 | 切回旧 Topic，再返回 Topic 24，文本、模型和两条回答正确；重启主 Web 后中英两行草稿恢复，没有再次发送 |
| 数据边界 | 来源 v3 / v4 日志 SHA-256 与改动前相同；旧 Topic 23 当前数字草稿及两份引用保留，验收未编辑或提交该草稿 |
| 静态检查 | pnpm typecheck、pnpm typecheck:desktop 的 Host/Client、pack 内完整 build、git diff --check 通过 |
| 安装产物 | 同一 tgz 由主 Web CLI 和 Desktop 管理 CLI 分时安装；145 个发布文件与两套已安装文件逐字节一致 |

最终候选包 904652 字节，SHA-256：5aa14ad6c64860875cb307bb9c4710084dd6552a8f299e46816b1591b4fa2928；SHA-1：601c8cd789ef787a737c8901947692ad2822f170。验收使用最终包，单变量定位包不发布。

两次真实请求均由界面手动发送；没有人工模型、临时测试脚本或 DOM 状态注入。组合输入通过浏览器协议模拟实际 composition 生命周期，未声称覆盖每种 Windows 输入法候选窗。当前控制工具禁用原生应用 API，Desktop 本轮完成独立编译、管理 CLI 安装和字节核对，未新增原生窗口输入验收；不以 Web 结果替代。Linux/macOS 和独立 Desktop NEXT 仍未实机验收。

用户已接受的 Windows 只读 PowerShell 宿主编码限制与本次输入回归无关。此次修改不更改 Host Loop、会话格式、权限、发送收据或草稿冲突策略。

## 发布记录

[PR #12](https://github.com/kirkchinese/CiteCiter/pull/12) 已合并，发布标签 v0.9.0-alpha.3 指向 d22560447ede0e9452a3de2dad43413ed3812b0d。PR 的 [CI 36426337148](https://github.com/kirkchinese/CiteCiter/actions/runs/36426337148) 与合并后的 [CI 36426566652](https://github.com/kirkchinese/CiteCiter/actions/runs/36426566652) 均通过 Windows / Ubuntu 检查。

[GitHub prerelease](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.9.0-alpha.3) 和 npm 均已发布。npm latest / next 均为 0.9.0-alpha.3；公开包 SHA-1、下载后的 SHA-256 及 GitHub 资产 digest 与本机验收包一致。npm 首次接受上传后异步处理，本次等待公开后再同步标签，没有重复上传。

Web 与 Desktop 配置已安装同一发布产物，主 Web 已重启。单变量定位包、临时发布辅助文件和认证配置已清理；凭据未提交到仓库。原有未跟踪的视频制作笔记和 .vscode 配置保留。
