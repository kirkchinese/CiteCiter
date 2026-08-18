# CiteCiter

[![npm version](https://img.shields.io/npm/v/@kirkchinese/dsh-citeciter)](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <img src="assets/citeciter-whale-sticker.png" width="420" alt="CiteCiter 鲸鱼娘：在精确历史边界创建隔离学习 Thread">
</p>

## 基于精确历史上下文的、隔离式学习伴侣

AI 很会冲刺，却不总记得回头看你。代码、结论和新抽象快速涌来时，最危险的往往不是 AI 不会，而是它看起来什么都会——于是你一边点头，一边错过了真正理解的机会。

CiteCiter 让你在 DeepSeek Harness（DSH）的一条已完成助手回复中选中文字，右键点击 `Citer!`，提出你真正想问的问题。它会在那一刻的精确会话边界 fork 一条隔离、只读、可持久恢复的 Citation Thread；你可以继续追问、切换、重命名或归档，而源会话继续向前，日志不被写入。

**CiteCiter 不替你跳过思考，而是帮你追上 AI 的脚步。**

[English package documentation](packages/citeciter/README.md) · [中文包说明](packages/citeciter/README.zh.md) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

> [!IMPORTANT]
> v0.2.0 是持久 Host+Client 架构的第一版定位发布。项目仍处于早期开发阶段，API、兼容范围和安装方式可能变化。

## v0.2.0：从一次解释到持久学习 Thread

- 在同一条已完成 `assistant-step` 内捕获精确选区、UTF-16 范围与有界前后文。
- 通过源会话 snapshot 解析节点真实 `anchorSeq`；不从 DOM key 猜事件序号。
- 以“源会话 + anchor seq + 选区证据 SHA-256”识别 Citation；同一答案中的不同选区不会混淆。
- 在精确边界 fork 子会话，不切换 DSH 主界面的当前会话。
- 只有 `/permission read-only` 成功且命令被确认匹配、Host 校验通过后，才发送真正的用户问题。
- 首问可自定义，后续支持真实多轮；Thread 可刷新恢复、切换、重命名和归档。
- 常驻 `Citation Threads` 入口由 Host projection 恢复，不要求再次选择原文。
- Agent 作用域的 Tutor、Citation Context 与工具隔离不会污染其他会话。
- Markdown、代码、KaTeX、安全 SVG 和禁脚本/禁网络 HTML 继续采用保守渲染策略。
- Listener、Remote、projection、slot、订阅、动画帧和 Agent 作用域均随 Cordis fiber 回收。

## 模型输入为什么分成四层

```text
1. system：只作用于当前 Thread 的教学 Tutor
2. history：截至所选助手节点的精确历史前缀
3. user context：持久 Citation JSON（明确标记为不可信引用数据）
4. user：用户真正输入的首问与每次追问
```

这避免了把教学政策、历史证据、引用内容和用户意图塞进同一个伪用户 prompt。六个同题、同模型、同历史边界的真实对比中，四层方案总分 `138/144`，并在证据纪律与追问一致性上领先。完整 ADR、实验脚本和脱敏产物见：

- [`docs/architecture/0001-model-input-layering.md`](docs/architecture/0001-model-input-layering.md)
- [`experiments/model-input-layering/`](experiments/model-input-layering/)

## 工作方式

```text
选择已完成助手文本
  → Citer! 右键菜单
  → snapshot 解析真实 anchorSeq 与完成边界
  → 创建/复用隔离子会话
  → matched read-only
  → Host 校验并安装 Tutor / Citation Context / 工具守卫
  → 发送真实用户首问
  → 在 details 侧栏继续多轮
  → projection 持久恢复、切换、重命名或归档
```

Citation 文本始终是不可信数据。即使引用内容包含命令口吻、role JSON、HTML 或分隔符，也不会获得 system 权限。源会话只是证据和 UI 分组；提问、上下文、回答、停止、错误与标题全部属于子会话。

## 环境与安装

- Node.js `^22.19.0 || >=24.0.0`
- DeepSeek Harness Web
- 已在 DSH 中配置可用模型凭据

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.2.0
```

安装或升级后重启对应的 DSH Web 进程并刷新页面。Host 与 Typert 清单在进程启动时加载。包的 DSH peer range 从 `^0.1.0-rc.6` 开始；focused build 使用 rc.6 包集，v0.2 浏览器链路也在全新 DSH `0.1.0-rc.7` 进程中验证通过。

## 已知限制

- 只支持 DSH Web 中已完成的助手回复；选区必须完整位于同一个 assistant flow。
- 归档通过 DSH workspace 归档集合隐藏 Thread；暂时没有取消归档 UI。归档后再次选择同一 Citation 可能创建新的活跃 Thread。
- 工具 allowlist 有意保持保守；当前 DSH 未安装的只读工具不可用。
- 暂无设置 UI、完整国际化框架、移动端专项适配和跨平台浏览器 CI。
- DSH 仍处于预发布阶段，后续 API 变化可能要求同步升级。

## 开发与验证

```sh
pnpm install
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
```

仓库跟踪 `packages/citeciter/lib/`。修改 `src/` 或构建配置后必须重新 build。测试覆盖精确 fork、失败即关闭顺序、自定义首问、追问、投影恢复、transcript 边界、重命名/归档、销毁竞态、Typert 严格清单与富内容安全。

可复现浏览器 smoke 会在临时 DSH_HOME 中创建真实已结算会话，验证首问、持久 Thread、页面刷新恢复、父日志 size/mtime 不变和侧栏布局。完整命令、模型实验和发布门禁见 [`docs/implementation-milestones.md`](docs/implementation-milestones.md)。

## 仓库地图

- `packages/citeciter/`：可发布 Host+Client 包、测试与浏览器 smoke。
- `docs/architecture/0001-model-input-layering.md`：模型输入分层 ADR。
- `.agents/notes/implemented/architecture/2026-08-17-citeciter-explainer-lifecycle.md`：持久 Thread 生命周期。
- `experiments/model-input-layering/`：真实模型 A/B/C 对比。
- `DESIGN.md`、`docs/evidence/`、`probes/`：早期调研与探针；不是当前实现权威。

## 贡献

提交 Issue 时请附 DSH、Node.js 和 CiteCiter 版本及最小复现。提交代码前请阅读 [`AGENTS.md`](AGENTS.md)，并运行相关 typecheck、test、build 与 `git diff --check`。

## 许可证

[MIT](LICENSE) © CiteCiter contributors
