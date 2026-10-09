# 2026-10-08 发布前复查

状态：进行中，尚未发布。承接 [10 月 7 日官方 Desktop 验收](2026-10-07-official-desktop.md)，不把旧候选的全部测试自动计入当前候选。

## 产物与静态检查

本轮仍为 `0.9.0-alpha.4`。npm 实际查询结果为：CiteCiter latest/next 均为 `0.9.0-alpha.3`；DSH latest/next 为 `0.2.0-rc.2`、alpha 为 `0.2.1-alpha.1`；Codex Connect latest 为 `0.2.0-alpha.1`、alpha 为 `0.2.0-alpha.2`。

`pnpm typecheck`、`pnpm typecheck:desktop`、`pnpm build`、`pnpm peers check`、`git diff --check` 本轮通过。build 内的 Git 入口元数据检查通过。重建后的 `lib/index.js` SHA-256 为 `77EC99269CDA9F9D483EC87DE63C04D362EF9D166AF8DDDBD674ACA7ED329839`，`lib/client.js` 为 `49823F1A3BEA5B124211039FB2F0064E51E3D202C84212062D7CD07C5A0FECE3`，与已安装 `8873D130520E` 候选对应入口一致。静态检查不替代运行验收。

## 官方 Desktop 真实模型复查

启动前 10541 / 19387 均无监听，未发现官方 Desktop 进程。重新启动已有官方安装，获取新窗口 `69030`，没有复用旧窗口句柄。宿主为官方 `0.2.0-rc.2`，Connect 为 `0.2.0-alpha.2`，真实模型为 `openai-codex/gpt-6-sol`。

在原真实来源下新建 Topic 11（`citeciter-9d28988d-ccd8-4f36-b21c-421a0505d4b8`）：新 Topic 权限只读、学习路线未勾选，无自动模型请求。输入真实异步保存问题后按 Enter，输入回显和发送正常，未观察到保存状态闪烁。模型解释完成后显示三个可点击追问。点击“防抖保存会带来什么取舍？”只填入草稿；持久化 revision 5 保存原文，references/files 为空、pending=null，没有自动发送。

勾选学习路线后仍未自动发送。手动点击发送，模型在同一回合使用原生 todo_write 选择两个步骤，生成一张学习卡，再把两个步骤全部完成。界面计划显示 2/2，工具行与回答均可见；日志 turn 2 在 seq 54 completed。关闭学习路线后计划区域收起，已有学习卡保留。随后通过 Enter 发送关于旧保存覆盖的追问，模型直接解释原子版本检查，没有恢复或更新教学待办，也未生成新卡；turn 3 从 seq 56 到 seq 65 completed，没有工具调用。主输入草稿 revision 10 清空且 pending=null。

本轮上述操作后，来源主日志 SHA-256 仍为 `ECB7FE6CAA620CFE34ABFE661C52498C656A2FA0DB1F65DC68D4678809ACF6C5`；Citer 内容未追加到来源主日志。

## 晚到保存的后端边界

对 Topic 10 中已经实际完成的三个真实问题 closed 记录调用构建后的 QuestionDraftStore.save，分别提交低一修订号且含文字的保存请求。三次均返回 closed=true / conflict=true 和空答案，三个原文件的 SHA-256 全部未变。此为真实持久化记录的后端边界检查，未使用假模型、未创建夹具或临时脚本，也不声称模拟了浏览器网络延迟；多窗口 UI 冲突和唯一接纳证据仍由 10 月 7 日的实际操作提供。

## 当前限制

四份 README 的早前批量更新命令曾被自动审批拒绝，返回 `blocked by policy`，没有给出具体规则，该命令未执行。用户随后明确要求改用编辑；本轮以逐段补丁成功更新四份 README，核对中英文各自根目录／包目录正文一致（仅链接路径不同）、本地链接有效、末尾单换行和 diff-check 通过。内容同步独立 Web 的实际验证范围、问题卡恢复、删除边界和官方宿主重连外部限制，保留 Super 模式为未来探索，并细化安装、首次追问及后续学习收益的反馈入口。README 写入不再是阻塞。

