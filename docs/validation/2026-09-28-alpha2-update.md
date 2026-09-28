# 0.9.0-alpha.2 更新检查验收

基线：Web DSH 0.1.7-rc.2、Desktop 2.0.15 / DSH 0.1.7-rc.2、Codex Connect 4.52。本次只修改版本解析、更新检查、包元数据和发布文档；先前真实模型会话证据仍归属于各自版本。

旧实现对 npm 实际发布的 0.9.0-alpha.1 元数据返回 registry-version-invalid；同一元数据的成功响应被 Zod 版本字段拒绝。用户确认先修复，再发布 alpha.2 作为默认 latest，保留预发布版本号。

解析与排序交由 npm semver 7.8.5，类型为 @types/semver 7.8.0；精确依赖进入锁文件。parse 后核对完整规范版本，拒绝 npm 为兼容 CLI 而接受的 v 前缀或空白。

## 本轮结果

| 范围 | 实际操作与结果 |
| --- | --- |
| 输入边界 | 6 个合法版本、16 个非法版本均符合预期；RPC schema 同样拒绝非法值 |
| 排序 | 8 个版本的 64 组比较通过，覆盖旧稳定版、alpha.1 / .2 / .10、beta、rc、稳定版及更高 minor；build 元数据不影响排序 |
| 真实 registry | 实际下载 npm 已发布的 alpha.1 和 0.8.2 元数据，旧版升级为 alpha、同版不升级、新 alpha 不降级四组结果通过；未伪造 registry 返回内容 |
| SDK 与构建 | pnpm typecheck、pnpm typecheck:desktop、pack 内完整 prepack/build 通过；git diff --check 通过 |
| 安装 | 停止主 Web 后，分别通过 Web CLI 与 Desktop 管理 CLI 安装同一个 tgz；145 个发布文件与两套已安装文件逐字节一致 |
| Web UI / RPC | 重启主 Web，刷新实际页面触发 checkUpdate；HTTP 200，Host/Remote 返回 success、installedVersion=0.9.0-alpha.2、latestVersion=0.8.2、updateAvailable=false；发布前较旧 latest 未引起误报 |
| 草稿与会话 | 原 Topic 的问题文字、来源及两段引文共 3 个引用恢复，仍为只读、未开启学习路线，没有自动发送；来源 v3/v4 日志 SHA-256 与安装前相同 |

发布包为 kirkchinese-dsh-citeciter-0.9.0-alpha.2.tgz，904265 字节、145 个文件。SHA-256：fcb230467d9c5a4107e76fd197e3e3a2928b9b9fdca6e84a12cb8eef572c6b1c；SHA-1：2e24ea0c004fd195bd95edb638afaf71d51fc80f。包内无临时测试、假模型、凭据或开发 home。

此次修改不涉及模型请求，不为验证版本比较而消耗模型调用；前版真实模型功能证据见 [alpha.1 验收](2026-09-27-connect-450.md)。Desktop 本轮完成独立 SDK 检查、管理 CLI 安装与发布文件核对，没有新增原生窗口功能验收；不将 Web 结果代替 Desktop UI 结果。Windows 只读 PowerShell 限制仍由宿主处理，用户已接受不阻止本次预发布；Linux/macOS 与独立 Desktop NEXT 外壳未实机验收。

## 发布记录

[PR #11](https://github.com/kirkchinese/CiteCiter/pull/11) 已合并；[CI 36421068577](https://github.com/kirkchinese/CiteCiter/actions/runs/36421068577) 的 Ubuntu / Node 22.19.0 和 Windows / Node 24 均通过。标签 v0.9.0-alpha.2 指向 78e1cb0d74e946408f0ff1902a00bfc99d65a32f，发布代码与通过 CI 的 PR 头相同。

[GitHub prerelease](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.9.0-alpha.2) 已提供 tgz 和 SHA256SUMS；GitHub 报告的包 digest 与本机 SHA-256 完全相同。npm 上传待维护者手动完成，随后核对 latest / next、下载包完整性及已安装版本的自动更新检查。此前自动审批拒绝 npm publish，本轮没有通过其他工具绕过。
