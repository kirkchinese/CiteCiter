# 0.9.0-alpha.3 → alpha.4 回归对比与复审入口

## 结论与版本

Windows 范围的最后功能补测通过，可以交给 Claude 进行独立复审。本轮旧数据恢复、真实文档追问、消息投影差异检查和静态检查通过，没有在已测范围内发现 alpha.4 丢失 alpha.3 功能。用户完成真实文件拖放和 Edge 150% / 200% 缩放并明确确认通过；附件字节、草稿恢复、主对话无副本，以及临时预设卸载后的冷启动和真实问答均已核对。尚有被自动审批阻止的本地残余目录删除，以及已隔离的宿主原生草稿跨版本浏览器存储问题；两者不写成插件已修复或本机已清理完毕。按用户最新安排，本轮没有发布 Release/npm。

对比基线是上一默认发布版本 [v0.9.0-alpha.3](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.9.0-alpha.3)，提交 `d22560447ede0e9452a3de2dad43413ed3812b0d`。仓库没有名为 v0.9.0 的正式版标签，不将预发布号改称正式稳定版。当前分支 `codex/official-desktop-october`，本轮开始时 HEAD 为 `1d72fda`，运行代码来自 `cfcdac8befc9e140d95d79f1fb45effe47372cf1`；本轮只补充文档，没有修改运行代码或依赖。

候选包为 `.refs/artifacts/release-docs-20261009/kirkchinese-dsh-citeciter-0.9.0-alpha.4.tgz`，933,913 字节、163 文件，SHA-256 `2DC7E02A361B5E3D5423376D22DFCCCFA4B5DB9B2F6003D136DE2C19DB23B1E9`。旧版本数据对比时，主目录仅由官方 Desktop Host `0.2.0-rc.2` 持有，Connect 为 `0.2.0-alpha.2`；该阶段的辅助浏览器不作为独立 Web 验收证据。最后的 Edge 缩放由另一个时段运行的独立 Web `0.2.1-alpha.1`（3080）承载，随后停止它再启动官方 Desktop，未并行写入主目录。结束时只运行官方 Desktop。独立 Web 的其余已测项目见[完整记录](2026-10-09-draft-merge.md)。不恢复社区桌面支持或其旧验收结论。

## 对比范围

| 范围 | alpha.3 的行为与 alpha.4 的变化 | 本轮判断 |
| --- | --- | --- |
| 手动发送、默认只读、来源隔离 | 保持；创建、恢复与追加引用不启动模型 | 旧草稿刷新没有发送；旧 Topic 的手动追问只写入自己的日志 |
| 普通消息、思考、工具、PTC、附件 | 保持原始内容；新增结构化取消、拒绝与问题补答展示 | 旧日志的调用结果解析与完整消息投影一致，实际旧图片和代码卡正常 |
| 输入与多窗口草稿 | 保持同步输入、异步保存；冲突改为自动合并，重叠处以操作窗口为准 | 3,011 条纯合并断言通过；旧 alpha.3 草稿逐字符恢复，既有真实 IME 结果另列 |
| 问题卡 | 新增答案持久化、重启补答及官方 timed/continued 支持 | 属于用户确认的新功能，复审须关注精确问题身份、终态和重复提交边界 |
| 归档与删除 | 保持独立目录；补齐接收后恢复与删除回执，阻止晚到读取复建 | 属于明确修复，之前的真实并发删除与重启证据见完整记录 |
| 轮盘与板书 | 保持自由提问的活动 Topic 追加规则；修复重开聚焦、板书文字和跨刷新引用身份 | 用户已确认的行为保持；当前运行包的实际证据见完整记录 |
| 宿主适配 | 改用宿主 peer 路由，适配官方 Desktop、现代设置和图像预览；移除社区兼容分支 | 有意改变支持范围，不把已移除的社区兼容视为意外回归 |

从 alpha.3 至当前共有 52 个源文件发生变化。此次逐项核对了普通草稿控制器与合并、原生提交边界、Topic admission/删除串行化、问题卡持久化和恢复、工具事件、宿主 peer 加载及 UI 适配。此为定向差异审查，不等同于独立审查者已逐行批准所有改动。