官方 Desktop 后台重启后，另一个浏览器客户端原位重连白屏的停用 Citer 对照证据见 [外部限制说明](../compatibility/official-desktop-reconnect.md)。本轮已经补齐待答问题草稿删除及 closed 记录拒绝旧修订保存的子项；附件删除、待回执轮询释放以及部分工具/布局/性能组合仍有缺口，不能据本次静态通过宣布可发布。没有执行 npm publish、dist-tag 或 GitHub Release 创建。

## 删除待答卡和未提交的问题草稿

本轮新建 Topic 12（`citeciter-d5db9537-bff9-4972-9479-c08663344779`），真实模型调用 ask_user_question 并等待答案；在自填框输入“待删除问题草稿：中文 English 20261008，不能留在来源会话。”但不提交。其 question-drafts 记录为 blocking=true、closed=false、revision=1，保留该原文。用户随后明确同意永久删除这个验收 Topic。

通过官方窗口 Topic 设置打开永久删除确认，输入精确 Session ID 并执行。等待卡和对话框消失，Citer 显示“Topic 已永久删除”并回到未选中状态。删除前来源目录共 53 个文件、无链接；删除后 50 个文件。仅移除 Topic 12 的 topic.json、主输入草稿、问题草稿和日志四个文件，新增五字段 cleanup=complete 删除回执；其他 49 个文件逐字节未变。未向来源写入测试答案。快照保存在忽略的 `.refs/question-delete-12-before-20261008.json` 与 `question-delete-12-after-20261008.json`；此 Topic 没有文件附件，不把本项写成附件删除已通过。

随后通过“应用 → 退出”正常退出，确认无官方进程及 19387 / 10541 监听，再重新启动到窗口 `2821566`。来源目录仍为 50 个文件，与删除后的快照全部逐字节一致，Topic 12 目录没有重新建立。原生窗口恢复 Topic 11 的历史和一张学习卡，学习路线保持关闭，没有恢复 Topic 12 的等待卡。

## 当前附件选择的控制边界

在官方原生 Topic 11 点击添加附件，系统“打开”窗口正常出现。Computer Use 能读取文件名控件 312，但设置两个已授权路径时返回 `element 312 is not available in cached app state for DeepSeek Harness.exe`；按技能重新激活、读取并重试一次后仍返回同一错误。已请用户选择 README.md 与 video-cover.png，不发送。此处尚未观察最终包的本次附件添加结果，不能把控制错误认定为附件处理缺陷，也没有用其他 UI 技术绕过目标校验。

## PTC 子问题主动取消

新辅助浏览器页连接正在运行的官方 Desktop `19387`，不是另一个 Host，也不是独立 Web alpha。选择原真实 Topic 6 后发起 PTC 取消任务；首次请求在调用工具前收到 Codex `Our servers are currently overloaded`，界面显示请求失败，没有将这次尝试计为通过。

间隔后手动重试一次，真实模型在 turn 12 通过 run_code 发出 ask_user_question 子调用。seq 168 记录 `:ptc:1`，问题为“是否保留这次 PTC 操作？”。在问题卡输入“取消后不保留这份未提交草稿 中文 PTC 123”，实际记录 blocking=true、closed=false、revision=1；点击普通问题的“取消”后，seq 169 返回 ASK_CANCELLED，父 run_code 在 seq 170 成功返回已取消说明。界面分别保留父工具输出及子工具“已取消”，没有把父工具成功改写为失败或审批拒绝。seq 173 的模型答复仅“已取消。”，seq 176 completed，没有再次提问。

对应问题草稿立即变为 closed=true、revision=2、answers={}、edited/held=false，来源主日志 SHA-256 仍为 `ECB7FE6CAA620CFE34ABFE661C52498C656A2FA0DB1F65DC68D4678809ACF6C5`。此项通过 PTC 子问题取消、呈现和终态清稿，不替代 PTC 写入审批或全部取消种类。

