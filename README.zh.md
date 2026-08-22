<p align="center">
  <img src="assets/citeciter-whale-sticker.png" width="360" alt="CiteCiter 鲸鱼吉祥物">
</p>

<h1 align="center">CiteCiter</h1>

<p align="center">服务于进行中 DeepSeek Harness 对话的独立学习伴侣。</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@kirkchinese/dsh-citeciter"><img src="https://img.shields.io/npm/v/@kirkchinese/dsh-citeciter" alt="npm 版本"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="MIT 许可证"></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="https://www.npmjs.com/package/@kirkchinese/dsh-citeciter">npm</a> ·
  <a href="https://github.com/kirkchinese/CiteCiter/issues">问题反馈</a>
</p>

CiteCiter 让你在已经提交的 AI 回答中选中文字，就地提出问题，并在独立 Topic 中继续多轮学习。来源 Agent 可以继续工作，来源 Session 不会被改变。

## 在 DSH 中的实际效果

<p align="center">
  <img src="assets/screenshots/citeciter-learning-dock.jpg" width="100%" alt="CiteCiter 学习栏与正在进行的 DSH 编程对话并排显示">
</p>

<p align="center"><sub>不离开来源对话，通过只读工具检查思考、会话事件和项目文件。</sub></p>

<p align="center">
  <img src="assets/screenshots/citeciter-settings.png" width="720" alt="DSH 原生设置对话框中的 CiteCiter 设置">
</p>

## 安装

CiteCiter 需要 Node.js `^22.19.0 || >=24.0.0`、DSH Web `>=0.1.0-rc.7 <0.1.0-rc.8`，以及已经配置的模型提供方。

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.3.2
```

安装或升级后，请重启对应的 DSH Web 进程并刷新页面。

## 使用

1. 在一次已经提交的助手模型调用中选择文字；外层 Agent 轮次可以仍在运行。
2. 右键选区，输入第一个问题，然后点击 `Citer!`。
3. CiteCiter 在学习栏中创建一个新 Topic。
4. 在 Topic 中继续追问，或从 CiteCiter 的 Topic 栏恢复旧讨论。
5. 独立调整模型、思考强度、标题、归档状态和学习栏宽度，不改变来源 Session。

## 核心能力

- **模型调用级引用。** `assistant/message` 一经提交即可开始学习，无需等待整个 Agent 轮次结束。
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

## 从 v0.2 升级

使用相同命令安装 v0.3，然后检查实际版本：

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.3.2
dsh plugin --profile web list --depth 0
```

升级不会改写来源 Session，也不会导入 v0.2 Citation Thread。旧子 Session 仍是普通 DSH 数据；新讨论使用私有 v0.3 Topic。

## 已知限制

- 选区中必须至少包含一个已经提交的助手模型回答；纯用户消息、纯工具行和仍在流式输出的片段不能作为引用锚点。
- 渲染器生成的 KaTeX 排版和脚注编号没有稳定原文坐标，不能直接引用。
- Exact Fork 不能从仍在运行的来源轮次开始。
- 来源文件访问依赖当前 DSH 文件系统服务，并始终保持只读。
- DSH 仍处于预发布阶段，后续 API 版本可能要求同步更新 CiteCiter。

## 参与贡献

欢迎提交 Issue 和 Pull Request。提交代码前请阅读[贡献文档](CONTRIBUTING.zh.md)。

## 许可证

[MIT](LICENSE) © CiteCiter contributors
