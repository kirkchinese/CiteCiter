# CiteCiter

[![npm version](https://img.shields.io/npm/v/@kirkchinese/dsh-citeciter)](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <img src="assets/citeciter-whale-sticker.png" width="420" alt="CiteCiter 学习伴侣">
</p>

## 跟得上 AI 的独立学习伴侣

CiteCiter 是 DeepSeek Harness（DSH）的学习伴侣插件。在一次已经提交的助手模型调用中选中文字，就地提出问题；来源 Agent 可以继续编程，讨论则在独立、只读、可持久恢复的 CiteCiter Topic 中多轮进行。

**它不替你跳过思考，而是帮你追上 AI 的脚步。**

[English package documentation](packages/citeciter/README.md) · [中文包说明](packages/citeciter/README.zh.md) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

> [!IMPORTANT]
> v0.3 用私有 Observer Topic 取代普通 DSH 子 Thread。项目仍处于早期开发阶段，API、存储和兼容范围可能变化。

## 使用流程

1. 在一个已经提交的助手模型调用中选中文字；外层 Agent 轮次可以仍在运行。
2. 右键，在选区旁输入第一个问题，然后点击 `Citer!`。
3. CiteCiter 为这次提交创建新 Topic，并在 DSH 编程界面右侧打开学习栏。
4. 在 Topic 内继续追问，或从 CiteCiter 自己的 Topic 栏恢复旧讨论。
5. 独立调整模型、思考强度、标题、归档状态和学习栏宽度，不改变来源 Session。

默认模式是 Observer。Exact Fork 保留为来源轮次已经结束时使用的高级操作。

## v0.3

- 以已提交的 `assistant/message` 为可引用最小单元，不等待 `turn/end`。
- 将渲染后的 Markdown 选区映射回原文 UTF-16 范围，保留 Host 可复验的 Citation 证据。
- 每次首问创建一个独立 Topic；相同选区不会静默复用旧讨论。
- Topic 使用标准 DSH Session、Agent Loop、标题和持久化服务，但存放在 `$DSH_HOME/citeciter/`，不进入普通 Session 列表。
- Topic 专属 `read_source_session` 工具按需读取固定来源 Session 的已提交事件，不向模型暴露物理日志路径。
- 独立 Agent 使用 read-only sandbox，只允许来源读取及可选的标准只读文件工具。
- DSH 设置页提供 Observer/Exact 偏好、来源 reasoning、只读来源文件、学习栏宽度和恢复上次 Topic。
- Topic 支持多轮、重命名、归档、恢复、停止和独立模型配置。
- Markdown、代码、KaTeX、安全 SVG 与沙箱 HTML 采用保守渲染策略。

完整产品和存储决定见 [`docs/architecture/0002-observer-learning-companion.zh.md`](docs/architecture/0002-observer-learning-companion.zh.md)。

## 安装与升级

需要 Node.js `^22.19.0 || >=24.0.0`、DSH Web `>=0.1.0-rc.7 <0.1.0-rc.8` 和已经配置的模型提供方。

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.3.0
dsh plugin --profile web list --depth 0
```

安装或升级后重启对应的 DSH Web 进程并刷新页面。v0.3 不改写来源 Session，也不导入 v0.2 fork 出来的旧 Citation Thread；新讨论使用独立的 v0.3 Topic 存储。

## 已知限制

- 选区必须完整位于一个已提交的助手 flow；不支持流式片段、跨消息或跨 block 引用。
- KaTeX 排版和脚注编号缺少稳定的原文字符坐标，暂不可直接引用。
- Exact Fork 不能从仍在运行的来源轮次开始。
- 来源文件读取依赖当前 DSH 组合提供文件系统服务，并始终保持只读。
- 暂无 Topic 搜索、UI 删除、完整国际化和跨平台浏览器 CI。
- DSH 仍处于预发布阶段，后续 API 变化可能要求同步升级。

## 开发与验证

```sh
pnpm install
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
```

仓库跟踪 `packages/citeciter/lib/`。修改源码或构建配置后必须重新构建。可复现安装、升级、运行时与浏览器门禁见 [`docs/implementation-milestones.md`](docs/implementation-milestones.md)。

## 仓库地图

- `packages/citeciter/`：可发布 Host + Client 插件、测试与浏览器 smoke。
- `docs/citeciter-product-interview.zh.md`：原始产品访谈记录。
- `docs/architecture/0002-observer-learning-companion.zh.md`：Observer 学习伴侣架构。
- `docs/releases/v0.3.0.md`：v0.3 发布说明与限制。
- `experiments/model-input-layering/`：模型输入分层实验。

## 贡献与许可证

提交 Issue 时请附 DSH、Node.js 和 CiteCiter 版本及最小复现。提交代码前请阅读 [`AGENTS.md`](AGENTS.md)。

[MIT](LICENSE) © CiteCiter contributors
