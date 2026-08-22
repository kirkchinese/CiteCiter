# `@kirkchinese/dsh-citeciter`

在 DSH 回复里划一句，旁边追问；主 Agent 继续工作，来源 Session 保持不变。CiteCiter 是与精确原文绑定、只读、可持续多轮追问的学习伴侣。

![选中 DSH 回答后在 CiteCiter 私有学习 Topic 中继续追问](https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/assets/demo/citeciter-0.4.0.gif)

[English](README.md) · [GitHub](https://github.com/kirkchinese/CiteCiter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues)

## 兼容性

| 宿主 | CiteCiter 版本 | 状态 |
|---|---|---|
| DSH Web `0.1.1-rc.2` | `0.4.x` | 完整验证 |
| [dataelement DSH Desktop](https://github.com/dataelement/dsh-desktop) 源码开发壳（内置 DSH `0.1.1-rc.1`） | `0.4.x` | Linux 源码壳验证；不代表 macOS/Windows 安装器实测 |
| DSH Web `0.1.0-rc.7` | `0.3.2` | 旧版稳定线 |
| DSH TUI | — | 暂不支持 |

## 安装

CiteCiter 0.4.0 需要 Node.js `^22.19.0 || >=24.0.0`、DSH `>=0.1.1-rc.1 <0.1.1-rc.3`，以及已经配置的模型提供方。

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.4.0
```

安装或升级后，请重启对应的 DSH Web 进程并刷新页面。

## 使用

1. 在一次已经提交的助手模型调用中选择文字；外层 Agent 轮次可以仍在运行。
2. 右键选区，输入第一个问题，然后点击 `Citer!`。
3. CiteCiter 在学习栏中创建一个新 Topic。
4. 在 Topic 中继续追问，或从 CiteCiter 的 Topic 栏恢复旧讨论。
5. 独立调整模型、思考强度、标题、归档状态和学习栏宽度，不改变来源 Session。

## 核心能力

- **模型调用级引用。** `assistant/message` 一经提交即可开始，无需等待整个 Agent 轮次结束。
- **私有 Topic。** 每次提交都会在 `$DSH_HOME/citeciter/` 下创建独立 DSH Session，不进入普通 Session 列表。
- **精确选区。** 可见 Markdown 选区会映射回 Host 可复验的原文范围。
- **跨流程选区。** 同时选中思考、工具与正文时，以选区中最后一个已提交模型回答作为可复验锚点，完整可见选区仍保留在学习栏中。
- **绑定来源的证据。** `read_source_session` 只读取一个固定来源 Session 的已提交事件，不暴露物理日志路径。
- **开放式项目调查。** 标准只读 `glob` 与 `grep` 先发现项目文件并搜索内容，再由 `read` 打开已知路径。
- **只读运行。** CiteCiter 不能写入来源 Session 或来源工作区。
- **可检查的对话流程。** 实时思考、提示词注入、工具调用、结果和用户提问都在学习栏中以紧凑可展开行显示。
- **自然续问。** 第一轮回答完成后，模型可按严格格式给出三个后续问题；格式无效时前端不创建快捷入口，只记录日志。
- **原生工作流。** 选区浮层、可调宽学习栏、活动/归档 Topic 导航和设置都保留在 DSH 编程界面内。

## 上下文模式

Observer 是默认模式。它创建独立 Topic，并按需读取已经提交的来源证据；来源轮次仍在运行时也可以使用。

Exact Fork 是面向已结束来源轮次的高级模式。`exact-when-available` 在存在稳定边界时使用 Exact Fork，否则回退到 Observer。

## 从旧版本升级

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.4.0
dsh plugin --profile web list --depth 0
```

从 v0.3 升级不会迁移或重写现有 Topic、设置或来源 Session。仍在 DSH `0.1.0-rc.7` 上运行的用户应继续使用 CiteCiter 0.3.2。

## 已知限制

- 选区中必须至少包含一个已经提交的助手模型回答；纯用户消息、纯工具行和仍在流式输出的片段不能作为引用锚点。
- 渲染器生成的 KaTeX 排版和脚注编号没有稳定原文坐标，不能直接引用。
- Exact Fork 不能从仍在运行的来源轮次开始。
- 来源文件访问依赖当前 DSH 文件系统服务，并始终保持只读。
- Desktop 验证覆盖 dataelement 项目的 Linux 源码开发壳；尚未宣称 macOS 或 Windows 安装器实测。
- 当前没有 TUI 交互适配器。
- DSH 仍处于预发布阶段，后续 API 版本可能要求同步更新 CiteCiter。

## 参与贡献

欢迎提交 Issue 和 Pull Request。提交代码前请阅读[贡献文档](https://github.com/kirkchinese/CiteCiter/blob/main/CONTRIBUTING.zh.md)。

## 许可证

MIT © CiteCiter contributors
