# CLI 符号链接与宿主模块身份

用户提供 Linux 安装失败报告，要求查看并修复。报告中的操作与建议作为待验证材料，未直接采用其中的插件依赖回退建议。

在 Ubuntu/WSL 原生 Node 22.22.0 中，真实入口能加载宿主模块，单层链接和相对链接链均复现 MODULE_NOT_FOUND。修改仅在 host-agent-modules.ts 的 CLI 分支对已校验的绝对 argv 入口执行 realpath，再传入 createRequire。Desktop 的 resources/app.asar/package.json 分支保持原样；realpath 失败不静默回退。

生产模块的前后对照确认两个失败场景转为通过，三个返回导出均等于实际宿主实例。Windows CLI 与真实 Electron ASAR 分支也通过相同身份检查，避免仅验证 typeof 而漏掉依赖副本问题。无模型替身或宿主 Agent Loop 修改。临时探针和链接在验收后清理。

同一个 0.8.1 安装包已安装到主要 Web/desktop profile，Host bundle 哈希与本地构建一致。主要 Desktop 重启后恢复原有 Topic，使用既有真实视觉模型手动发送短请求并收到预期回复；独立 Topic 日志完整结束，来源日志哈希未变。此项覆盖 Desktop 恢复和发送，不扩展为 Linux UI 验收结论。

版本准备为 0.8.1 候选，中英文 README 和修复说明同步更新。Linux 全量 UI、在线模型调用及 macOS 尚未实测；范围和环境约束记录在 docs/validation/2026-09-14-symlink-launcher.md。本轮要求是修复，未推断为自动发布新的 npm 版本。