## 旧数据与真实界面

使用既有来源“项目接手前调研”，Source Session 为 `session-790558c2-364a-42b0-b920-83003a587336`，其 Citer 目录已有 24 个 Topic。没有导入人工模型、虚构对话或为了通过测试重写旧日志。以下均是当前官方 Host 的辅助浏览器观察；原生窗口结果单列。

| 旧 Topic | 实际操作与结果 |
| --- | --- |
| 24 / `citeciter-ed659b0d-db4d-426c-96c3-052111b4e0b2` | 9 月 28 日 alpha.3 输入验收 Topic。恢复 revision 114 的中英文、符号和两行草稿，刷新后逐字符相同，原来的两条用户消息未增加；未修改或发送该草稿。 |
| 4 / `citeciter-da401eec-0150-4190-aa2a-f162580d33e6` | 旧 README 下载入口及两份 video-cover 图片显示，打开其中一张实际图片、确认封面后关闭。这里没有重新宣称下载落盘；当前包的官方下载字节检查在完整记录中。 |
| 5 / `citeciter-f10e1480-0579-4b7d-a63d-f66811091003` | 39 个工具入口包含 run_code/read/write/pwsh/learning_cards；旧学习卡可打开，六行 HTML 示例按代码保留注释与缩进，未当作 HTML 执行。 |
| 12 / `citeciter-aefed181-4b1f-4f66-99d8-09274edd82a8` | 用当前真实 DeepSeek-V41-Flash 手动提交一条读取旧引用文档的请求。read_document seq 138/139 返回原 documentId、UTF-16 总长 8225、范围 0–64、nextFromOffset=64；seq 142 回答标题 CiteCiter，seq 144 completed。草稿 revision 23 为空、pending=null，没有读取来源或项目文件的调用。 |

界面证明保存在忽略目录 `.refs/alpha3-old-attachment-20261009.png` 和 `.refs/alpha3-old-document-reply-20261009.png`，没有把截图或会话数据放入仓库和 npm 包。

对这份来源及其 Citer 已有 73 个文件保存了读取前摘要；读取时点在首次打开来源与 Topic 2 之后，不冒充更早的原始快照。结束时没有已有文件丢失，66 个文件字节不变。7 个变化文件全部属于 Topic 4、5、12：4/5 的日志仅追加原生 session/end-seed，12 增加本次真实回合与接纳后的空草稿，其余为三者的更新时间。三个变化日志的旧字节前缀均完整保留；Topic 24 草稿与日志未变。来源的 v3/v4 压缩日志分别仍为 SHA-256 `6169A6F3A0661A4E2DDAF6D1A15999747C04C17D8D1D0BD3872AF30C93B0EF85` / `F2C7CE295C4BEB7DB17B6B2BFAA92F2A7AC1295FF0DE2049ECD8FDFF35538FEA`。另一份十月官方验收来源的主日志仍为 `ECB7FE6CAA620CFE34ABFE661C52498C656A2FA0DB1F65DC68D4678809ACF6C5`。

## 真实日志差异与构建

临时内联检查从 Git 读取 alpha.3 的 tool-events 实现，并与当前实现读取同批实际日志：24 份日志、当时共 1,508 个事件、120 个工具调用、120 个结果（含 28 个 PTC 结果），在排除新增可选结构化结果字段后完全一致。没有运行人工 LLM，也没有保留测试脚本。

随后以读取前快照限定各日志的旧字节前缀，提取 alpha.3 和当前 topicMessages/textBlocks/toolResultText 的实际函数体进行差异执行；调用公共的真实流装配器和投影辅助函数。24 份日志共 1,464 个旧事件，得到 413 条显示记录，其中 80 条含思考、27 个附件引用。所有记录、文本、参数、结果、附件、顺序和最终错误状态完全一致；此次没有需要排除的新增状态字段。两组事件总数不同源于第二组只读取固定快照前缀，不把后续操作产生的记录混入旧版本对比。此检查验证投影数据，不能代替浏览器布局或真实输入法检查。

