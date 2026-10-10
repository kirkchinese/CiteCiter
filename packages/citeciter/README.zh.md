# CiteCiter

[English](README.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [更新记录](https://github.com/kirkchinese/CiteCiter/blob/v0.9.0-beta.1/CHANGELOG.md) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues)

![CiteCiter](https://raw.githubusercontent.com/kirkchinese/CiteCiter/v0.9.0-beta.1/assets/hero/citeciter-hero.png)

**AI 已经完成了任务，我还想弄明白它是怎么做的。**

CiteCiter 是 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness) 的插件，帮助你从 Agent 的真实工作中学习。选中对话、工具结果或文档中的一段内容，在保留来源的独立 Topic 里追问，用小黑板理解关键关系，再回到原来的工作。主对话不会被改动。

[![CiteCiter 演示](https://raw.githubusercontent.com/kirkchinese/CiteCiter/v0.9.0-beta.1/assets/docs/video-cover.png)](https://www.bilibili.com/video/BV1tqeA65EJ8/)

[在 B 站观看演示](https://www.bilibili.com/video/BV1tqeA65EJ8/)（早期版本录制，界面与当前版本略有不同）。

## 安装

CiteCiter 需要 DSH 和一个可用的模型。插件声明了精确的宿主版本，请按 DSH 版本选择对应的 CiteCiter：

| DSH 版本 | CiteCiter 版本 |
| --- | --- |
| `0.2.0-rc.2`（含官方桌面版）、`0.2.1-alpha.1`、`0.2.1-alpha.2` | `0.9.0-beta.1` |
| `0.1.7-rc.2` | `0.9.0-alpha.3` |
| `0.1.5-rc.1` | `0.8.2` |
| `0.1.2-rc.1` | `0.6.0` |

**官方桌面版：** 在插件页安装 npm 包 `@kirkchinese/dsh-citeciter`，或在 Git 地址一栏填写 `https://github.com/kirkchinese/CiteCiter.git`，然后按提示重启。

**命令行与 Web：**

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.9.0-beta.1
```

也可以从仓库安装某个发布标签，仓库内已包含构建好的插件，安装时无需构建：

```sh
dsh plugin --profile web add "git+https://github.com/kirkchinese/CiteCiter.git#v0.9.0-beta.1"
```

安装或升级后重启 DSH 并刷新页面。不要用 `dsh plugin allow-version` 强行加载与宿主版本不匹配的插件。同一个 DSH 主目录不要同时运行两个宿主进程。

## 从一个疑问开始

例如，Agent 修改了程序，你想知道"为什么这段异步保存逻辑会影响输入？"

1. 在主对话、工具结果或文档中选中相关内容，按住右键打开轮盘，选择"自由提问"或"解释这段"。
2. Citer 打开草稿，来源地址和选文作为可移除的附件。写下问题、选择模型，再手动发送。
3. 围绕这段材料继续追问；需要时让模型在小黑板上画出流程，或整理成学习卡。
4. 回到原任务，用代码、工具结果或一次小实验检查自己的理解。

创建 Topic 或选择轮盘动作只会准备草稿，模型只在你手动发送后运行。解释和板书仍可能出错；它们帮助你理解和检查，不代替事实证据。

## 功能

| 你想做什么 | CiteCiter 提供什么 |
| --- | --- |
| 理解一段回答、代码或工具结果 | 带来源引用的独立 Topic，追问不会写入主对话 |
| 看懂关系与过程 | 支持 Markdown、公式、表格、SVG、图片和隔离 HTML 的小黑板；支持视觉的模型可以查看渲染后的板书并自行修正 |
| 留下可回看的理解 | 可导出、可修订的学习卡，文字与代码示例分开展示 |
| 围绕真实文件讨论 | 文件与图片附件、`.txt` / `.md` 文档阅读器、原生文件预览中的"CiteCiter 学习"入口 |
| 从理解继续动手 | 复用 DSH 的模型、工具、审批、权限、排队和插话；新 Topic 默认只读 |
| 暂停后继续 | 草稿（文字、引用、附件）和未提交的问答自动保存，切换、刷新或重启后恢复，不会自动发送 |

## 使用说明

**轮盘与引用。** 选中文字后按住右键打开八格轮盘，移向动作后松开；短按右键可点击选择，Shift + 右键保留浏览器菜单，方向键、数字 1–8 和 Enter 也可选择，Esc 取消。"自由提问"把选文加入当前选中的未归档 Topic，没有可用 Topic 时新建；其他动作默认新建。轮盘的八个槽位、提示词、默认模型和打开位置都可以在设置中修改。

**输入。** 输入框依次提供附件、权限模式、模型与思考强度、发送。Enter 发送，Shift + Enter 换行，输入法组词时 Enter 不会发送。生成过程中 Enter 跟随 DSH 的排队／插话设置，Ctrl + Enter 临时使用另一种方式。可以从附件菜单选择文件、粘贴图片，或把文件拖到 Citer 面板上。

**草稿。** 草稿在后台静默保存。多个窗口编辑同一个 Topic 时，各自的修改会自动合并；同一处有冲突时，以正在输入的窗口为准。发送成功后只清除已发送的部分，发送期间新写的内容会保留。

**学习路线与学习卡。** 学习路线默认关闭；开启后，模型会根据问题用 DSH 待办安排讲解步骤。学习卡可以随时单独请求，生成前模型会核对结论、条件和计算，但自查不能保证正确。主动回忆默认关闭，开启后学习卡先显示自测问题。

**图像。** 生成和查看图片的工具由 [Codex Connect](https://github.com/franksong2702/dsh-codex-connect) 等宿主插件提供，需要在对应的 Profile 中单独开启。

## 权限与数据

新 Topic 默认**只读**，即使来源会话拥有更高权限。只有你在输入框中选择其他权限模式，或在设置里修改新 Topic 的默认权限后，Topic 才能修改工作区；DSH 的审批和沙箱规则照常生效。

Topic 只出现在 Citer 的列表里，不会出现在 DSH 的会话列表中。双击标题或按 F2 重命名；归档的 Topic 在你再次发送消息后自动恢复。永久删除需要输入完整的 Session ID，只删除这个 Topic 自己的记录、草稿和附件。

CiteCiter 的数据保存在每个来源会话的目录中：

```text
.dsh/sessions/<workspace>/<sourceSession>/
├── session.v4.jsonl[.zstd]   DSH 管理的主会话（Citer 不会改动）
└── citeciter/
    ├── owner.json            目录归属
    ├── <topicNumber>/
    │   ├── topic.json        Topic 信息
    │   ├── draft/            未发送的文字、引用和附件
    │   ├── question-drafts/  未提交的问答
    │   └── sessions/         Topic 自己的会话日志
    └── deleted/              删除记录（只含身份，不含内容）
```

0.8 之前版本创建的 Topic 会在启动时自动迁移到这个目录，原始日志保留不动。

## 已知问题

- Windows 上，只读模式下的 PowerShell 可能报语言模式错误或输出中文乱码。这是 DSH 执行器在只读沙箱中的限制，CiteCiter 不会为此放宽权限。
- 官方桌面版重启后，仍连接着旧后台的其他浏览器标签页可能白屏，刷新即可恢复；停用 CiteCiter 时同样会出现。
- 在同一个浏览器地址上先后使用不同版本的 DSH，宿主自己保存的草稿格式可能不兼容，导致主对话无法显示；不同版本请使用不同的地址或端口。
- 插件主要在 Windows 上测试；Linux 与 macOS 未经系统测试，遇到问题欢迎反馈。

## 为什么做 CiteCiter

实践通常同时产生两样东西：成果和能力。我们通过尝试、犯错、比较方案和验证，逐渐形成判断。AI 可以接手越来越多的执行，却不会自动把相应的理解交给使用者，任务完成与人的成长可能因此分离。

CiteCiter 尝试把真实的 AI 工作过程变成可引用、可追问、可检验的学习材料。从眼前的一个疑问出发，理解原理、查看证据，再带着新的认识继续工作。即使把执行交给 Agent，人仍需要提出目标、理解关键条件、判断结果是否适用，并在出现异常时接管。

## 反馈

欢迎带着"Agent 已经完成了，但我还讲不清"的任务来[反馈](https://github.com/kirkchinese/CiteCiter/issues)。请写明 DSH 和插件版本，以及卡在安装、引用追问还是理解回答。贴材料前请移除密钥和私人内容。

开发说明见 [CONTRIBUTING.zh.md](https://github.com/kirkchinese/CiteCiter/blob/v0.9.0-beta.1/CONTRIBUTING.zh.md)，产品规则见 [docs/product.zh.md](https://github.com/kirkchinese/CiteCiter/blob/v0.9.0-beta.1/docs/product.zh.md)。同作者的 [Claude2DSH](https://github.com/kirkchinese/claude2dsh) 用于在 Claude Code 与 DSH 之间迁移会话和资产。

MIT License.