实际刷新辅助页面后，父/子工具的已取消状态和最终答复恢复，没有恢复问题卡或再次启动模型。

## 自由提问、归档边界与移除引用

在活动 Topic 6 打开时，从真实来源回答拖选“JavaScript 中，界面状态应同步更新，让输入内容立即显示；”，右键轮盘选择自由提问。引用追加到原 Topic 6，输入框获得实际焦点；磁盘主草稿 revision 28 仅包含来源地址和该文段，pending=null，Topic 日志仍截至 seq 176，没有自动发送或新建 Topic。移除两个引用后，revision 30 的 references=[]。

通过 Topic 设置归档 Topic 6，再从归档列表主动打开它。再次选取相同来源文字并选择自由提问，实际创建新的独立 Session `citeciter-9955b2be-d363-44a8-a60e-41770bbf5e4d`，归档 Topic 6 仍为 archived 且其草稿没有重新加入引用。新 Topic 默认只读、学习路线关闭，输入框聚焦，revision 1 保存两个真实引用但未发送。本次新 Topic 复用了已经释放的数值目录 `12/`，其 Session 身份与前述已删除的 `citeciter-d5db9537-bff9-4972-9479-c08663344779` 完全不同；这是新的显式创建，不是旧 Topic 或问题草稿复活，旧删除回执仍按精确 Session ID 隔离。

在新 Topic 移除文段与来源两个附件后，手动发送来源权限检查请求。真实模型在 seq 15 调用 read_source_session；seq 16 明确返回“来源会话未作为附件发送。请让用户附加来源后再读取。”，模型停止读取并说明原因，没有改用其他工具或重试，seq 22 completed。模型消息未含已移除原文；草稿 revision 5 为 references/files 为空、pending=null。来源完整日志 hash 仍未变。

随后重新打开归档 Topic 6，手动发送“归档恢复验收：仅回复‘归档恢复完成’。不调用工具。”；它的 archivedAt 自动变为 null，实际活动列表显示该 Topic。模型端返回服务器过载，界面显示请求失败且未产生正文；只把发送后恢复活动列表计为通过，不把失败回答写成成功。

## 最终候选的文件、图片与重启草稿

用户确认在文件选择期间曾手动发送过一组附件，又再次添加了请求的两份文件。因此 Topic 11 已发送的 README（14,918 字节）和图片属于用户明确发送，不是自动发送；新草稿的 README 为工作区当前的 17,134 字节文件。两者不能混作同一附件版本。

新草稿把 README.md 识别为 text/markdown、video-cover.png 识别为 image/png。README 的 SHA-256 为 `1BADEEBE59583B263798BDAA17B80CB67C2F934E0A86FF7341E74E7F06F037B3`；2,015,580 字节图片的 SHA-256 为 `62DC342B6802E82FE9CC7FD5B5246DED4FF3F97A26070E3BCC0C1B58D21518E4`，两个草稿 bin 与工作区原文件分别一致。来源输入框没有附件副本，来源主日志 hash 仍未变。

在官方窗口打开历史图片，实际大图正确渲染；点击标题栏下方独立的预览关闭按钮后回到 Topic，官方窗口保持打开。随后写入一条未提交的组合验收问题，草稿 revision 17 同时保留文字和两个附件、pending=null。通过应用菜单完整退出，确认官方进程与 19387/10541 监听消失后重启到新窗口 1838432；实际输入框恢复完整文字和两个附件、模型 GPT-6-Sol Max、权限只读，没有自动发送。

来源目录重启前后均 58 个文件；Topic 11 全部文件及来源主日志未变。仅另一个 Topic 6 的日志追加原生 session/end-seed 记录且元数据更新，不能宣称全部 58 个文件未变。完整摘要保留于忽略的 `.refs/attachment-restart-before-20261008.json`。

