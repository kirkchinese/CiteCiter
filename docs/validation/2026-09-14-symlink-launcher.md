# 符号链接启动回归

报告环境为 Linux、DSH `0.1.5-rc.1`、CiteCiter `0.8.0`、Node `22.23.2`。npm 全局启动器是符号链接，Topic 创建或恢复时报找不到 dsh-agent-loop。本机 Ubuntu/WSL 原生 Node `22.22.0` 使用真实 DSH 依赖复现，未构造模块或模型替身。

临时预加载程序在真实入口执行前调用生产 loadHostAgentModules，比较三个导出与真实入口加载出的对象，随后退出，不启动服务或写入 Session。探针和临时链接验收后删除。

| 条件 | 修复前 | 0.8.1 修复后 |
| --- | --- | --- |
| Linux 真实入口 | 三个模块身份一致 | 三个模块身份一致 |
| Linux 单层符号链接 | MODULE_NOT_FOUND | 三个模块身份一致 |
| Linux 相对链接链 | MODULE_NOT_FOUND | 三个模块身份一致 |
| Windows CLI / Node 24.19.0 | 既有发布版本已验收 | 三个模块身份一致 |
| 缺失或相对 argv 入口 | 入口校验 | 明确拒绝，不执行依赖回退 |
| 不存在的绝对入口 | 模块解析失败 | realpath 报 ENOENT，保留路径错误 |

失败原因是解析位置，而非缺失依赖。修复先解析 CLI 入口真实路径，不回退到插件自己的 import.meta.url，保持宿主模块实例身份。

主要 Web profile 安装候选后，Host bundle 与本地 SHA-256 均为 3189ff1598ef0dbdbfd1de4388436b469cdc86f03a9cc48618d7abc162e31676。候选包 SHA-256 为 621531545c8c239b8659d91ef098b3cbee4380e270d0750c44e983d4b6b7d785，包含 118 个文件，无临时探针、模型替身、会话或凭据。

最终发布包运行代码、声明与配置和候选逐字节一致，仅 README 更新弃用及升级说明。SHA-256 为 b3fa5add5a324abd0c5237eaed7f053c0fd425660124ebcfe7b99b58fb44f26f，完整性为 `sha512-5kADjo/oYV9lqBFXmCQ8gNGPsktB0Oyb8xrNk7TOgor48E0uvmOw4hCgiI5QYpLS2+3hqwVouRuxncFUDJGfvQ==`。

发布后从 npm 下载的 788456 字节包与 GitHub v0.8.1 附件摘要一致；发布时 npm latest 与 GitHub Latest 为 0.8.1，0.8.0 已标记弃用。tag 指向 dc537a0e47a901b89c8c11f22c65a38e6364c9b5，[Windows / Ubuntu CI](https://github.com/kirkchinese/CiteCiter/actions/runs/34797996445) 通过。

类型检查与构建通过。Linux 证据仅覆盖真实 Node 模块解析，未单独完成 Linux npm 安装、完整 UI 或在线模型验收；WSL 网络初始化失败，macOS 无可用运行环境。