本轮另执行了 3,011 条纯合并断言，包含独立段落、中英文与 Unicode、重叠编辑的操作窗口优先、单边变更、幂等性、引用删除、独立附件保留、互斥问题答案和当前问题页；没有新增测试文件。

`pnpm typecheck`、`pnpm typecheck:desktop`、`pnpm build`（含 Git 入口检查）、`pnpm peers check`、`git diff --check` 均通过。重建没有产生 lib 差异。重新比对安装文件：Web profile 的 163 个包文件、官方 Desktop Git 入口下的 158 个 lib 文件、工作区的 158 个 lib 文件全部与候选 manifest 一致。Client SHA-256 仍为 `1CBCC37F45838C5E4FA93E687A7528DCCF1208842050CC1BD81A0AA7D66EE65E`，Host 仍为 `D701E7F3B02366C4003D1E9C6FDDC4999F11BF277F312BA057352FFD7367C8CF`。Git 根 README 和发布 manifest 的既有差异另见完整记录，不宣称它们与 tarball 全部逐字节相同。

## 额外发现：宿主原生草稿跨版本恢复

辅助 IAB 先前曾在 `http://127.0.0.1:19387/` 访问独立 Web `0.2.1-alpha.1`，随后同地址由官方 Desktop `0.2.0-rc.2` 提供服务。原生来源“输入法同步更新与异步保存”打开时出现 `TypeError: text.replace is not a function` 和 `slot entry crashed in 'conversation.session'`。主对话正文未渲染，原生输入框仍在；Citer 独立面板可用。这不是旧来源“项目接手前调研”的日志解析失败，后者打开正常。

只读检查定位到浏览器的 `dsh.conversation.<sourceSessionId>`：draft 为 `{ text, references }` 对象，本次实际文字为空且引用数组为空。当前较新 Web 的宿主代码支持此结构以及旧字符串；实际加载的官方 Desktop Client 中 DefaultConversationViews 把 storedDraft 原样传给 inputActions.setDraft，后续 DraftEditorRuntime 直接调用 text.replace。Citer 源码没有写入该存储键，也没有调用宿主的 setDraft。

2026-10-09 04:59:52 UTC，将 Citer 在插件页停用后重新加载同一来源，仍得到同样的原生错误；插件开关未选中、Citer 入口不存在。完成后已重新启用 Citer，原生官方窗口 3083756 的来源正文正常，重新打开后恢复 Topic 18 的两行草稿、两份引用、Low 和只读权限。两个客户端并未运行两个 Host。

该对照支持宿主新旧浏览器草稿格式不兼容，而非本候选的普通草稿控制器回归。原始存储仅备份在忽略目录 `.refs/host-native-draft-format-20261009.json`，没有清空、转换或覆盖它，没有修改宿主代码。`.refs/host-draft-format-without-citer-20261009.png` 保留停用后的画面。切换不同宿主版本时避免复用同一浏览器 origin 是待进一步验证的环境隔离措施，不能据此称宿主缺陷已修复；官方原生应用的独立 dsh-app origin 在本轮未复现。

## 最后补测：真实拖放与 Edge 页面缩放

用户从资源管理器将 README.md 拖入官方 Citer 消息区域后，Topic 18 的草稿 revision 从 17 变为 18，新增一个 17,650 字节的 Markdown 文件，原两行中英文文字及两份真实引用保持不变，pending=null。草稿文件 SHA-256 为 `18302DA6093C202778DAEC4E5CA87BC5D49C04EE12F4BDF6B32D3C58141F54DF`，与工作区 README.md 相同。随后在 Edge 的独立 Web `http://127.0.0.1:3080/` 和重新启动的官方 Desktop 中均恢复该草稿；两端主对话输入框没有附件副本，也没有新增来源消息或自动发送。原生官方窗口重新捕获为 200764，来源主日志摘要仍为 `ECB7FE6CAA620CFE34ABFE661C52498C656A2FA0DB1F65DC68D4678809ACF6C5`。

