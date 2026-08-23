# `@kirkchinese/dsh-citeciter`

对 DSH 回复里的某一句追到底，不打断主 Agent，也不改变来源 Session。CiteCiter 为交互式 DSH 提供可核查、与来源精确绑定、只读的旁路调查。

![选中 DSH 回答后在 CiteCiter 私有 Topic 中继续调查](https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/assets/demo/citeciter-0.4.0.gif)

*确定性演示，不能作为真实提供方验收证据。*

[English](README.md) · [GitHub](https://github.com/kirkchinese/CiteCiter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues)

## 兼容性

| 宿主 | CiteCiter 版本 | 状态 |
|---|---|---|
| DSH Web `0.1.1-rc.2` | `0.4.1` | 已测试的 DSH 版本线；每次发布的具体验证证据见 GitHub Release |
| [DSH Desktop 2.0.2](https://github.com/anywhere-labs/deepseek-harness-desktop)（内置 DSH `0.1.1-rc.2`） | `0.4.1` | 每次发布均需通过平台门禁；平台证据见 GitHub Release |
| [dataelement DSH Desktop](https://github.com/dataelement/dsh-desktop) 源码开发壳（内置 DSH `0.1.1-rc.1`） | 仅 `0.4.0` | 历史上的有条件 Linux 源码壳证据 |
| DSH Web `0.1.0-rc.7` | `0.3.2` | 旧版稳定线 |
| DSH TUI | — | 暂不支持 |

## 安装 v0.4.1

CiteCiter 0.4.1 需要 Node.js `^22.19.0 || >=24.0.0` 与 DSH `>=0.1.1-rc.1 <0.1.1-rc.3`；正式 DSH Desktop 安装包已自带 Node.js、pnpm 和固定版本的 DSH。

DSH Web 使用：

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.4.1
```

安装后重启 DSH Web 并刷新页面。DSH Desktop 请打开托盘终端并运行：

```sh
dsh plugin add @kirkchinese/dsh-citeciter@0.4.1
```

外部 DSH 安装也可通过 `dsh plugin --profile desktop add @kirkchinese/dsh-citeciter@0.4.1` 显式指定同一 profile。安装后重启 DSH Desktop。

## 使用

1. 在一次已经提交的助手模型调用中选择文字；外层 Agent 轮次可以仍在运行。
2. 右键选区，输入第一个问题，然后点击 `Citer!`。
3. CiteCiter 在调查面板中创建一个新 Topic。
4. 在 Topic 中继续追问，或从 CiteCiter 的 Topic 栏恢复旧讨论。
5. 独立调整模型、思考强度、标题、归档状态和面板宽度，不改变来源 Session。

## 核心能力

- **精确绑定来源。** 创建 Topic 前，CiteCiter 会把可见选区与已经提交的回答重新核对。
- **不用等待主任务。** 一次模型回答提交后即可开始调查，外层 Agent 轮次可以继续运行。
- **调查可以持续。** 私有 Topic 支持自然续问，刷新或重启后仍能重新打开。
- **有证据、无写权限。** CiteCiter 能检查来源中已提交的事件，也能搜索和阅读项目文件，但不能改变来源 Session 或工作区。
- **过程可检查。** 问题、回答、来源读取和项目文件核查都留在调查面板中。
- **并排工作流。** 面板和可用主对话能同时容纳时，主对话会自动让出空间；更紧的布局才回退为覆盖模式。

## 上下文模式

Observer 是默认模式。它创建独立 Topic，并按需读取已经提交的来源证据；来源轮次仍在运行时也可以使用。

Exact Fork 是面向已结束来源轮次的高级模式。`exact-when-available` 在存在稳定边界时使用 Exact Fork，否则回退到 Observer。

## 从旧版本升级

在 Web 安装或升级 v0.4.1：

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.4.1
dsh plugin --profile web list --depth 0
```

DSH Desktop 托盘终端使用不带 `--profile web` 的同类命令；外部 DSH 安装使用 `--profile desktop`。

从 v0.3 升级不会迁移或重写现有 Topic、设置或来源 Session。仍在 DSH `0.1.0-rc.7` 上运行的用户应继续使用 CiteCiter 0.3.2。

## 已知限制

- 选区中必须至少包含一个已经提交的助手模型回答；纯用户消息、纯工具行和仍在流式输出的片段不能作为引用锚点。
- 渲染器生成的 KaTeX 排版和脚注编号没有稳定原文坐标，不能直接引用。
- Exact Fork 不能从仍在运行的来源轮次开始。
- 来源文件访问依赖当前 DSH 文件系统服务，并始终保持只读。
- Read Frog 翻译选区是 DSH rc.1/rc.2 上的 best-effort 兼容路径，仅在其完整私有标记同时存在时启用；普通 DSH 选区不依赖 Read Frog。
- DSH 尚未提供公开的增量右侧 dock 布局扩展点。CiteCiter 因此在面板与主对话能够同时容纳时使用可逆的私有 AppFrame grid 适配器；它保留布局的 details 偏好，但在调查面板打开期间临时隐藏该列，并且每个受支持的 DSH 版本都必须重新验证。
- Topic 由 Host 持久保存。Desktop 重启到不同 loopback 端口时，浏览器 localStorage 会因 origin 改变而失去精确指针，CiteCiter 将回退到最近更新的 Topic；需要精确恢复“上次查看”时应配置固定 Desktop 端口。
- 每次发布都必须通过 DSH Desktop 2.0.2 两种安装包的平台门禁。请以 GitHub Release 的证据为准，不要把旧版 dataelement Linux 源码壳的有条件结果视为当前正式 Desktop 证据。
- 当前没有 TUI 交互适配器。
- DSH 仍处于预发布阶段，后续 API 版本可能要求同步更新 CiteCiter。

## 交流与反馈

欢迎加入 DSH-Citeciter QQ 群（群号 `1108040435`），交流使用方式、功能想法和兼容性问题。

<p align="center">
  <img src="https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/assets/community/qq-group.jpg" width="360" alt="DSH-Citeciter QQ 群 1108040435 二维码">
</p>

## 参与贡献

欢迎提交 Issue 和 Pull Request。提交代码前请阅读[贡献文档](https://github.com/kirkchinese/CiteCiter/blob/main/CONTRIBUTING.zh.md)。

## 许可证

MIT © CiteCiter contributors