重启恢复完成后，再由代理通过输入框 Enter 手动提交组合验收。真实 GPT-6-Sol Max 的 read 调用只读取宿主附件存储中对应 README 的内容，界面可见思考及 read 工具行；模型正确回答项目名 CiteCiter、图片主标题“边做边学”、左上角 Citer 标识和右侧持书的银发人物，并区分文档与图片依据。turn 5 在 seq 91 completed，草稿 revision 19 为 text 空、references/files 空、pending=null。普通文件与图片组合读取及重启后重新登记、手动提交、接纳清稿子项通过。

点击本轮 17,134 字节 README 的下载按钮后，官方原生保存框打开，文件类型为 Markdown Document。Computer Use 设置文件名控件 298 两次失败（中间已激活并重读），均为 `element 298 is not available in cached app state`；随后用户手动完成保存。实际落盘位置为 `C:/Users/13642/Downloads/README.md`（不是请求的 `.refs` 路径），修改时间 2026-10-08 15:57:29，17,134 字节，SHA-256 为 `1BADEEBE59583B263798BDAA17B80CB67C2F934E0A86FF7341E74E7F06F037B3`，与本轮发送的附件完全一致。本候选的原生下载落盘与字节一致通过，不引用历史 14,918 字节下载作为本项证据。

## PTC 只读拦截与审批等待

官方原生 Topic 6 的 turn 14 使用真实 run_code 调用 write 子工具，目标仅为 `.refs/official-ptc-approval-20261008.txt`。未申请升级时，子调用在 seq 195 返回 FS_SANDBOX_DENIED；父 run_code 在 seq 196 成功返回捕获的错误，模型说明已停止且未重试，seq 201 completed。原生界面分别显示父输出与子工具“调用失败”，目标文件不存在。这证明只读拦截和父子结果分别呈现，不是人工点击拒绝的证据。

随后单独申请 workspace-write 的 turn 15 到达宿主审批，但父 run_code 在 120,000 ms 后超时。seq 212 的子结果为授权取消，seq 213 的父结果为 CODE_RUN_FAILED / timeout，seq 218 completed；界面如实显示调用失败，目标文件仍不存在。这次结果登记为等待超时，不归为人工拒绝或允许。再次手动发起一次测试后，原生界面已实际显示“等待授权 · write”及“拒绝 / 仅允许这次”按钮；人工拒绝结果仍待用户操作，未由代理代点权限按钮。

## 重复失败提示的局部修复候选

旧安装的真实 Codex 过载错误同时出现在历史错误卡与底部告警，造成重复提示。CitePanel 现在仅在当前可见历史已有完全相同原始错误时省略底部重复告警，保留原错误卡、请求信息和诊断内容；不同操作错误、无 Topic 状态和卡片页的告警不受影响。没有改写原始日志或工具结果。

修改后 `pnpm typecheck`、`pnpm typecheck:desktop`、`pnpm build`、包的 prepack 构建及 `git diff --check` 均通过。新候选位于忽略目录 `.refs/artifacts/presentation-20261008/kirkchinese-dsh-citeciter-0.9.0-alpha.4.tgz`，926,320 字节、161 个发布文件，SHA-256 为 `61F216762F5079AFE73A193D1608FC9B91D022202AE06A3E63C0434ACAC2E937`。逐项读取压缩包确认 161 个文件与工作区对应文件一致，无凭据、假模型、夹具或临时测试脚本路径。Host 入口仍为 `77EC99269CDA9F9D483EC87DE63C04D362EF9D166AF8DDDBD674ACA7ED329839`，Client 改为 `6976C12D49BEEC9631974595704DEE68CEEE60878055069CFABB3C287D32235A`。该包尚未安装；正在等待的真实审批仍运行于 8873，不能将旧包界面观察记为新提示修复已通过。

## 人工拒绝结果与 README 更新后安装

