# CiteCiter

[English](README.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues)

> **0.8.0 已弃用。** Linux 通过符号链接启动 DSH 时，可能无法创建或恢复 Topic，报找不到 `@deepseek-ai/dsh-agent-loop`。请升级到 [0.8.1](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.8.1)。

CiteCiter 为 DeepSeek Harness 提供带来源引用的独立工作区。可从主对话、工具结果和文档建立 Topic，处理文字、编程、图像和学习任务。新 Topic 使用 DSH 原生会话、权限、模型、附件与消息队列，来源对话继续独立工作。

![Citer 原生工作区与手动发送流程示意](https://raw.githubusercontent.com/kirkchinese/CiteCiter/v0.8.1/assets/docs/native-workspace.svg)

上图为交互示意，非运行截图。选文动作只准备草稿；模型在用户发送后开始回答。

## 版本与安装

当前版本为 **0.8.1**。兼容基线为 DSH `0.1.5-rc.1`、[DSH Desktop](https://github.com/anywhere-labs/dsh-desktop) `2.0.9`；Node.js `^22.19.0 || >=24.0.0`。本轮 Windows 验收使用 Node 24.19.0。DSH 的 next、alpha 和 TUI 属于其他目标。

| 版本 | 状态 | 主要差异 |
| --- | --- | --- |
| 0.8.1 | 当前版本 | 修复 Linux/macOS 符号链接启动时无法打开 Topic |
| 0.8.0 | 已弃用，请升级 0.8.1 | Linux 符号链接启动错误会阻止 Topic 打开 |
| 0.7.0-beta.3 | 前一开发候选版 | 私有只读 Topic、选文轮盘、手动五阶段学习 |
| 0.6.0 | 已发布 | DSH 0.1.2-rc.1 / Desktop 2.0.5 基线 |

更新主机 CLI，然后安装已发布包：

```powershell
npm install -g @deepseek-ai/dsh@latest
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.8.1
dsh web
```

此命令安装 0.8.1。旧宿主 DSH 0.1.2-rc.1 / Desktop 2.0.5 应继续使用 @kirkchinese/dsh-citeciter@0.6.0。如 npm 提示本地原生依赖的安装脚本被阻止，按 npm 输出对明确列出的依赖放行后重装。不要通过全局关闭脚本限制解决。

0.8.0 在 Linux/macOS 通过符号链接启动 DSH 时，可能无法打开 Topic，报找不到 dsh-agent-loop。0.8.1 先解析 CLI 入口真实路径再加载宿主模块，保留 Desktop 的 app.asar 路径。Linux 原生 Node 回归已通过，macOS 尚未实测。

本地构建并安装此分支：

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm --dir packages/citeciter pack --pack-destination E:/project/CiteCiter/.refs/artifacts
dsh plugin --profile web add E:/project/CiteCiter/.refs/artifacts/kirkchinese-dsh-citeciter-0.8.1.tgz
```

Desktop 使用自己的内置 DSH。在其管理终端执行 `dsh plugin add @kirkchinese/dsh-citeciter@0.8.1` 升级插件，也可传入本地安装包绝对路径；全局 CLI 更新不会更新 Desktop 内置运行时。安装后重启相应宿主。同一 DSH home 不要同时运行 Web 和 Desktop 写入进程。

## 草稿与引用

1. 在主对话选中文字，按住右键打开八槽轮盘，移向动作后松开。也可从工具结果、文档阅读器或原生文件预览创建 Topic。
2. Citer 打开独立草稿。来源对话地址、来源文档地址及选中文段显示为附件。文档附件显示文件名，展开查看原始路径和快照地址。点击 × 移除；附件菜单可重新添加来源或选文。
3. 检查问题、引用、权限和模型，点击发送或按 Enter。Shift + Enter 换行；输入法组词期间 Enter 不发送。

创建 Topic、选择轮盘动作、切换模型、引用板书均不调用模型。需要补充问题的轮盘动作先打开输入框和模型选择；无需补充的动作填入预设问题，仍需手动发送。模式提示词和发送时的引用内容写入当前 Topic 的原生日志。

未发送的来源附件被删除后，来源读取工具会拒绝读取该来源；新 Topic 不隐式复制来源历史。已经发送的附件属于历史消息，删除后续草稿中的副本不会撤回历史上下文。草稿在关闭/重开学习栏、切换 Topic 和窗口失焦时保留；刷新或退出客户端不保留未发送草稿和本地附件。

## 权限、输入与队列

新 Topic 默认 **只读**，即使来源会话具有完全权限。输入框的权限菜单使用 DSH 的只读、工作区内修改、完全权限模式。只有用户主动选择模式或更改新 Topic 默认值后，才允许相应修改。DSH 审批、沙箱和工具限制继续生效；插件不绕过权限服务。

输入框从左到右为附件、权限模式、模型与思考强度、发送。模型菜单先选模型，再选该模型支持的思考强度。图片和普通文件通过 DSH 原生附件服务发送，文件显示上传状态，失败可重试。可从附件菜单选择文件，在输入框粘贴图片，或拖入 Citer 面板。拖放提示显示接收的 Topic，松开只向该 Topic 添加附件；没有可用 Topic 时不接收。主对话不会收到拖入 Citer 的副本。混合粘贴时同时保留图片与文字。已发送文件显示下载图标与文件名，点击保存原附件；用户消息不显示角色标签。宿主拒收时显示原因并保留草稿；宿主已接收的消息不会因后续状态读取失败而重新留在输入框。

回答运行时，Enter 和发送按钮跟随 DSH 设置中的“繁忙时的发送行为”；Ctrl + Enter 临时使用另一种方式。排队在当前轮结束后处理，插话由 DSH 在当前轮的下一步接收。输入区的切换按钮只覆盖当前 Topic，不改写宿主默认值。队列显示待处理内容，可移除或转为插话。停止结束当前回答并保留已生成内容；待处理队列继续遵循 DSH 规则。

新 Topic 可使用标准编程工具，操作范围由 DSH 权限决定。旧版记录迁入来源目录后仍保留原有对话和权限。迁移会逐条核验日志；无法核验的记录保留原存储并报告，不自动扩大权限。

DSH 工具审批、补充问题和计划确认显示在对应 Topic 中，决定交回宿主原生交互处理。审批卡保留工具名称、理由及关联参数供查看。

模型返回的思考内容显示为可展开的“思考”行；生成思考而尚无正文时显示“思考中”。折叠状态保留一行预览，展开后显示完整 Markdown。未返回思考内容的模型不显示空行。

## 学习、板书与图片

“学习路线”默认关闭。开启后，用户发送问题时要求模型通过 DSH `todo_write` 自行选择、排列和更新学习计划。可用方式包括底层逻辑、定性分析、定量板书、概念关联和总结卡片；模型按内容取舍，无需逐个点击阶段。

小黑板统一显示在主区“小黑板”标签。支持文本、Markdown、公式、表格、SVG、图片和隔离 HTML。板书引用进入草稿附件，公式渲染为数学内容，不显示原始对象字段。学习卡在 Citer 的“学习卡”视图查看、导出和修订。

`blackboard_view` 把浏览器真实渲染的 PNG 返回给支持视觉输入的模型。模型可检查遮挡、标签、箭头和布局后继续修改板书。截图仅包含板书，不包含主对话或窗口布局；标签关闭或窄屏隐藏板书时，使用相同组件按 1000×680 离屏渲染。需保持 Citer 打开。SVG 保留原始颜色，Markdown 代码使用适合深色板书的背景。沙箱 HTML iframe 暂不支持截图，需改用 SVG 才能进行此视觉检查。

如果宿主已安装并启用 [dsh-codex-connect](https://github.com/franksong2702/dsh-codex-connect) 的图片工具，新 Topic 可直接使用 `codex_connect_image_generate` 和 `view_image`；Citer 不要求该插件，也不代替其账户配置。本轮已验证连接插件 `0.1.0-alpha.4.34` 生成并查看真实图片。

请求总结卡片时，模型先核对定义、条件、推导、数值及前后矛盾，再保存完整卡片组；无法核实的内容应标明或省略。自查不能保证知识正确，验收中已发现并纠正模型错误，见[验收记录](../../docs/validation/2026-09-12-native-real-model.md)。主动回忆默认关闭，可在卡片中开启；不提供间隔复习、提醒或打卡。

## Topic 与布局

点击列表图标浏览、搜索并切换当前来源的 Topic；＋建立空 Topic。双击标题或按 F2 重命名，Enter/失焦保存，Esc 取消。归档用于隐藏并保留记录，可从归档列表恢复。永久删除要求输入完整 Session ID，只删除 Citer 自己维护的 Topic 目录；删除前停止并释放该 Topic，拒绝符号链接及越界路径。主 Session 不删除。

宽窗口并排显示来源和 Citer，可拖动分隔线调整比例。拖动标题栏离开侧边后变为悬浮窗；拖回窗口右缘释放后停靠。空间不足时，Citer 占据主内容区并显示左上角返回键；返回后释放主对话。窄屏不把学习栏放到下方。关闭面板后恢复宿主空间；原生详情面板和 Desktop 标题栏保留。

菜单和面板使用半透明背景、背景模糊与短动效，支持宿主主题和系统减少动态效果设置。布局适配集中在独立模块中，未知宿主结构不会强制覆盖主界面。

## 会话存储与迁移

Citer 的 Topic 只出现在 Citer 列表。DSH 的会话磁盘索引不递归扫描 Topic 子目录；插件独立维护实时成员和导航，原生发送服务按身份访问当前 Topic。

```text
.dsh/sessions/<工作区>/<主Session>/
├── session.v3.jsonl[.zstd]       主会话，由 DSH 管理
└── citeciter/
    ├── owner.json              来源与目录归属
    ├── <Topic编号>/
    │   ├── topic.json          标题、归档状态、模型和来源
    │   └── sessions/<工作区>/<CiterSession>/session.v3.jsonl
    └── migration-backups/      已核验旧副本的备份
```

新建、归档、恢复和删除均由 Citer 管理。归档保留全文；删除不影响其他 Topic、主 Session 或迁移备份。迁移使用 DSH 公开持久化接口读取和写入，核验头部和全部事件后才切换索引；旧副本保留，清除主列表重复入口时需明确确认移动范围。

## 文档与原生预览

Citer 打开时，从右上角“…” → “文档阅读”进入阅读器；关闭 Citer 后保留独立读书入口，避免悬浮按钮遮挡输入区。

点击 📖 导入 `.txt`、`.md`、`.markdown`。阅读器保存全文，每页最多 500 KiB UTF-8 文本，导入最多 2,000,000 字符。翻页清除旧选区、保留问题；选文并准备草稿后自动收起阅读器。文档地址和选文分别作为待发送附件，可独立删除。

安装了可选 documentPreviews 服务时，在原生文件预览中选择“CiteCiter 学习”。宿主读取文件，Citer 提供可选取的源文本、分页与引用；创建 Topic 时保存完整快照，文件之后的变化不会改写该快照。单个快照最多 8 MiB / 2,000,000 字符，必须携带来源 Session 地址。

该服务的公开类型基线为解析后的子包 `0.1.5-rc.2`；仅查看 DSH 顶层版本不足以判断能力。缺少服务时，对话轮盘与独立阅读器仍可用。学习查看方式不提供 PDF 文本层、Word 解析或 OCR。

## 轮盘设置

在“设置 → CiteCiter”选择触发键、默认模型和八个槽位。默认槽位为自由提问、解释这段、找错误、翻译、定量板书、总结卡片、两个空槽；每槽可设置提示词、是否先补充问题、内容方式及默认位置。槽位更改需点击保存。

右键短按保留可点击轮盘，Shift + 右键使用原生菜单；可用方向键、数字 1–8 和 Enter 选择。中心、空槽、轮盘外、Esc、来源切换或轮盘失焦取消动作。补充问题输入框在应用失焦时保留，主动关闭或切换来源才取消。

## 开发与验收

[开发规范](../../CONTRIBUTING.zh.md) · [0.8.1 修复说明](../../docs/releases/v0.8.1.md) · [真实模型验收](../../docs/validation/2026-09-12-native-real-model.md)

Host 和 Client 分别编译。原生会话适配、来源读取、索引存储、附件、发送队列、板书截图、学习计划和 UI 控件独立实现；不修改 DSH Agent Loop。完整宿主输入组件尚无跨会话嵌入接口，Citer 通过公开 ConversationController / SessionFace 复用行为，不能自动继承所有第三方输入区扩展。

当前分支已移除人工模型提供者、测试目录与临时验收脚本，保留 Git 历史。CI 进行锁文件、类型、构建和打包检查。功能验收使用真实模型、真实来源分支及实际 UI，覆盖情况与未完成项以验收记录为准。

MIT License.
