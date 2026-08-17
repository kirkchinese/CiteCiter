# CiteCiter

[![npm version](https://img.shields.io/npm/v/@kirkchinese/dsh-citeciter)](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**CiteCiter 是 DeepSeek Harness（DSH）Web 的选区解释侧边栏插件：选中助手回复，右键点击 `Citer!`，即可基于当时的会话上下文获得独立解释。**

*Selection-scoped explanations for DeepSeek Harness conversations, rendered in a resizable sidebar without writing to the parent session.*

> [!IMPORTANT]
> CiteCiter 当前仍处于早期开发阶段，很多功能仍然需要完善。API、兼容范围和安装方式都可能发生变化。欢迎通过 [Issue](https://github.com/kirkchinese/CiteCiter/issues) 反馈问题，也欢迎提交 Pull Request 共同开发。

## 已实现能力

当前 `v0.1.1` 包含 milestone 0 和 milestone 1 的可运行最小通路：

- 在 DSH 助手回复中选择文本，仅对 `assistant-step` 节点显示 `Citer!` 右键菜单。
- 通过真实会话 snapshot 解析选区节点的 `anchorSeq`，在该已完成轮次边界 fork 子会话，而不是从 DOM key 猜测事件序号。
- 子会话先执行 `/permission read-only`；只有命令成功且被 DSH 确认匹配后，才发送解释提示词。
- 解释提示词、模型回复、取消和错误全部留在子会话日志中；插件不会向父会话写入内容。
- 在 DSH 原生、可拖拽调宽的 `details` 右栏中流式显示解释。
- 支持 Markdown、代码、KaTeX、安全 SVG 预览和无脚本、无网络的 sandbox HTML 预览。
- Cordis listener、slot、订阅和异步销毁均随插件 fiber 回收；开发模式支持 client HMR。

详细行为见 [`packages/citeciter/README.zh.md`](packages/citeciter/README.zh.md)，实现证据见 [`docs/implementation-milestones.md`](docs/implementation-milestones.md)。

## 工作方式

```text
选择助手文本
  → Citer! 菜单
  → 在父会话 snapshot 中解析 anchorSeq
  → fork 独立子会话
  → 切换子会话为 read-only
  → 请求解释
  → 在 details 侧栏流式渲染
```

子会话继承 fork 边界之前的会话上下文，但不会成为当前会话，也不会修改父日志。已创建的解释子会话是正常的持久 DSH 会话；关闭侧栏或卸载插件只会移除本地订阅，不会删除这些子会话。

## 环境要求

- Node.js `^22.19.0 || >=24.0.0`
- DeepSeek Harness Web；当前开发和验证基准为 `@deepseek-ai/dsh@0.1.0-rc.6`
- 已在 DSH 中配置可用模型凭据

CiteCiter 的 DSH peer dependencies 使用 `^0.1.0-rc.6`。发布前已从 npm registry 核验 `0.1.0-rc.6` 确实存在于 DSH 主包和所需 client 包中；其他 DSH 预发布版本尚未获得同等程度的验证。

## 安装

先按照 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的说明安装 DSH，再把插件加入 Web profile：

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter
```

重新启动对应的 DSH Web 进程并刷新页面。之后在一条已经完成的助手回复中选择文本，右键点击 `Citer!`。

## 已知限制

- 目前仅支持 DSH Web 和助手回复节点，不处理用户消息、输入框或其他页面文本。
- 依赖 DSH `0.1.0` 预发布期的 client 与 session API，后续 DSH 更新可能要求同步适配。
- 解释子会话不会由插件自动清理。
- HTML/SVG 富内容采用保守安全策略；不安全或未闭合的围栏会退回普通 Markdown 代码块。
- 当前没有设置 UI、国际化配置界面、移动端专项适配或自动化跨平台浏览器 CI。

## 本地开发与验证

```sh
pnpm install
pnpm run typecheck
pnpm run build
pnpm --filter @kirkchinese/dsh-citeciter test
```

测试会先重新生成 `lib/types`，再运行 Node 测试。仓库跟踪 `packages/citeciter/lib/`，修改 `src/` 或构建配置后必须重新执行 build。浏览器 smoke、真实 anchor fixture 与 Cordis HMR 验证步骤见 [`docs/implementation-milestones.md`](docs/implementation-milestones.md)。

仓库中的主要材料：

- `packages/citeciter/`：可发布插件包、测试和开发 smoke。
- `docs/implementation-milestones.md`：当前可复现验证命令与覆盖范围。
- `.agents/notes/implemented/architecture/2026-08-17-citeciter-explainer-lifecycle.md`：解释流水线与 Cordis 生命周期决策。
- `DESIGN.md`、`docs/evidence/`、`probes/`：早期调研和探针证据；`DESIGN.md` 是历史记录，不是当前实现说明。

## 贡献

CiteCiter 欢迎社区共同开发：

1. 提 Issue 前请附上 DSH、Node.js 和 CiteCiter 版本，以及最小复现步骤。
2. 提交代码前请阅读本仓库 [`AGENTS.md`](AGENTS.md)，并运行与改动相关的 typecheck、build 和 test。
3. 涉及 DSH API 或 Cordis 生命周期时，请同时参考 DSH 的 [CONTRIBUTING](https://github.com/deepseek-ai/deepseek-harness/blob/master/CONTRIBUTING.md)、[架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)和[开发指南](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/development.md)。

社区插件发布方式也参考了 [`dsh-chat-import`](https://github.com/Nwflower/dsh-chat-import) 与 [`dsh-claude-move`](https://github.com/PerryLink/dsh-claude-move)。

## 许可证

[MIT](LICENSE) © CiteCiter contributors