Edge 原生窗口控制曾因工具无法可靠识别当前 URL 而停止，不能把该次自动操作记作缩放通过。用户随后亲自完成 150% 和 200% 页面缩放，提供两张实际截图并明确说“确认通过”：150% 保持主对话与 Citer 并排；200% 转为带左上角返回入口的 Citer 独立页面。截图可见 README、来源和引文附件、中英文两行草稿、模型及发送入口，未显示保存闪烁或草稿冲突选择。缩放比例依据用户确认，不把截图中未展开的浏览器缩放菜单当作独立比例测量。本项是用户实测证据，不声称自动工具操作通过了 URL 校验。

## 临时预设卸载与最后冷启动

用户明确授权永久删除 Topic 2 / `citeciter-03392016-558d-49fd-853b-a60da5838cea` 和 Topic 3 / `citeciter-d4b4aa1f-3e89-4b78-9e2f-50740251c643`，且不备份。在官方 Desktop 中分别打开对应标题，通过设置里的永久删除流程填入精确 Session ID 并完成删除。两者的 12 个原有文件全部移除，仅留下各 194 字节、cleanup=complete 的产品删除回执；回执只保留身份和清理状态，不包含对话、草稿或附件，不是备份。删除后即时摘要核对显示来源及所有其他既有文件字节不变。

正常退出官方应用后，使用内置 CLI 的 `plugin --profile desktop remove @local/citeciter-timed-qa` 成功卸载；manifest 的 dependencies 与 bundles 均无该包，重启生成的 cordis.yml 也无该预设，原来的 default / selectedDefault 仍为 standard。随后正常冷启动官方窗口 396394，Topic 2、3 未重建。没有改写旧日志中的 preset 字段。临时预设目录删除命令在执行前被自动审批拒绝，仅返回 blocked by policy，因此 `.refs/citeciter-timed-qa/` 中 3 个本地文件保留；没有改用其他方式绕过。目录不再被宿主加载，也没有进入 Git 或 npm 包。用户“不备份”的要求已遵守。

在既有空草稿 Topic 16 手动发送最后一次真实 GPT-6-Sol 问答，seq 86 显示“普通预设工作正常”，seq 88 completed。此请求真实发生一次 TRANSPORT 重试（seq 84/85）后成功，未伪造响应或隐去失败；界面恢复“可以继续追问”。普通草稿 revision 12 为空、pending=null，没有工具调用。最终与清理前摘要相比，只删除 Topic 2、3 的 12 个文件，变化文件只在本次发问的 Topic 16：topic 元数据、空草稿和追加日志，旧日志字节前缀保持完整。来源、迁移备份和其余 Topic 未变。

最后重新打开 Topic 18：README、两份引用、两行中英文、GPT-6-Sol Low 与只读状态完整，草稿 SHA-256 仍为 `ED37C4EE3F567F623842E1F7D69B37EFA97299D58DA4C3C6BB638CFA41840616`，无自动发送，来源无副本。原生截图在忽略目录 `.refs/final-official-recovery-20261009.png`；摘要记录只包含路径、大小和哈希，不包含用户文件备份。再次核对工作区与官方安装的 158 个 lib 文件，全部与候选 manifest 相同；tarball SHA-256 不变，git diff --check 通过。本次补测没有改动运行代码，不用重复构建替代实际操作。

## Claude 复审重点与外部限制

建议以 `git diff v0.9.0-alpha.3 -- packages/citeciter/src` 检查完整改动，重点看：草稿 CAS 与合并在迟到响应时是否保留新编辑；问题卡是否只恢复有精确中断证据的调用；取消、超时、补答与归档恢复是否取正确终态；删除 admission 与持久回执是否阻止已有读取重新建目录；peer 模块身份和 host-dock 清理是否影响主来源。先读本记录与完整验收记录，再独立判断，不把上述定向测试当作代码正确性的证明。

功能验收缺口已按本记录与完整记录的范围补齐，等待用户安排的 Claude 复审。外部残余清理为 `.refs/citeciter-timed-qa/` 的 3 个文件和 `packages/citeciter/.refs/artifacts/board-citation-20261009/` 空目录，均有自动审批拒绝记录，均不在包内；之前的开发目录处置仍按原记录，不扩大本次清理授权。宿主浏览器草稿降级问题保持单列，不宣称已解决；Linux/macOS 没有本轮实机结论。此次没有提交外部 issue、自动启动 Claude 或执行发布。
