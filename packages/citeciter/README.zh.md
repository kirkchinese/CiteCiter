# CiteCiter

[English](README.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues)

**AI 已经完成了任务，我还想弄明白它是怎么做的。**

CiteCiter 帮助你从 Agent 的真实工作中学习。选中对话、工具结果或文档中的一段内容，在保留来源的独立 Topic 中追问，用板书理解关键关系，再回到原来的工作。

如果你已经用 Agent 写出了代码或完成了分析，却还讲不清关键选择、不敢维护结果，或不知道该检查什么，这个插件希望帮你跨过其中一个具体障碍。它是 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness) 插件，需要 DSH 和可用模型；不是独立聊天应用。

[![CiteCiter 演示：从 Agent 的工作中学习](https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/assets/docs/video-cover.png)](https://www.bilibili.com/video/BV1tqeA65EJ8/)

[在 B 站观看演示](https://www.bilibili.com/video/BV1tqeA65EJ8/)。这是早期已发布版本的中文演示，展示引用、独立讨论与板书；界面与当前版本可能不同，不代表最新官方桌面版已经通过验收。

## 从眼前的一个疑问开始

例如，Agent 修改了程序，你想知道：“为什么这段异步保存逻辑会影响输入？”

1. 在原对话、工具结果或文档中选中相关内容，右键选择“自由提问”或“解释这段”。
2. Citer 打开草稿，来源地址和选文作为可移除的附件保留。写下问题，选择模型，再手动发送。
3. 围绕这段实际材料继续追问；需要时让模型画出流程、比较两种方案，或整理成学习卡。
4. 回到原任务，对照代码、工具结果或一次小实验检查自己的理解。主对话与 Topic 分开保存。

不用先组织一节课，也不必开启完整学习路线。相比另开一个聊天窗口，Citer 把来源、追问和相关记录留在同一个工作现场，减少反复复制上下文的步骤。解释和漂亮的板书仍可能有错；它们帮助你理解和检查，不代替事实证据。

## 安装与兼容

**桌面适配现以 DSH 官方桌面版为准，不再保证社区桌面版可用。** 当前官方 Windows 下载为 DSH `0.2.0-rc.2`，已核对安装程序签名和版本。官方下载：[Windows x64 安装程序](https://download.deepseek.com/desktop/dsh-latest-windows-x64.exe)。

| 宿主 | 截至 2026-10-07 的状态 |
| --- | --- |
| 官方 DSH Desktop `0.2.0-rc.2` | 正在核对安装契约与实际流程，尚未完成验收 |
| npm DSH `0.2.0-rc.2`（`latest` / `next`） | 当前适配目标，尚未完成验收 |
| DSH `0.2.1-alpha.1`（`alpha`） | 正在审查源码，尚未完成验收 |

本轮候选为 **0.9.0-alpha.4**，适配与验收仍在进行，尚未发布。当前已发布 CiteCiter 包为 **0.9.0-alpha.3**，是以 DSH `0.1.7-rc.2` 为基线的预发布版。不能把它安装到新宿主就视为兼容；不要绕过宿主的版本检查强行加载旧插件。

### Git 安装：公开 CLI 安装已核验，桌面界面流程仍待验收

本分支已补齐仓库根目录的插件入口。官方 CLI `0.2.0-rc.2` 已通过以下固定 GitHub 提交的真实安装，bundle 登记、四个模块入口和 Typert 描述均核验成功；官方桌面所用 pnpm `11.7.0` 的本地真实 Git 快照安装也已通过。修复提交 `f8825a6` 位于公开开发分支 `codex/official-desktop-october`，尚未合并 `main`，也未发布新的 Release 或 npm 包。官方桌面插件页的 Git 安装、该安装路径后的重启加载及完整功能验收仍未完成，不能将默认分支地址视为已经可用。

以下命令固定到已核验的开发提交，**仅供候选复测，不是已完成完整验收的推荐安装版本**：

```sh
dsh plugin --profile web add "git+https://github.com/kirkchinese/CiteCiter.git#f8825a68ac80f2f26a4d4f8bdd2e7fd2ba3a2aea"
```

官方桌面插件页的 Git 地址使用同一个带提交或标签的仓库地址；其实际界面流程仍待验收。该入口直接使用仓库内已构建的插件，不需要填写 `#path:packages/citeciter`、运行安装时构建或跳转到已发布 npm 包。检查范围与限制见[本轮验收记录](https://github.com/kirkchinese/CiteCiter/blob/codex/official-desktop-october/docs/validation/2026-10-07-official-desktop.md)。

安装兼容插件后，在 DSH 中配置可用模型。全局 CLI 与桌面应用的内置运行时分别管理；不要让两个进程同时写入同一个 DSH home。Linux 与 macOS 本轮没有实机验收结论。

**0.8.0 已弃用。** Linux 符号链接启动 DSH 时可能无法创建或恢复 Topic，报找不到 `@deepseek-ai/dsh-agent-loop`。0.8.1 修复了启动路径，0.8.2 仅保留给旧 DSH `0.1.5-rc.1` 基线。**不要在 DSH 0.1.7 或更新版本上使用 0.8.2：** 旧包的 peer 版本与 Typert 工厂接口不匹配，见 [Issue #9](https://github.com/kirkchinese/CiteCiter/issues/9)。alpha.1 / alpha.2 的组合输入回归已在 alpha.3 修复。完整变化见 [Releases](https://github.com/kirkchinese/CiteCiter/releases)。

## 已有能力

| 你想做什么 | CiteCiter 提供什么 |
| --- | --- |
| 理解一段回答、代码或工具结果 | 带来源引用的独立 Topic，继续追问且不把讨论写入主 Session |
| 看懂关系与过程 | 支持 Markdown、公式、表格、SVG、图片和隔离 HTML 的小黑板 |
| 留下可回看的理解 | 可导出、修订的学习卡；文字与代码示例分别展示 |
| 围绕真实文件讨论 | 普通文件与图片附件、文档选文、可选原生文件预览入口 |
| 从理解继续动手 | 复用 DSH 模型、工具、审批、权限、排队和插话；新 Topic 默认只读 |
| 暂停后继续 | 自动保存草稿、附件与引用；切换 Topic、刷新或重启后恢复，不自动发送 |

这些是插件已有的功能；新宿主上的可用性仍须以上方兼容验收为准。模型返回的思考内容、工具参数与结果可在 Topic 中查看；没有返回思考内容时不显示空的思考行。兼容的宿主插件可以提供图像生成和查看工具，Citer 不代替它们的账户配置，也不会因安装插件自动开启相关能力。

## 引用、草稿与操作

“自由提问”把真实选文追加到**当前来源中选中的未归档 Topic**；未选中或已归档时新建。其他内置动作默认新建，自定义动作可设置目标。追加保留已有草稿、模型与权限；加号只选择实际文件，不制造来源引用。

创建 Topic、选择轮盘动作、切换模型和引用板书都只准备草稿。引用可在发送前移除；未发送草稿不写入模型日志，也不授予来源读取权限。已发送引用属于历史上下文，删除后续草稿中的副本不会撤回历史消息。

输入框依次提供附件、权限模式、模型与思考强度、发送。Enter 发送，Shift + Enter 换行；输入法组词期间 Enter 不发送。生成过程中，Enter 跟随 DSH 的排队／插话偏好，Ctrl + Enter 临时使用另一方式。手动发送成功后跳到最新消息；模型继续输出时尊重用户向上阅读的位置。

草稿后台保存，不显示反复闪动的保存进度。宿主确认接收后只清除本次提交，保留发送期间新增的编辑。失败保留草稿；响应丢失、多窗口冲突及附件恢复失败有明确提示。选择保留本窗口草稿时，会重新保存本窗口仍持有的附件。

从附件菜单选择文件、向输入框粘贴图片，或把文件拖到整个 Citer 面板。拖放提示标明接收的 Topic，不向主对话复制附件。混合粘贴保留图片和文字；发送后的普通文件可下载，图片可在宿主内预览。

在设置中编辑轮盘八个槽位、默认模型、提示词与引用目标，修改后保存。短按右键保留可点击轮盘，Shift + 右键使用原生菜单；方向键、数字 1–8 和 Enter 也可选择。Esc、空槽、来源切换或轮盘失焦取消动作。

## 学习与板书

**学习路线默认关闭。** 单次解释、板书或卡片请求不自动开启教学计划。开启后，模型通过 DSH 待办选择合适的讲解阶段；用户要求的范围、篇幅、工具限制和卡片数量优先。主动回忆也默认关闭，不提供间隔复习、提醒或打卡。

原生 Topic 首答默认提供三条建议追问，可在设置中关闭。用户要求只给结果、严格限制格式或不附建议时，提示词要求省略。点击建议只填入草稿，仍需手动发送。

小黑板只有一个功能入口。板书引用进入草稿附件，公式按数学内容解析。学习卡示例明确区分文字与代码，代码保留语言、缩进和复制按钮；导出保留代码围栏。生成卡片前要求模型核对结论、条件和计算，但自查不能保证正确。

支持视觉输入的模型可通过 `blackboard_view` 查看实际渲染的板书截图，检查遮挡、箭头与布局。切换 Topic 或关闭面板后仍可离屏渲染，但需要 DSH 页面保持连接。截图不包含主对话；沙箱 HTML iframe 暂不能截图，需要视觉检查的图示可使用 SVG。

图像工具由 [Codex Connect](https://github.com/franksong2702/dsh-codex-connect) 等兼容宿主插件提供。图像生成与 `view_image` 分别启用，各 Profile 单独配置。安装提供方本身不会开启这些工具；新的提供方版本需要单独联调。

## 权限、会话与布局

新 Topic 默认**只读**，即使来源会话拥有完全权限。只有用户主动选择其他模式或更改默认值，才允许对应修改；DSH 的审批、沙箱和工具限制继续生效。

Topic 只出现在 Citer 列表。双击标题或按 F2 重命名；归档保留记录，在归档 Topic 中手动发送且被宿主接受后恢复到活动列表。永久删除需要输入完整 Session ID，只删除所属 Topic，不删除主 Session、其他 Topic 或迁移备份。

```text
.dsh/sessions/<workspace>/<sourceSession>/
├── session.v4.jsonl[.zstd]       DSH 管理的主会话
└── citeciter/
    ├── owner.json              来源与目录归属
    ├── <topicNumber>/
    │   ├── topic.json          Topic 信息
    │   ├── draft/              未发送文字、引用与附件
    │   └── sessions/…          Citer 自己的会话日志
    └── migration-backups/      迁移原始副本
```

迁移通过 DSH 公开持久化接口读取和写入，核验日志后才切换索引，并保留原副本。会话格式由 DSH 管理；不手工降级日志，也不改写事件序号或 `seedLength`。遇到不支持的新格式时拒绝有损写入。

宽窗口并排显示来源与 Citer，可调整比例或拖动标题栏悬浮、停靠；窄窗口使用带返回键的独立页面。空间不足时，原生文件详情优先，Citer 暂时收起并保留草稿。布局适配集中在独立模块，未知宿主结构不会强制覆盖主界面。

## 文档与已知边界

通过 Citer 的“…”菜单进入文档阅读，支持 `.txt`、`.md`、`.markdown`。导入上限为 2,000,000 字符，每页最多 500 KiB UTF-8 文本。文档地址与选文是可独立删除的引用；不同文档可加入同一 Topic。

宿主提供可选 `documentPreviews` 服务时，可从原生文件预览进入“CiteCiter 学习”。引用时保存完整快照，后续文件变化不会覆盖它；单个快照上限为 8 MiB / 2,000,000 字符。此阅读功能不提供 PDF 文本提取、Word 解析或 OCR。

来源与文档工具支持分页和明确的续读位置。来源读取使用 `sourceMaxSeq` 判断快照边界，`hasMore` / `nextFromSeq` 决定续读；文档偏移按 UTF-16 计数并返回实际读取区间，见[来源读取修复](https://github.com/kirkchinese/CiteCiter/blob/main/docs/releases/v0.8.2.md)与[文档偏移说明](https://github.com/kirkchinese/CiteCiter/blob/main/docs/compatibility/document-unicode-offsets.md)。空页或预算截断不等于来源不存在。

完整宿主输入组件尚无跨会话嵌入接口，Citer 复用公开会话接口，但不能自动继承所有第三方输入扩展。另一个模型表示赞同、工具调用成功或生成一张卡片，都不能单独证明解释正确。

## 为什么做 CiteCiter

实践通常同时产生两样东西：成果和能力。我们通过尝试、犯错、比较方案和验证，逐渐形成判断。AI 可以接手越来越多的执行，却不会自动把相应的理解交给使用者。任务完成与人的成长，可能因此更容易分离。

AI 也可能降低实践门槛，让更多人做出以前做不了的东西。我们想探索的是：这些新增的实践，如何转化成人的能力？即使把执行交给 Agent，人仍需要提出目标、理解关键条件、判断结果是否适用，并在异常时质疑或接管。

CiteCiter 尝试把真实的 AI 工作过程变成可引用、可追问、可检验的学习材料。用户从眼前的一个疑问出发，理解原理、查看证据，再带着新的认识继续工作。我们希望人在享受 AI 效率的同时，仍能获得理解世界、判断结果和独立行动的机会。

## 下一步与参与

以下是探索方向，**不是已经实现的功能或发布日期承诺**。

- **真实任务试用：** 优先观察用 Agent 完成任务后，难以解释、维护或验收结果的人；记录首次使用阻碍、后续是否回来，以及能否解释一个关键选择。
- **Super 模式：** 研究由用户主动开启、默认关闭的深入核验流程，包括证据对照、反例和小实验；明确额外时间与调用成本。日常模式继续保持轻便，并如实表达不确定性。
- **案例与传播：** 用真实问题制作中英文演示；只有经使用者同意、能够说明依据的收获，才作为案例分享。
- **宿主适配：** 持续核对 DSH 官方扩展接口与官方桌面；其他宿主需求由真实使用反馈决定。

欢迎带一个“Agent 已经完成，但我还讲不清”的任务来[反馈](https://github.com/kirkchinese/CiteCiter/issues)。请说明 DSH 与插件版本、希望理解什么、实际卡在哪里；贴材料前移除密钥、私人对话和其他敏感信息。发现没有帮助的情况同样有价值。

## 开发与验收

[开发规范](https://github.com/kirkchinese/CiteCiter/blob/main/CONTRIBUTING.zh.md) · [产品规则](https://github.com/kirkchinese/CiteCiter/blob/main/docs/product-strategy.zh.md) · [alpha.3 输入修复](https://github.com/kirkchinese/CiteCiter/blob/main/docs/releases/v0.9.0-alpha.3.md)

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm typecheck:desktop
pnpm build
```

Host 与 Client 分别编译；原生会话适配、来源读取、存储、附件、发送队列、板书截图和 UI 独立实现，不修改 DSH Agent Loop。静态检查不能代替功能验收；验收使用真实模型、真实来源分支及实际 UI，安装最终打包产物后记录通过项和限制。不保留人工模型提供者或临时测试脚本。

同作者的 [Claude2DSH](https://github.com/kirkchinese/claude2dsh) 用于迁移和复用 Claude Code 与 DSH 之间的会话及资产；CiteCiter 关注从这些真实工作材料中继续理解与学习。

MIT License.