第二次等待也在 600,000 ms 超时（turn 16、seq 228 cancelled），不能把它写成人工拒绝。用户随后手动发送“重试一次”，并确认点击拒绝：turn 17 的 seq 245 approval/asked 精确指向 write 的 `:ptc:1`，seq 246 为 rejected，seq 247 子结果为拒绝且 isError=true；父 run_code 在 seq 248 成功返回捕获的错误，seq 253 completed。官方窗口实际显示子工具“已拒绝”、父工具捕获结果、模型说明停止且未写入，没有残留审批卡或换工具重试。目标文件不存在，Topic 权限仍只读。这一人工拒绝子项通过，前两次超时记录保留。

README 成功更新后重新打包为 `.refs/artifacts/readme-final-20261008/kirkchinese-dsh-citeciter-0.9.0-alpha.4.tgz`，926,917 字节、161 个文件，SHA-256 为 `B81B3495AA68EC2202563859D5E3A93C32AFAAECFF49B1C788C700B6813EC75E`；Host / Client 入口与上面的 61f216 相同，仅 README 内容更新。使用官方应用菜单退出，确认无官方进程及 10541/19387 监听后，由官方 CLI `plugin --profile desktop add` 安装新路径，退出码 0；安装后的 161 个文件逐字节匹配压缩包，安装前保存的 54 个来源目录文件全部未变。重启到新原生窗口 3084070 后 Topic 6 历史及“已拒绝”状态正常恢复，权限只读，没有自动发送。该新包已实际加载，但重复模型失败提示仍需真实失败界面复核。

## 新候选 PTC 允许一次

此前 turn 18 的允许路径也在等待 600,000 ms 后 cancelled / timeout，未写入文件。用户回来后明确授权代理操作 DSH 的审批按钮；重新启动同一 B81B3495 候选到官方窗口 2165206，实际 Client 哈希仍与已验包一致。在 turn 19 仅请求目标文件的一次写入，核对审批原因后点击“仅允许这次”：seq 287 为精确子调用的 approval/asked，seq 288 为 allowed-once；seq 289 的 write 子调用和 seq 290 的父 run_code 均成功，seq 296 completed。原生界面显示独立父子成功结果、模型完成说明，审批卡收起，权限按钮仍为只读。

实际文件为 25 字节，内容严格等于 `CITER_PTC_APPROVAL_PROBE` 加一个 LF，SHA-256 为 `6C027B798AA7B16998C5BC2F600D3AF0FF118954E829339663877BC71659CFA9`。在核对绝对路径、非链接及完整内容后，用 LiteralPath 删除这一个测试文件，随后确认不存在。此项通过真实 PTC 单次授权、写入、父子结果呈现及清理；不把授权扩大到默认权限或其他操作。

## 新候选原生文件详情优先

在 B81B3495 的官方原生窗口 2165206（1283 × 823，左栏打开、Citer 比例 55%）中，打开宿主右侧栏与工作区 README.md。Citer 自动收起，原生 Markdown 详情显示当前 README 与视频封面，来源主对话仍可阅读；没有被 Citer 的窄屏独立页面覆盖。点击“返回 CiteCiter”后，原 Topic 6 的历史、空草稿及只读权限恢复，面板以独立页面呈现。再次点击左上角“返回主对话”，先前 README 原生详情仍保持打开；收起右侧栏后主对话恢复可用宽度。此项通过该原生组合的详情优先、显式返回及界面保留，不外推其他缩放比例。

随后从 Citer 加号创建新的独立 Topic，实际获得空输入框焦点、只读权限和关闭的学习路线，没有自动模型请求。准备含附件删除验收时，原生文件对话框能显示，但截图坐标点击报告非目标窗口；按规范重新激活并读取后，文件名控件仍返回 `element 991 is not available in cached app state`。已请求用户选择 README.md 与 video-cover.png，不发送；这是文件窗口控制限制，不是权限按钮授权未生效，也不据此判定上传失败。
