# 2026 年国庆 DSH 官方版本兼容审计

审计日期：2026-10-07（Asia/Shanghai）。本记录区分源码审计、静态编译与安装产物的实际验收；以下源码结论不代表界面或真实模型验收通过。今后的 Desktop 支持对象仅为 DeepSeek 官方桌面版，社区桌面版不作为本轮或后续兼容证据，也不保证可用。

## 核实的上游基线

| 对象 | 核实结果 | 一手来源 |
| --- | --- | --- |
| npm 默认发布通道 | `@deepseek-ai/dsh` 的 `latest` / `next` 为 `0.2.0-rc.2` | npm 官方 registry 元数据 |
| npm alpha 与最新 GitHub 发布 | `0.2.1-alpha.1`，2026-10-03 发布，源码提交 `5badb15009ae1756c3afe0ae0cef1faafc290ccc` | [官方 release](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-alpha.1) |
| 前一个 RC | `0.2.0-rc.2`，2026-09-29 发布，发布标签提交 `639ed01` | [官方 release](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.0-rc.2) |
| 官方 Windows 安装器 | 官方固定 URL 返回 HTTP 200，289,313,640 字节，Last-Modified `2026-09-29T10:48:26Z`；实际下载的 ProductVersion 为 `0.2.0-rc.2`，Authenticode 发布者为 Hangzhou DeepSeek 且签名有效 | [官方安装器](https://download.deepseek.com/desktop/dsh-latest-windows-x64.exe)、[分发规则](https://github.com/deepseek-ai/deepseek-harness/blob/5badb15009ae1756c3afe0ae0cef1faafc290ccc/apps/desktop/README.md) |

源码 `master` 在本次读取时等于 `dsh-v0.2.1-alpha.1`。官方安装器与 npm alpha 的发布节奏不同，不用源码中的桌面 package version 推断实际安装器版本。官方仓库的 GitHub release 本次没有 Windows 安装资产；不以其他 GitHub 组织的桌面 release 替代官方安装器。

## 审计方法与范围

枚举 CiteCiter `packages/citeciter/src/` 中所有 `@deepseek-ai/*` 导入，将这些包的源码与上次 SDK 基线 `dsh-v0.1.7-rc.2` 至 `dsh-v0.2.1-alpha.1` 的完整本地 Git diff 对照，而非只依赖 GitHub compare 的文件上限。另检查间接消费的插件管理、文件上传、Desktop 启动和布局代码。版本区间含 2026-09-28 的 `0.2.0-rc.1`，避免遗漏国庆前夕合入、国庆期间实际进入安装器的改变。

## 需适配与重点回归项

| 优先级 | 上游变化与定位 | 对 CiteCiter 的影响及处理 |
| --- | --- | --- |
| 必修 | `0.2.0-rc.2` / `0.2.1-alpha.1` 与 alpha 的 Cordis `4.0.5-alpha.1`、Schemastery `3.18.5-alpha.1` 已发布 | 原 `peerDependencies` 只枚举到 DSH `0.1.7-rc.2`，不能据此声称官方新桌面可装。分别设立官方 Desktop RC 和最新 alpha 编译基线；安装检查必须与打包元数据一致。 |
| 必修 | [timed questions](https://github.com/deepseek-ai/deepseek-harness/commit/3a296b16b400ad2125476464f21d3d15678788f0)；`packages/client/ui-user-questions/src/client/contract/slots.ts` | 原生 `PendingQuestion.cancel()` 改为 `dismiss()`，而发布的 CiteCiter `NativeInteraction.tsx` 调用旧方法。关闭行为不能依赖旧函数；需要区分新版的隐藏与取消语义。 |
| 必查 | 同一问答修改及 [late reply recovery](https://github.com/deepseek-ai/deepseek-harness/commit/fc30c5a7d2567c7dc38be335af39cfedf4fd7fdc)；`ui-user-questions/src/client/index.ts` 的 `publishContinuedQuestions` | 新版可选 timed 问答在超时后继续运行，原生卡片通过 Session 列表与投影恢复晚答。Citer 会话刻意不进入主列表，因此不能直接假定晚答路径覆盖 Citer。需验证实时回答、输入中暂停倒计时、超时后晚答、关闭/重开；继续保持主列表隔离。默认 `tool-ask-user` 仍为 `legacy` 阻塞模式。 |
| 必修 | [official overlay clearance](https://github.com/deepseek-ai/deepseek-harness/commit/3adf56129575243e3c227e8b5fa612218a4814a1)；`ui-layout/src/client/AppFrame.module.css` | 官方 Windows 使用根元素 `data-windows-titlebar`、frame padding 和 `--dsh-frame-chrome-top`，不使用旧社区桌面的 caption row 类名。布局适配应跟随官方属性，覆盖普通/全屏、窄窗、浮窗与标题栏避让。 |
| 必查 | [root bottom slot](https://github.com/deepseek-ai/deepseek-harness/commit/88341c2a9f0af8c232e1c2a46a7dd317128c1811)；`ui-layout/src/client/AppFrame.tsx`、`.module.css` | alpha 新增 `data-shell-bottom` / `shell.bottom`，grid rows 为 `minmax(0, 1fr) auto`。Citer 对 frame 的列/行占位不能覆盖底部功能；宿主详情优先和关闭后恢复原样需实测。 |
| 必查 | `apps/desktop/src/host-process.ts` 与 `apps/desktop-host/src/index.ts` | 官方 Host 入口是 runtime 中的 `node_modules/@deepseek-ai/dsh-desktop-host/lib/index.js`，启动器显式把 runtime 目录传给 Host；Electron shell 的 app.asar 与 Host runtime 分离。旧 `host-agent-modules.ts` 从 `resources/app{.asar}/package.json` 解析不能当作官方适配证据，应从实际 Host 入口解析并核对模块身份。 |
| 必查 | [tool argument preparation](https://github.com/deepseek-ai/deepseek-harness/commit/2ba4144a7e904f1179a505ba04e567246633f923)；`ui-conversation/src/client/contract/records.ts`、`ui-tool/src/client/contract/slots.ts` | 新版 `ToolCallBlock`、`ToolResultNode` 增加懒读取 `ToolArgs`，移除工具 slot 的旧 partial hook；重建这些原生对象的扩展必须适配。Citer 当前工具行使用自己的 `TopicMessage`，仍应回归准备中参数、普通 shell 输出、PTC 子调用、取消与错误。 |
| 必查 | [tool expansion correction](https://github.com/deepseek-ai/deepseek-harness/commit/fce0a41da8)；`ui-tool/src/client/tool/models/terminal-card-model.ts`、`diff-card-model.ts` | 上游修复了 Host 接受的 escalation 字段在 Client 再次校验时令工具卡无法展开的问题。Citer 不应恢复这种过度校验；需在当前最终候选包上实看参数和输出。 |
| 必查 | `core/session/src/repair.ts`、`core/agent-loop/src/agent.ts` | 新版在工具调度异常时追加保守的未知结果以修复会话可继续性。沿用原生 Agent Loop；遇到结果未知不能自行重试有副作用的操作。 |
| 必查 | [structured drafts](https://github.com/deepseek-ai/deepseek-harness/commit/e400349e3a)；`ui-conversation/src/client/contract/slots.ts`、`views.ts` | `bindDraftMirror(text)` 改为 `bindDraftPersistence(DraftSnapshot)`，宿主 draft 由 string 扩展为结构化引用。Citer 自有草稿控制器未调用这两个绑定入口，原生 `sendSession` / `createDrafts` 仍在；需要真实验证中英文输入、文件/引用保存与恢复，不能把宿主新草稿格式手工写入 Citer 日志。 |
| 必查 | `packages/client/file-upload/src/index.ts` | 文件上传 receipt 现在按确切 Session 身份持有，移除了旧的 Agent-scope assert；API 参数不变。Citer 自有 Session 要验证文件与图片上传、发送、未发送删除、恢复重新登记和无跨 Topic receipt 复用。 |
| 必查 | [runtime resolution](https://github.com/deepseek-ai/deepseek-harness/commit/abf8b760eccb680b230f3605af150bdcb0669f9b)；`boot/plugin-manager`、`boot/app-boot` | alpha 修复启用新 bundle 后缺少解析映射与卸载残留映射。替换已安装包仍需要重启。Git 仓库安装必须独立核实根 manifest、打包入口、补丁路径、依赖映射与重启后的真实加载，不能仅以 git clone 成功判定。 |

## 对照后未发现需重写的接口

在上述区间，Citer 导入的 `session-persistence-jsonl`、`session-query`、`sandbox-policy`、`attachment`、`settings`、`api-settings-controller`、`commands`、`subprocess`、`fs`、`session-title`、`session-projection`、`client-store`、`ui-session`、`ui-approval`、`typert-protocol`、`typert-registry` 的主要 `src` 没有非 invariant 修改。原生 Agent create/resume、Session flush、附件引用和权限策略接口仍在。此结论用于减少无依据重构，不替代运行时验收。

上游移除 invariant 诊断插件（[`f028f25667`](https://github.com/deepseek-ai/deepseek-harness/commit/f028f25667)）及 composer `stats` 拆为 `activity` / `usage`（[`21900828662167677eef493486394f7f1f564e40`](https://github.com/deepseek-ai/deepseek-harness/commit/21900828662167677eef493486394f7f1f564e40)）。当前 Citer 源码不导入 `./invariant`，也未替换原 `stats` slot，因此不能把这些发布说明中的破坏性变更一律认作本插件故障。

上游子路径显示元数据改用对应子路径导出（[`8339f16c1d`](https://github.com/deepseek-ai/deepseek-harness/commit/8339f16c1d)）。Citer 的 bundle 根与 client entry 应按其实际注册方式检查显示名称、图标和说明；不能为已废除的独立子路径 package.json 继续添加兼容分支。

## 数据与发布边界

`dsh-v0.1.7-rc.2` 与 `dsh-v0.2.1-alpha.1` 标签中 `packages/core/session/src/types.ts` 的 `SESSION_FORMAT_VERSION` 均为 4。上游 `docs/session-format-status.md` 的 release record 仍记录 v3，不能用这段落后的记录声称已发布标签中的 v4 尚未发布。Citer 继续由原生 persistence 读写，保留自身的新格式降级阻止检查，不手工转换宿主日志。

本次查到的 RC2 PowerShell 修复涉及完成状态行尾空格、退出码与内部标记；源码 `packages/shell/pwsh-local/src/index.ts` 仍含无条件 `UTF8Encoding` 初始化。它不证明用户此前接受的受限语言环境编码问题已修复；应分别记录真实回归结果。

Git 安装、实际官方桌面运行、最新 alpha Web、真实模型、附件、布局、权限与重启恢复的最终结论由本轮验收记录补充。此审计不发布 npm 或 GitHub release，不把社区桌面的旧验收记录计入任何通过项。

## 本轮问答适配实现与证据边界

`NativeInteraction` 已使用官方 `dismiss()`，并把原生 carrier 的倒计时、焦点、首次编辑和只读 review 状态传给展示组件。普通阻塞问答继续由用户提交或取消，不把限时模式设为默认。`QuestionCard` 展示题目 `detail`，命名的限时工具问题支持用户显式跳过，跳过仍产生完整答案批次中的空答案条目；不把超时当成跳过或授权。

Citer 已有的私有 `user-questions/request` 接管路径保留，现在携带 `request.wait` 和稳定 call identity。独立 `topic-questions.ts` 从该 owned Agent 的原生 `userQuestions` projection 读取 continued 问题，过滤其 Inbox 内已排队的回答；晚答调用该 Agent 的公开 `userQuestions.answer()`，由宿主创建、排队与记录回复。既不把 Topic 发布到主 Session 列表，也不补写宿主日志。

`TopicQuestionController` 经公开 `remote.userQuestions.attachWait()` 接收 Host 剩余时长，在 Client 会话服务寿命内持有 claim 和倒计时：隐藏或换 Topic 不会销毁计时器；输入区焦点暂停尚未编辑的倒计时，失焦续计，首次编辑或“等我回答”停止本 Client 的前台倒计时。客户端断开、插件释放、宿主结束 stream 或已确认的 Topic 删除均释放计时与 claim。没有 Client 接手时，Host 仍按其原始 deadline 继续。`timeout-question` 仅结束同一 key 且明确 timed 的请求，过期计时器不能取消后来创建的阻塞请求。

2026-10-07 静态检查：主 SDK `0.2.1-alpha.1` 的 Host/Client typecheck 与官方 Desktop SDK `0.2.0-rc.2` 的双面 typecheck 均通过。一次性、未落盘的控制器协议断言覆盖隐藏后超时、continued 晚答、焦点暂停/恢复、首次编辑暂停、收起重开保留中英文回答、legacy 取消。该检查没有模型调用，不计入真实模型验收。需要在最终安装产物中继续核对公开 claim 的跨进程路由与下列真实操作。

| 真实验收场景 | 操作与必须观察的结果 |
| --- | --- |
| 默认阻塞模式 | 真实模型调用 `ask_user_question`；卡片无自动超时；中文、英文与数字可编辑；回答后原生工具结果可见，取消后模型收到取消。 |
| 显式 timed 模式 | 在 DSH 原生 `tool-ask-user` 配置选择 `mode: timed`，让真实模型使用 `timeout: 5`；未交互时返回 pending 并继续，卡片可补答。测试后恢复用户原配置。 |
| 焦点与编辑 | timed 请求输入区获得焦点后超过原时限仍等候；未编辑直接失焦后按剩余时长继续；首次输入后失焦不丢稿、不自动超时。 |
| 隐藏与切换 | 收起卡片、切换 Topic、关闭 Citer 均不能让未编辑的 timed 请求永远等候；重新打开可回答 continued 问题。已编辑回答在本次客户端生命周期内保留。 |
| 多问题与晚答 | 多个 continued 问题可分别打开；晚答只能写入原 Topic，已排队回复不重复显示；显式跳过保留问题 id 与空 selected，不等同于用户授权。 |
| 断开、停止与删除 | Host/Client 断开后恢复，原等待不被遗留 claim 卡住；停止后的过期 timeout 不影响新问题；删除已授权的验收 Topic 后无计时器或 remote claim 残留。 |

问答草稿在本次 Client 生命周期内由独立控制器保留；本次未扩展为跨重启的独立问答草稿文件，也不以普通消息草稿的持久化验收代替这一点。已超时问题及已提交回答的恢复仍依据宿主原生会话投影与日志。

收尾复核补充了已归档 Topic 的晚答：宿主 `user-question-reply` 与普通用户消息一样触发自动恢复，工具结果和单纯超时不触发。一轮未落盘的生命周期断言确认重复同步只建立一个 claim、释放会同时中止 signal 与 stream、已销毁控制器不能重新接管，及上述归档触发边界。`remote.userQuestions` 由 `@deepseek-ai/dsh-api-remotes/client` 装配，Citer Client 的包级依赖需显式注入该装配包；类型导入或单独注入 UI 组件不能代替 Remote 挂载。
