# 符号链接启动回归

报告环境为 Linux、DSH 0.1.5-rc.1、CiteCiter 0.8.0、Node 22.23.2。报告指出 npm 全局启动器是符号链接，Topic 创建或恢复时报找不到 dsh-agent-loop。复现环境为本机 Ubuntu/WSL 的原生 Linux Node 22.22.0，使用已安装 DSH 0.1.5-rc.1 的实际依赖文件，不构造模块或模型替身。

临时预加载程序在真实 DSH 入口执行前调用生产 loadHostAgentModules，比较返回的三个导出与真实入口解析出的模块对象，随后退出，不启动额外 DSH 服务或写入 Session。链接创建于 Linux /tmp，每次调用退出即移除。临时程序验收后删除，不提交。

| 运行条件 | 0.8.0 | 0.8.1 修复后 |
| --- | --- | --- |
| Linux 真实 DSH 入口 | 通过，三个模块身份一致 | 通过，三个模块身份一致 |
| Linux 单层符号链接 | MODULE_NOT_FOUND，Require stack 指向临时 bin/dsh | 通过，三个模块身份一致 |
| Linux 相对链接指向另一链接 | MODULE_NOT_FOUND，Require stack 指向 dsh-chain | 通过，三个模块身份一致 |
| Windows 真实 CLI 入口，Node 24.19.0 | 既有发布版本已验收 | 通过，三个模块身份一致 |
| Desktop 2.0.9，Electron 43.3.0 | 既有发布版本已验收 | 实际 Electron 进程从 app.asar 解析，三个模块身份一致 |
| 缺失或相对 argv 入口 | 既有入口校验 | 明确拒绝，未执行依赖回退 |
| 不存在的绝对入口 | 旧版随后模块解析失败 | realpath 返回 ENOENT，保留具体路径错误 |

此次失败由解析位置引起，不是依赖缺失。真实路径可以导入全部模块，且修复保持宿主实例身份。未采用插件自身 import.meta.url 回退，避免改变 Desktop 外部插件代理的模块身份约定。

0.8.1 安装包已分别安装到主要 Web 和 Desktop profile，安装期间先关闭 Desktop，没有同时启动两个写入进程。两个已安装 Host bundle 与仓库构建产物的 SHA-256 均为 3189ff1598ef0dbdbfd1de4388436b469cdc86f03a9cc48618d7abc162e31676。安装包 SHA-256 为 621531545c8c239b8659d91ef098b3cbee4380e270d0750c44e983d4b6b7d785。

重启主要 Desktop 后，原有 Citer Topic、历史图片和消息正常恢复，未出现宿主模块加载错误。保持只读权限和已配置的 DeepSeek-V4-Flash-Vision-Exp / Max，在 Citer 输入框手动提交“回归检查：请只回复数字 29，不调用工具。”，界面显示回复 29 并恢复可输入状态。独立 Topic 日志记录 user/message、request/header、assistant/message、step/end 和 turn/end，没有工具调用。来源 Session 文件的 SHA-256 在安装和本次发送前后保持一致。此项验证 Desktop 的恢复与真实发送，没有将 Linux 模块加载检查表述为 Linux 对话验收。

安装包内容检查通过，共 118 个文件；未包含临时探针、模型替身、会话或凭据。临时预加载程序和 Linux 链接已删除。

正式发布准备再次通过类型检查、完整构建和 diff 检查。最终包仍为 118 个文件，与已安装并完成真实模型验收的候选逐文件比较，仅中英文 README 更新了 0.8.0 弃用和 0.8.1 升级说明；全部运行文件、类型声明和包配置字节一致。最终包 SHA-256 为 b3fa5add5a324abd0c5237eaed7f053c0fd425660124ebcfe7b99b58fb44f26f，npm 完整性为 sha512-5kADjo/oYV9lqBFXmCQ8gNGPsktB0Oyb8xrNk7TOgor48E0uvmOw4hCgiI5QYpLS2+3hqwVouRuxncFUDJGfvQ==。

发布后从 npm 注册表重新下载 788456 字节安装包，SHA-256/SHA-512 与上述记录一致；GitHub v0.8.1 附件摘要相同。npm latest 和 GitHub Latest 均为 0.8.1，npm 的 0.8.0 deprecated 字段明确告知 Linux 符号链接错误并要求升级 0.8.1，新版未标记弃用。发布标签指向 dc537a0e47a901b89c8c11f22c65a38e6364c9b5，该提交的 [Windows/Ubuntu CI](https://github.com/kirkchinese/CiteCiter/actions/runs/34797996445) 均成功；合并后的完整树与验收提交一致。

Host/Client 类型检查和完整构建通过。Linux 使用真实 Node 模块加载，不是 Windows Node 模拟；但实际安装文件来自同一机器的 DSH 安装，未单独验收一次 Linux npm 安装。WSL 报网络初始化失败并回退到无网络，未进行 Linux 在线模型调用。macOS 无可用运行环境，不标为实测通过。此次不重复与入口修复无关的布局、工具及模型组合验收。
