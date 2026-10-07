# 2026-10-07 官方 DSH Desktop 兼容验收

当前结论：候选未完成验收，不可据此宣布可发布。官方桌面安装、初次运行可见性、静态检查和候选安装文件一致性已取得证据；最终候选尚待重启，真实模型与界面功能矩阵仍未完成。没有执行本轮 npm 或 GitHub 发布。

## 范围与证据规则

Desktop 仅指 DeepSeek 官方发行版。本轮不接受社区桌面的旧运行记录作为兼容证据，后续不保证社区版可用。Web 目标 SDK 为 `0.2.1-alpha.1`，官方 Desktop 目标为 `0.2.0-rc.2`，两者分别验收。Linux 本轮不验收，不调整 WSL 网络，也不声明新版已通过 Linux 验证。

功能检查使用真实模型和真实来源分支，记录用户操作、界面结果与持久化结果。类型检查、源码审阅、一次性协议断言和安装文件哈希分别列出，不代替最终安装产物上的实际功能观察。问答模块的一次性协议检查没有使用模型提供者，也没有留下测试脚本。

## 安装与候选标识

| 项目 | 当前已核验结果 |
| --- | --- |
| 官方安装器 | [官方固定下载地址](https://download.deepseek.com/desktop/dsh-latest-windows-x64.exe)；ProductVersion `0.2.0-rc.2`；Authenticode 签名有效，发布者为 Hangzhou DeepSeek。 |
| 本机 Desktop | 官方版已安装并实际启动；页面可见 Citer launcher。该可见性观察发生在最终候选重新安装和待重启之前。 |
| 社区应用 | 原本机主要社区桌面应用已卸载；源码中的社区专属兼容分支已移除。 |
| DSH Codex Connect | 已在官方 Desktop 更新至 `0.2.0-alpha.2`；此前实际界面可见真实账号与模型，尚未将其列为最终候选真实模型调用通过。 |
| CiteCiter 候选 | `0.9.0-alpha.4`；最终安装使用带内容哈希的文件名 `citeciter-alpha4-704eba930a5f.tgz`，898,474 字节。 |
| 候选压缩包 SHA-256 | `704EBA930A5F9A31EAB8EF8F8A05C6E097BBC2B26072018ABE8EDFC4546537D9` |
| 已安装与仓库 `lib/index.js` SHA-256 | 两者均为 `C716A0DEB9F0F87711679E9AFC699A0AE6A98A3287D74E9DAB11A7C3C2190B2A`。该证据说明安装文件一致，不代表运行中的进程已经加载新文件。 |
| 已安装与仓库 `lib/client.js` SHA-256 | 两者均为 `7402E9768850E2279EBA2D17F71093200E42B7D4743B6988E3D2EC899048DEC9`；package.json 与两份包级 README 亦逐字节一致。 |

发现并解决一处验收环境问题：反复安装同一路径、同版本的 tarball 时，pnpm 复用了旧包。改用包含最终 SHA-256 前缀的新文件名重新安装后，已安装入口文件与仓库最终构建一致。后续运行验收必须在重启加载该候选之后进行，不沿用重启前的页面作为最终候选证据。

源码工作区的 `pnpm peers check` 无冲突。安装 Profile 的 pnpm 仍提示缺少 Host peer：该 Profile 只安装外部插件，官方运行时另行提供 DSH、Cordis、React 等模块；直接在 Profile 执行 `peers check` 会列出这些未在其 node_modules 内安装的依赖。已将 `dsh-util-values` 也改为宿主 peer，避免给官方 RC 强带 alpha 工具包及其 Cordis 依赖；是否在最终运行进程中全部解析正确，仍须重启和真实功能验收确认，不用源码工作区的检查结果覆盖这一点。

## 已完成的工程检查

| 检查 | 结果与限度 |
| --- | --- |
| 国庆上游接口审计 | 对照官方发布标签、实际安装器和本插件导入接口；见 [审计报告](../compatibility/2026-10-official-desktop-audit.md)。源码结论不等于运行通过。 |
| 主 SDK Host/Client 类型检查 | `0.2.1-alpha.1` 双面通过。 |
| 官方 Desktop Host/Client 类型检查 | `0.2.0-rc.2` 双面通过，旧社区 SDK 不再作为编译门。 |
| 构建、打包与本地安装 | 候选已生成并安装；压缩包和入口文件标识见上表。 |
| 问答协议检查 | 一次性内存检查覆盖隐藏后超时、焦点暂停/续计、首次编辑暂停、晚答状态、混合语言回答保留、legacy 取消、重复同步只建立一个 claim、释放及不可复活、用户晚答恢复归档。不是实际模型或跨进程 Remote 验收。 |
| Git 包结构与 CLI 安装 | pnpm `11.7.0` 完成本地真实 Git 快照安装与导出/Typert 验证；官方 CLI `0.2.0-rc.2` 已在全新隔离 home 中安装并登记 bundle，安装版官方 `loadProfileDirectory` 返回 `skippedBundles=[]`。公开 GitHub 与 Desktop 插件页的安装仍待验收。 |
| 文档 | 四份 README、兼容说明及 X 图文材料已准备；X 素材未对外发布。社区专属文档清理覆盖 74 个文件，删除了仅适用于社区版本的记录；旧证据不计入本轮通过项。 |

## Git 安装验证的具体范围

复现了两个独立问题：旧根包只声明工作区元数据，没有 `dsh.bundle`，从 Git 仓库根安装会变成普通依赖；仅增加 `publishConfig.directory` 后，pnpm `11.7.0` 与 `11.21.0` 的 Git fetcher 仍读取根 manifest，不能自动转到内层包。结论同时对照了 pnpm 实际安装源码。曾尝试的薄 bundle 加嵌套 `file:` 路径依赖没有作为最终方案保留。

最终实现由 `packages/citeciter/package.json` 派生根 Git 入口，直接声明相同包名、版本、依赖及客户端注入，导出和 bundle patch 指向内层受版本控制的构建文件。根目录没有安装构建钩子，不借助已发布 npm 版本。两处 manifest 由 `sync:git-entry` / `check:git-entry` 维护；同名 workspace 的开发命令使用路径，避免按包名筛选导致递归。`dsh-util-values` 改为两基线 peer，各开发 SDK 显式固定自己的版本；工作树 `pnpm peers check` 报告 `No peer dependency issues found`。

安装材料来自本次代码与构建输出建立的真实临时 Git 仓库，以 Git 提交地址安装，而非目录链接或手写模拟包。官方桌面所用 pnpm `11.7.0` 成功安装 `@kirkchinese/dsh-citeciter@0.9.0-alpha.4`，主入口、`/client`、`/typert`、`/remote` 和 bundle patch 均可解析。四个模块入口的 SHA-256 与当时 Git 快照中的源文件一致；补入原仓库 `.gitattributes` 后也排除了本地 Git 的 CRLF 转换差异。实际导入 Typert 后通过已安装官方宿主的 `validateTypertManifest`，七个 schema 工厂可调用、两个 invocation 可识别。将 util-values 归属改为 peer 后，又用新 Git 快照安装核对声明与解析：官方 RC2 宿主解析 `0.2.0-rc.2`，alpha 开发 SDK 解析 `0.2.1-alpha.1`，Typert 验证仍通过。

另以官方 `dsh.cmd` `0.2.0-rc.2` 执行 `plugin --profile web add`，将本地 Git 提交安装到专用隔离 `DSH_HOME`。命令成功退出，Citer 自动加入 `dsh.profile.bundles`；安装版官方 `loadProfileDirectory` 解析基础 bundle、Web bundle 和 Citer bundle，Citer patch 的 `id` 为 `citeciter`、包名为 `@kirkchinese/dsh-citeciter`，没有跳过任何 bundle。此 CLI 使用本机 pnpm `11.21.0`，与前述官方桌面 pnpm `11.7.0` 的独立安装检查分别记录。隔离 home 从未启动，没有模型请求或用户会话。隔离裸包检查故意不自动安装宿主 peers，出现的缺少宿主依赖提示不代表完整运行验收；它们不能与工作树已通过的 peer 检查混为一谈。

根 `pnpm pack` 仍输出内层 npm 结构，包名与版本正确、`private=false`、主入口为 `lib/index.js`、bundle patch 为 `./cordis.patch.yml`，没有把根工作区结构当作 npm 发布包。本地临时 Git 的提交号不是本项目正式提交，不得用作文档安装示例。公开仓库尚未推送修复，README 仅给出带“包含修复的提交或标签”占位符的格式；官方桌面插件页、重启加载、模型调用及其他功能仍按下方待验收矩阵执行。这些包解析证据不适用于其后未经核对的新构建。

本次审计产生的临时目录为 `E:\project\CiteCiter\.refs\git-fetch-audit-20261007`（临时 Git、隔离 consumer、pnpm 工具和 store、未启动的 DSH home、打包摘要），以及 `E:\project\CiteCiter\packages\citeciter\.refs\git-fetch-audit-20261007\npm-artifact`（根 pack 的相对输出路径按内层包解析后生成的审计 tarball）。目录均仅属于本次审计，不含主会话或迁移备份。对第一个目录内临时旧 `lib` 的清理已完成绝对路径和非链接检查，但 `Remove-Item` 被自动审批以 `blocked by policy` 拒绝；未改用其他手段删除，以上审计目录仍待清理。未创建或提交临时测试脚本。

## 当前外部阻塞

最终候选需要重启才能确认实际加载。官方 Desktop 在没有活动会话时进入退出流程，退出确认模态框无法通过当时的 Computer Use 通道完成；用户随后已回复完成退出，并要求重新初始化控制工具。这一手动退出步骤已经完成，不再记为等待用户确认。

收到回复后已重置 `node_repl`，重新初始化 `sky` 并调用 `list_windows`，工具仍返回：`Computer Use was stopped by the user with the physical Escape key. Stop your work, do not call further Computer Use tools in this turn...`。按该结果，本轮停止后续原生控制。此处记录工具的原文，不据此推断是谁实际按下按键或认定电脑重启是根因；也不通过换通道规避停止指令。最终候选的重启加载和真实模型验收因此仍未完成，首次候选的 launcher 可见性不能替代。

本地 `.refs` 内旧社区开发目录的批量清理被自动审批拒绝，仅返回 `blocked by policy`，没有更具体原因；未换用其他工具绕过。主应用卸载与文档清理已经完成，不能据此宣称所有旧开发目录都已删除。主目录、用户会话、迁移备份与素材应继续保留。

## 最终候选待补的真实验收

以下项目均未在当前记录中标为通过。执行后应追加实际宿主版本、具体操作、界面结果、持久化结果及失败原因；此前 alpha 或社区桌面的结果不能自动填入此表。

| 范围 | 待观察的行为 |
| --- | --- |
| 加载与安装 | 重启后确认最终候选被加载；官方插件管理器从 Git 仓库安装及重启加载；Citer 与 Connect 无模块解析或 Remote 挂载错误。 |
| 真实模型与工具 | 普通文字、真实问答、编程、终端、PTC 子调用、图像、教学；思考、参数、结果、失败、取消和附件可见；使用真实账号与模型完成端到端调用。 |
| 输入与草稿 | 中文输入法、英文、数字及混合输入；不再出现保存提示闪烁；Enter、Shift+Enter、Ctrl+Enter；切换来源、刷新、重启、发送失败及发送期间编辑的恢复。 |
| 原生问答 | 默认 blocking 的回答与取消；显式 timed 的超时继续、焦点暂停、首次编辑保持、收起/重开、切换 Topic、晚答、多个问题、显式跳过、停止与断开释放。具体步骤见兼容审计末尾。 |
| 引用与轮盘 | 自由提问仅追加当前同源未归档 Topic；未选中或已归档时新建；其他内置动作默认新建；自定义目标；直接聚焦输入；移除引用后不进入模型上下文。 |
| 会话与权限 | Topic 独立目录、主列表隔离、双击重命名、归档/恢复和删除边界；默认只读；真实审批拒绝与仅允许一次；原主日志与迁移备份完整；归档 Topic 的用户补答恢复活动状态。 |
| 文件与图像 | 加号、整面板拖放与粘贴；主对话不收副本；普通文件/图片分类；损坏附件恢复；下载字节一致；原生预览、长文分页和重启后附件登记。 |
| 教学与绘图 | 学习路线默认关闭；开关行为、首答建议追问、卡片纠错、代码示例格式、板书引用解析、真实截图回看、后台视觉检查及 Connect 图像工具。 |
| 官方桌面与 Web 布局 | 官方标题栏避让；宽屏、窄屏独立页面与返回、最大比例、原生详情优先、悬浮拖动/停靠、关闭重开和缩放；Web alpha 的底部 slot 单独检查。 |
| 性能与组合 | 连续创建 Topic 的首次/重复耗时；长历史、多附件；生成中切换/归档；重复请求、监听器/claim 残留及卡顿检查。 |

## 发布状态

本记录对应候选准备阶段。只有最终安装产物的必测项全部完成、产品缺陷处理完毕并核对发布材料后，才重新判断是否具备发布条件。当前不执行发布，不把未观察的功能记为通过。
