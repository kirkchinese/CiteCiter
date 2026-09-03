# `@kirkchinese/dsh-citeciter`

对 DSH 回复里的某一句追到底，不打断主 Agent，也不改变来源 Session。CiteCiter 为交互式 DSH 提供可核查、与来源精确绑定、只读的旁路调查。

![选中 DSH 回答后在 CiteCiter 私有 Topic 中继续调查](https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/assets/demo/citeciter-0.4.0.gif)

*划选、右键、就地调查；主 Agent 继续工作。*

[English](README.md) · [GitHub](https://github.com/kirkchinese/CiteCiter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues)

## 核心能力

- **精确绑定来源。** 创建 Topic 前，CiteCiter 会把可见选区与已经提交的回答重新核对。
- **不用等待主任务。** 一次中间模型调用提交后即可开始调查，外层 Agent 轮次可以继续运行；思考内容和跨越“思考+回答”的选区也可以使用。
- **调查可以持续。** 私有 Topic 支持自然续问，刷新或重启后仍能重新打开。
- **有证据、无写权限。** CiteCiter 能检查来源中已提交的事件，也能搜索和阅读项目文件，但不能改变来源 Session 或工作区。
- **过程可检查。** 问题、回答、来源读取和项目文件核查都留在调查面板中。
- **讲解 Topic。** 只读老师可以在讲解时通过原子工具提交构建持久的公式、图形、表格或动画黑板。
- **并排工作流。** 面板和可用主对话能同时容纳时，主对话会自动让出空间；更紧的布局才回退为覆盖模式。
- **Web 更新提醒。** CiteCiter 检查 npm 中的稳定版本，并提供可复制的升级命令，无需给浏览器包管理权限。

## 使用

1. 在一次已经提交的助手模型调用中选择回答或思考内容；思考正文未展开时，可以从折叠行开始选择，该行代表该次完整模型调用。外层 Agent 轮次可以仍在运行。
2. 右键选区，输入第一个问题，然后点击“开始提问”或“开始讲解”。
3. CiteCiter 在调查面板中创建一个新 Topic。
4. 在 Topic 中继续追问，或从 CiteCiter 的 Topic 栏恢复旧讨论。
5. 独立调整模型、思考强度、标题、归档状态和面板宽度，不改变来源 Session。

## 安装 v0.5.0

CiteCiter 0.5.0 需要 Node.js `^22.19.0 || >=24.0.0` 与 DSH `>=0.1.1-rc.1 <0.1.1-rc.3`。

DSH Web 使用：

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.5.0
dsh plugin --profile web list --depth 0
```

请确认列表显示 `@kirkchinese/dsh-citeciter@0.5.0`，然后重启 DSH Web 并刷新页面。

CiteCiter 0.5.0 只提供 Web 安装路径。
从 v0.3 升级不会迁移或重写现有 Topic、设置或来源 Session。
仍在 DSH `0.1.0-rc.7` 上运行的用户应继续使用 CiteCiter 0.3.2。

## 上下文模式

Observer 是默认模式。它创建独立 Topic，并按需读取已经提交的来源证据；来源轮次仍在运行时也可以使用。

Exact Fork 是面向已结束来源轮次的高级模式。`exact-when-available` 在存在稳定边界时使用 Exact Fork，否则回退到 Observer。

## 讲解黑板

讲解 Topic 使用标准 Agent loop 和 scoped `blackboard_apply` 工具。黑板批次只在配对工具结果成功后显示；失败或中断批次保留此前画面。刷新和重启从私有 Topic Session 投影最终黑板，不存储第二份可变副本。

## Web 更新提醒

Web 客户端在不阻塞启动的情况下检查 npm `latest` 稳定版本。发现新版本后，右上角持久卡片提供 `更新`、`下次一定` 和 `不再提示`：第一个操作复制标准 Web Profile 安装命令，第二个操作在当前标签页会话内隐藏该版本，第三个操作关闭后续检查，直到在 CiteCiter 设置页重新开启。CiteCiter 不会执行安装命令；请在终端执行并重启 DSH Web。

首次包含检查器的版本仍需手动升级一次，因为已经安装的旧构建无法运行尚未包含的代码。使用自定义 Web Profile 时需替换复制命令中的 `web`。安装前请核对新版对 DSH 的要求；提醒只比较包版本，不声明宿主兼容性。此功能不包含 Desktop 更新。

## Host 开发接口

0.5.0 提供 Host 侧 v1 服务 `ctx.citeciterRuntime`（`create`、`ask`、`get`、`list`、`delete`）和 `citeciter/topic-created`、`citeciter/topic-updated`、`citeciter/topic-deleted` 事件。浏览器入口注册、preset 和独立客户端 face 仍在 M4/M5 计划内，因此前端扩展接口尚未稳定。

## 支持范围

| 宿主 | CiteCiter 版本 | 说明 |
|---|---|---|
| DSH Web `0.1.1-rc.1` 与 `0.1.1-rc.2` | `0.5.0` | 全新 profile Linux 包、组装浏览器冒烟与真实 DeepSeek 提供方验收通过 |
| [DSH Desktop 2.0.2](https://github.com/anywhere-labs/deepseek-harness-desktop)（内置 DSH `0.1.1-rc.2`） | 后续目标 | 正式 Desktop 安装包仍未验收 |
| [dataelement DSH Desktop](https://github.com/dataelement/dsh-desktop) 源码开发壳（内置 DSH `0.1.1-rc.1`） | 仅 `0.4.0` | 历史上的 Linux 源码壳记录 |
| DSH Web `0.1.0-rc.7` | `0.3.2` | 旧版稳定线 |
| DSH TUI | — | 暂不支持 |

动图只是流程演示，不代表 Desktop 安装包验收结果。

## 已知限制

- 选区中必须至少包含一个已经提交的助手模型调用；纯用户消息、纯工具行和仍在流式输出的片段不能作为引用锚点。已提交模型调用的思考折叠行可以代表该次完整调用。
- 渲染器生成的 KaTeX 排版和脚注编号没有稳定原文坐标，不能直接引用。
- Exact Fork 不能从仍在运行的来源轮次开始。
- 来源文件访问依赖当前 DSH 文件系统服务，并始终保持只读。
- Read Frog 翻译选区只是 DSH rc.1/rc.2 的兼容补丁，只有完整私有标记都在时才会启用。
- DSH 还没有公开的右侧 dock 扩展点。能并排显示时，CiteCiter 会临时调整布局；换到新的 DSH 版本后需要重新确认这一块。
- Topic 由 Host 持久保存。Desktop 重启到不同 loopback 端口时，浏览器 localStorage 会因 origin 改变而失去精确指针，CiteCiter 将回退到最近更新的 Topic；需要精确恢复“上次查看”时应配置固定 Desktop 端口。
- DSH rc.2 没有 Session 删除 API，因此 Topic 永久删除是对 CiteCiter 固定私有 JSONL 根目录执行的所有者维护。一个 DSH home 只能由一个活动 CiteCiter 进程占用，不支持多个活动进程共享。
- CiteCiter 0.5.0 只提供 Web 安装路径；Desktop 的正式安装包还没跟上。
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
