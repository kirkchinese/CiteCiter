# Windows 只读 PowerShell 编码问题

历史状态：已定位，未在 CiteCiter 中修改宿主执行器。用户于 2026-09-28 接受此项为旧宿主限制；该决定不表示修复，也不代表更新宿主的验收结果。

上游已有同类[Discussion #4924](https://github.com/deepseek-ai/deepseek-harness/discussions/4924)。报告者提供的 FullLanguage guard 避免在受限模式执行编码初始化，并报告了真实 ACL 沙箱验证；这不是已合入或已发布的修复。本机另有 Windows PowerShell 5.1 中文编码问题，不能仅以 stderr 变空判定通过。当前安装的 RC2 仍使用无条件初始化，未安装讨论中的第三方分支。

## 环境与复现

2026-09-24，Web DSH 0.1.7-rc.1 的真实 Topic 在默认只读模式调用 pwsh 时出现受限语言错误。后续复现如下。

2026-09-27，主 Web DSH 0.1.7-rc.2、Citer 候选包 2a10a0ba878c 与 DeepSeek-V41-Flash 再次复现：真实 pwsh 调用输出 391，但“中文输出 OK”显示为替换字符，stderr 出现两次 `InvalidOperation: Cannot create type. Only core types are supported in this language mode.`。模型保留错误并停止，没有提升权限或重复调用。

实际命令无需写文件或构造 .NET 对象，错误来自宿主 pwsh-local 自动添加的编码初始化。安装产物与[上游实现](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/shell/pwsh-local/src/index.ts)均在每次命令之前创建 System.Text.UTF8Encoding。受限语言模式拒绝该构造；Windows PowerShell 5.1 回退到本地编码后，UTF-8 输出收集器还会产生乱码。

## 边界与修复要求

没有修改宿主 Agent Loop、覆盖错误输出或将 Topic 提升为工作区写入/完全权限。不能把 exit code 0 和正确算术输出当作整个工具成功，也不能要求模型换命令绕过拒绝。

正确修复应属于宿主 PowerShell 执行器与 Windows 沙箱的编码契约：受限进程中的标准输出和错误流应在进入受限命令之前正确配置，或通过提供方明确暴露实际编码供收集器解码。不得为了设置编码而放宽用户命令的执行能力。修复后须以真实沙箱核对中英文 stdout/stderr、外部程序管道、非零退出、取消及只读写入拒绝；只删除初始化语句并不能解决 5.1 中文输出问题。

本仓库保留定位和复现结果，未向上游自动发布 issue，也未把本地宿主补丁打包进 CiteCiter。

安装产物 dsh-sandbox-windows-acl 的 README 进一步说明：只读模式不授予临时目录写权限，PowerShell 启动时无法创建 AppLocker 探针文件，因此进入 ConstrainedLanguage；这是进程启动行为，不是 Citer 添加的语言模式。给临时目录增加写权限会改变既定权限边界，不能作为编码修复。只修改 Citer 的提示词也无法消除执行器前置语句的错误。

2026-09-27 补充定位：在 Windows PowerShell 5.1 子进程主动进入 ConstrainedLanguage 后，将构造函数替换为 `[System.Text.Encoding]::UTF8` 仍触发 `PropertySetterNotSupportedInConstrainedLanguage`，因为 `[Console]::OutputEncoding` 属性赋值同样受限。该最小诊断不替代真实沙箱验收，也没有提升原 Topic 权限；它排除了“只换成静态 UTF8 属性即可修复”的方案。Codex 附带 PowerShell 运行时，但 DSH 实际可发现的路径需独立核对，不能据此假定所有宿主均使用 PowerShell 7。

2026-09-28 发布决定：用户同意将此问题作为 DSH 宿主限制，不再阻挡 CiteCiter 0.9.0-alpha.1 的 next 预发布。故障与复现证据保留，Citer 不修改执行器、不提升权限；本决定不是修复或验收通过声明。
