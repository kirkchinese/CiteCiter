# 2026-10-09 草稿合并与官方宿主恢复

本记录按时间追加 alpha.4 发布前验收。官方 Desktop 内置 DSH 0.2.0-rc.2；同一 19387 Host 的辅助浏览器与独立 Web 0.2.1-alpha.1（10541）分别标识。各节“尚未完成”只表示当时截点，最新状态见末尾发布缺口表。未发布 npm 或 GitHub Release。

## 实现与静态检查

普通草稿及问题草稿采用同步回显、后台修订检查与自动合并，不显示保存进度、冲突提示和版本选择按钮。独立文字、附件和题目合并；互斥选项与自填答案作为整体处理。组合输入结束前不合并远端内容。正在操作的窗口保留当前题页，避免保存时跳到另一窗口的题目。

两套 SDK 的 Host/Client 类型检查通过。内联合并断言通过，覆盖同题选项/自填冲突、不同题合并、中文/英文/表情以及当前题页保持。没有保留测试脚本或假模型。

## 官方 Desktop 的 SDK 模块身份

恢复 Topic 时实际出现 `prompt variable "provider" is already registered`。不同大小写 ASAR URL 会产生不同 ESM 模块身份；仅调整入口路径拼写的候选仍失败。最终改用 DSH Profile 解析的裸包依赖，并明确声明 dsh-scope peer，避免文件 URL 绕过宿主依赖解析。没有修改宿主 Agent Loop。

新模块加载方式在两次完整退出后的冷启动中恢复成功。第一次恢复 Topic 13 的文字、README 和图片草稿，随后切换 Topic 15 恢复真实模型的两题问题卡；第二次启动直接恢复 Topic 15 的题页和答案。两次均未自动发送。

## 题页修复候选

`.refs/artifacts/question-page-20261009/kirkchinese-dsh-citeciter-0.9.0-alpha.4.tgz` 为 932,399 字节、162 个文件，SHA-256 为 `A047778E4112B9073764270ED1F1C8430269AE020CFDCC088F89D7BDEF99E349`。仅在官方进程和 19387/10541 监听全部停止后，通过官方 CLI 安装；162 个已安装文件逐字节匹配包。Host SHA-256 为 `D701E7F3B02366C4003D1E9C6FDDC4999F11BF277F312BA057352FFD7367C8CF`，Client 为 `F6F98373DD8E01EC9E77EB363A3F3B4E2FC62D508995870688C83B64C02A2848`。

## 已观察到的多窗口行为

在前一 1D080EB4 候选中，桌面与辅助浏览器从相同问题草稿开始，浏览器填写第一题自定义答案，前台桌面随后选择代码示例。最终 revision 5 仅保留 selected=[代码示例]、custom 为空，没有把互斥答案拼接。接着两窗口分别修改两道题，revision 8 保留两份完整答案；但发现远端题页会使前台跳题，此缺陷已修复，当前 A047778E 候选的原生复测继续进行。

来源主日志 SHA-256 仍为 `ECB7FE6CAA620CFE34ABFE661C52498C656A2FA0DB1F65DC68D4678809ACF6C5`。读取草稿、合并和冷启动未向来源对话追加 Citer 问答。

## 翻页误提交与当前候选

A047778E 的真实回归发现，已有完整答案时从第一题点击“下一个”会误提交。补答和新一轮实时问题卡均复现；没有点击“提交回答”。React 在同一节点上把 type=button 改成 type=submit，原点击尚未执行完默认行为。修复为不同 key 的独立按钮，并在翻页点击中阻止默认行为。

当前安装 `.refs/artifacts/question-navigation-20261009/kirkchinese-dsh-citeciter-0.9.0-alpha.4.tgz`，932,424 字节、162 个文件，SHA-256 `6885126970693EC76C0D368D0D4E1CB3D24AE4C9D73121B621BD1B85B5D60ED1`。Host 入口仍为 D701E7F3，Client 改为 `A479EF594992BD45D8B0EB67AFF31C730264E9DBD64437DFF2A81BCEDF4EA4BB`。双 SDK 类型检查、打包、根 Git 入口校验、工作区 peer 检查及 diff 检查通过；官方 CLI 安装后全部文件与包一致。

当前包在 Topic 15 发起真实 GPT-6-Sol 两题问题。辅助浏览器填写两题、返回第一题、再点“下一个”，问题卡保持等待，日志仍停在 seq 53 tool/call；没有提交。接着官方原生窗口在第一题输入中文、英文、数字及表情，revision 6 合并保留另一窗口的第二题 selected=[代码示例]，第一题仅保留当前窗口自填内容，page=0，输入焦点和文字均完整。后台保存后仍在第一题，没有跳页、冲突提示或保存闪烁。原生窗口再点“下一个”仍仅翻页，实际显示“提交回答”，模型继续等待。随后才显式点击提交。

显式提交后，seq 54 的真实 tool/result 完整保留中文 English 123、表情及第二题选项，isError=false；turn 4 在 seq 62 completed。问题草稿 revision 8 为 closed=true、answers 为空，来源主日志 hash 未变。翻页不提交、当前窗口优先、独立答案合并、手动提交和接纳后清稿子项通过。

## 同一官方 Host 的输入、工具与附件组合

当前 68851269 包在辅助浏览器使用真实 Topic 6 继续回归。turn 20 通过 run_code 调用 ask_user_question；手动取消后，seq 307 子调用为 ASK_CANCELLED，seq 308 父调用成功返回取消说明，seq 314 completed，界面分别显示父输出与子问题“已取消”，未重试。该页连到官方 Desktop 的 19387 Host，不属于独立 Web SDK 验收。

turn 21 生成讲解期间，在默认排队模式下按 Enter 发送短消息，界面实际显示“DSH 发送队列 / 排队”；日志 seq 320 为 next-turn，上一轮 seq 323 完成后才进入 turn 22 并回复“队列已接收”。随后运行中的 turn 23 按 Ctrl+Enter 发送第二条短消息，seq 342 明确为 next-step，默认按钮仍显示排队。模型处理后回复“临时插话已收到”，seq 350 completed。中间发生两次真实 TRANSPORT/fetch failed，原生重试后恢复，未将其写成插件无错误。

turn 24 生成初始正文后手动停止，seq 358 为 user aborted；界面保留已有正文并显示“已停止，可继续”。再次手动提交后，turn 25 回复“可以继续”，seq 375 completed；过程中同样有网络重试，但没有重复用户消息。停止与继续子项通过。

通过辅助浏览器的真实 filechooser 一次选择 README.md 与 video-cover.png，当前工具已能上传这两份公开素材，不再需要人工代选。文件分别识别为 text/markdown、image/png，草稿 bin 与源文件逐字节相同：README 17,990 字节，SHA-256 BB2668AD59F449120273986517E6BE6222E9ECD0C6F81F6786D4936FEC13B0A5；图片 2,015,580 字节，SHA-256 62DC342B6802E82FE9CC7FD5B5246DED4FF3F97A26070E3BCC0C1B58D21518E4。这不是原生文件对话框控制恢复的证据。

手动提交附件问题后立即输入新的混合文字草稿。真实 seq 380 仅包含发送前的问题与两个附件，不含后续编辑；草稿 revision 74 保留“发送期间保留的新草稿 中文 English 789 🧪”，files 为空、pending=null。模型通过 PTC read 读取这份 README，并正确回答项目名 CiteCiter、图片标题“边做边学”和银白长发持书人物，seq 393 completed。界面可见父子工具、两种附件及完整的新草稿。随后 Shift+Enter 换行并逐字输入 English/numbers，revision 75 保存完整换行，日志仍停在 seq 393，没有发送。辅助页面点击 README 下载按钮没有出现产品错误，但浏览器的 download 事件等待超时，Downloads 中未见本轮文件；因此本次下载落盘尚不能登记为通过。

10 月 9 日重新查询 npm 官方元数据：DSH alpha 仍为 0.2.1-alpha.1，latest/next 为 0.2.0-rc.2；Connect alpha 为 0.2.0-alpha.2；Citer latest/next 为 0.9.0-alpha.3。官方 GitHub Release 列表与 DSH 版本一致。来源主日志仍保持此前 SHA-256。

## 独立 Web 与真实输入法

仅在官方 Desktop 退出且 19387/10541 均无监听后，把同一 68851269 包安装至主 Web profile，162 个文件逐字节匹配；安装前保存的 71 个来源文件摘要全部未变。独立 DSH 0.2.1-alpha.1 在 10541 启动，恢复 Topic 6 的文字与换行草稿、历史文件与图片，没有自动发送。Topic 15 的真实 ask_user_question 在 seq 75 等待，填写两题后往返翻页没有误提交，刷新恢复两份答案与第二页。revision 4 保留第一题中文、英文、数字、表情、换行及两空格缩进，第二题为代码示例。

用户完成真实拼音输入法检查并回复“未发现”丢字、光标跳动或候选词被打断。代理另在官方原生窗口观察到完整的“中文输入正常”和下一行“english 456 E”；该输入位于用户切换后的另一来源，不能误记为 Topic 13 的草稿。此项是用户亲自操作的 IME 证据，工具直接输入 Unicode 仅作辅助检查。

## 双宿主写锁与中断恢复

用户报告 Topic 15 出现 active write handle 错误。核对时独立 Web PID 19216（10541）仍在运行，官方 Desktop PID 19776（19387）于 01:40:49 再次启动；立即停止本轮启动的 Web，确认只剩官方 Desktop。DSH JSONL 后端通过内存 writer 表及 Windows 命名内核信号量拒绝重复写入；停止 Web 后，不修改任何 Topic 内容或插件代码，原 Topic 在官方窗口正常恢复。现象与跨宿主争用一致，未捕获报错当时的调用栈，不能据此宣称排除了所有并发打开缺陷。

Web 等待中的问题由 DSH 记录为 interrupted（seq 76 的中断工具结果、seq 78 turn/end），未自动重启模型。官方窗口恢复两题原答案；往返翻页仍保持待提交，手动点击提交后 seq 85 仅追加一次 user-question-reply，完整保留换行与缩进；turn 6 在 seq 91 completed，问题草稿 revision 7 为 closed=true、答案为空。随后辅助浏览器与官方窗口同时打开该 Topic，均显示已补答及真实模型复述，无写句柄错误。来源主日志 SHA-256 保持 ECB7FE6CAA620CFE34ABFE661C52498C656A2FA0DB1F65DC68D4678809ACF6C5。

## 补充回归

### 后台板书回看

在已安装 68851269 候选的真实教学 Topic 5（`citeciter-5019450d-8201-4b30-ab6e-391de70653d7`）提交截图请求后，辅助页面于 `2026-10-08T17:19:41.776Z` 关闭 Citer，回到来源主对话；官方原生窗口仍在另一 Topic 的下载保存对话框。该次 `blackboard_view` 直到 `17:19:45.261Z` 才调用（seq 90），截图在 `.395Z` 返回（seq 91），`17:19:50.157Z` 正常 completed（seq 96）。重新打开 Citer 后可见真实板书图片与模型的复查结论，未要求重新打开面板才能截图，学习路线保持关闭，卡片数量仍为 1。来源主日志 hash 未变。这补齐关闭面板后截图仍可完成的实际证据；此前另一次截图发生在切换 Topic 之前，不计为后台截图证据。

### 损坏图片的预览说明

通过正常附件选择导入 28 字节损坏 PNG，旧候选把它识别为 image/png，但缩略图 complete=true、naturalWidth=0，没有原因说明。原文字及两份有效附件均保留；随后用界面移除损坏附件，未发送给模型，并清理该临时输入文件。组件现已在本地图片解码失败时显示“无法预览”，保留原文件与移除按钮，URL 改变后可重新尝试；不改变附件上传状态或自动发送。

修复后两套 SDK 类型检查、构建、工作区 peer 检查和 diff 检查通过。新包为 `.refs/artifacts/preview-error-20261009/kirkchinese-dsh-citeciter-0.9.0-alpha.4.tgz`，928,348 字节、162 个文件，SHA-256 `12023BE1004329053A1ACB471C479CCF69A11F069A67855588251BDEFFF310FD`，Client SHA-256 `804DF080BCA8548E12E8C8E1F2A294B81BBA17CED164F593650DD1B92E644ED6`，Host 仍为 D701E7F3。包内文件与当前构建逐字节一致，无测试脚本或临时目录；与前包相比只有 Client、两份 README 及 prepack 元数据不同。

通过官方菜单正常退出，确认两端口和官方进程均已停止后，以官方 CLI 安装该包；162 个文件全部匹配，安装前后来源目录 72 个文件的摘要全部未变。重开官方窗口 263974，文字、换行及两个附件恢复，无自动发送。再次通过真实 filechooser 导入损坏 PNG：辅助浏览器显示“无法预览”及完整原因，正常封面缩略图仍显示。官方窗口编辑自己的测试草稿后，CAS 合并保留新文字与另一窗口独立添加的附件，同样显示损坏图片提示。用原生按钮移除坏附件并恢复原文字后，revision 16 只保留原来两份文件、原文及 pending=null；本地坏图片文件已清理。该修复的实际双客户端 UI 子项通过，未据此外推独立 Web SDK 的全量验收。

官方 CLI 安装时提示 profile 的 SDK peers 缺失；`plugin --profile desktop peers check` 返回同类信息，涉及 Citer、Connect 的 Host 包及 React/Zod。该检查只看 profile 的 pnpm 依赖，宿主 SDK 由 DSH 运行时 resolver 提供；源码工作区的 peers check 则通过。安装后的真实官方窗口和 Topic 能正常恢复，但不能把 profile 的这条命令写成通过，也未在 profile 中额外安装第二套 SDK。

随后正常退出官方 Desktop，确认无共享目录写入进程后，将同一 12023BE1 包安装到独立 Web profile；162 文件再次全部匹配。DSH 0.2.1-alpha.1 在 10541 单独运行，恢复原 Topic 13 的正文、换行和两个附件。再次添加坏 PNG 后显示明确提示；移除后 revision 18 恢复原文与两份有效附件，pending=null。Topic 13 日志始终保持 SHA-256 D14BF10F78147CC9D8F8C3008807224F77B26DC2811495FC22EF32FCE73AFBE3，未自动发送；来源日志仍为 ECB7FE6C。本地坏图片再次清理，四份 README 的本地链接及末尾单换行检查通过。

该独立 Web 的真实模型后台截图也完成：页面在 `2026-10-08T17:37:22.379Z` 关闭 Citer，seq 109 在 `17:37:26.333Z` 调用 blackboard_view，seq 110 在 `17:37:27.242Z` 返回截图，seq 115 在 `17:37:31.862Z` completed。没有启动第二个 Host，也没有用同一 Desktop Host 的辅助页面冒充独立 Web 结果。

## 尚未完成

辅助浏览器下载失败进一步定位：真实 native-attachment 返回 17,990 字节，下载钩子保持 active，确实调用了带 README.md 文件名的 Blob 下载。CDP 观察到 downloadWillBegin，紧接着浏览器 downloadProgress 为 canceled、receivedBytes=0；不是未读取附件或遗漏点击处理。临时断点全部移除并关闭 Debugger，没有修改产品代码或浏览器下载策略。官方原生窗口点击同一文件后打开了保存对话框；文件名控件在激活、重读后仍无法由控制工具设置。用户手动保存为 `.refs/README-download-20261009.md` 后，实际文件为 17,990 字节、SHA-256 BB2668AD59F449120273986517E6BE6222E9ECD0C6F81F6786D4936FEC13B0A5，与原附件完全一致。官方 Desktop 下载子项通过，辅助浏览器的取消限制仍单列。

截至上述截点，当前包的完整组合验收尚未通过。附件删除、待回执释放、独立 Web 的剩余功能矩阵和发布矩阵仍需对应证据。此前 Topic 14 的临时 CDP 延迟已解除，没有拦截遗留；该截点未完成其删除及待回执释放。本轮不宣称 Linux/macOS 已验收。

本次收尾停止测试用独立 Web（PID 23564），确认 10541 无监听后重开官方 Desktop 至窗口 856678；恢复 Topic 13 原文、README 和正常图片草稿，只读权限不变，没有自动发送。主机最终只运行官方 19387 Host，避免再次出现跨宿主写句柄争用。Topic 13、14 的永久删除仍等待已发出的即时确认；没有提交代码或发布。

## 已确认的附件与待回执删除

用户随后明确确认删除 Topic，继续使用安装包 12023BE1。本轮开始未发现旧窗口或监听；官方启动调用先因窗口尚未出现超时，进程继续启动，重新读取后得到正常窗口 69530。没有据此推断插件启动崩溃，独立 Web 未启动。

在原生窗口永久删除 Topic 13（`citeciter-f728fbb0-af80-4eb1-985a-e010de57e83b`）前，两个客户端均显示原文、README 和正常图片。输入精确 Session ID 后删除成功；另一窗口同步回到未选中状态。只删除该 Topic 的元数据、日志、草稿及两个附件的元数据/字节共七个文件，新增五字段 cleanup=complete 回执，其他原文件摘要均未变化。

Topic 14（`citeciter-210e17ea-a735-41cb-b250-a76a04d8e9e3`）通过辅助浏览器手动提交真实 GPT-6-Sol 请求，再用浏览器开发工具仅延迟该客户端的 native-state 实际响应，不修改响应内容或模型。02:35:48.279Z 捕获 requestId `8cd645cf-315a-4646-8bfe-2b6e4703fef7`；删除前仍可见“发送中”载体，原生窗口已显示提交的真实消息。随后从原生窗口按精确 Session ID 永久删除，目录消失并生成 complete 回执。放行旧响应、恢复正常网络后，辅助页面接收删除结果，载体和 Topic 消失；后续约一分钟的 Network 观察没有再请求此 Topic。Fetch patterns 已清空，所有延迟响应均放行，没有留下测试拦截。此项证明真实待观察发送期间的跨窗口删除及最终轮询释放，不声称穷尽所有网络时序。

删除前后摘要保存在忽略目录 `.refs/delete-13-14-confirmed-before-20261009.json` 与 `delete-13-14-confirmed-after-20261009.json`。来源目录从 72 个文件变为 64 个：仅移除两个目标目录的十个原文件，新增两个最小回执；其他 62 个原文件逐字节未变。来源主日志仍为 ECB7FE6CAA620CFE34ABFE661C52498C656A2FA0DB1F65DC68D4678809ACF6C5。删除后的浏览器刷新已执行，原生完整退出重启及其余发布检查继续进行。

## 原生布局与连续创建

继续使用 12023BE1 包，官方原生 1283 × 823 窗口在左栏打开、Citer 55% 比例时保持来源可见；拖出顶部抓手后悬浮，拖回右侧后重新停靠。通过系统尺寸操作实际缩到 764 × 823，Citer 进入独立页面，左上角返回释放来源，未发送的文字及换行保留。扩大拖动被工具的窗口边界校验拒绝，随后用正常最大化按钮恢复宽屏；没有把失败拖动或未观察到变化的缩放快捷键计为通过。

最大化后打开宿主原生 README 详情，Citer 自动收起，文件详情优先。显式点击返回 Citer 后恢复原草稿和独立页面，官方标题栏保持可用。随后从应用菜单退出，确认官方进程与两端口全部停止，才启动独立 Web 0.2.1-alpha.1；没有并行 Host 写同一目录。

同一来源连续点击新建得到三个不同 Session，数值目录为 16、17、18；点击至输入可用的本次观察为 399、318、350 ms，不作为跨机器基准。16、17 仅有原生只读/模型配置事件，没有模型请求。18 双击重命名为“十月九日组合回归”，输入中英文、数字、表情和换行草稿；切换到独立 Web 后完整恢复。长历史 Topic 6 的标题/历史投影约 574 ms 出现，其输入就绪稍晚，未将该数字写成全部加载耗时。

## 独立 Web 的混合附件、队列和工具

独立 Web 安装包仍为 12023BE1，Connect 为 0.2.0-alpha.2。Topic 18 通过真实 filechooser 加入当前 README.md（18,092 字节，SHA-256 6718CC3F10CFFF4D1FE77B366552B16BB586A55C048EEDF374886C779A49C768）和 video-cover.png（2,015,580 字节，62DC342B…518E4）。正常 Ctrl+V 粘贴图片另得到 clipboard.png，在发送前用按钮移除；返回主对话没有附件副本。浏览器开发协议不支持本轮实际文件拖入动作，不将 filechooser 或粘贴替代拖放验收。

模型菜单先选择 GPT-6-Sol，再选择 Low；设置保存期间提交入口暂时禁用，草稿保留，待入口可用后手动发送一次。真实 read 读取附件 README，pwsh 执行只读 Write-Output 并在 seq 25 同时保留 WEB_TERMINAL_OK 与原始语言模式 stderr。模型正确说明目标用户、官方安装方式，并识别封面主标题和银发持书人物；seq 31 completed。历史中的普通文件下载入口、图片原生预览及关闭均可用。本条 pwsh 警告按既有用户决定保留为宿主限制，不写成干净终端结果。

该回合生成时归档 Topic 18，模型仍在后台完成，归档状态保持。主动打开归档项再手动发送补答后，archivedAt 变为 null 并回到活动列表。生成期间 Enter 的消息记录为 seq 38 next-turn，Ctrl+Enter 的消息记录为 seq 39 next-step，默认按钮仍为排队。插话在当前 turn 2 的 step 2 获接纳并回复，seq 54 completed；排队消息随后进入 turn 3，seq 62 completed。期间真实 TRANSPORT 重试保留在日志。发送后新输入的中文、英文、表情与换行仍完整保存在 revision 15，pending=null，没有混进前述请求，也没有重复发送。

Topic 6 的独立 Web PTC 回归在 turn 27 真实调用 run_code：seq 407 的 read 子调用成功读取 package.json 前五行；seq 409 的另一个 read 子调用返回 FS_NOT_FOUND，父调用捕获后于 seq 410 成功；seq 415 completed。界面分别显示父结果、成功子结果和失败子结果，展开失败行可见原始文件参数与 not found 错误，没有误标人工拒绝。目标缺失文件没有创建。

临时浏览器 1440 × 900 视口下，左栏、来源和 Citer 同时可见，没有水平溢出；新草稿可读且无保存状态或冲突选择提示。此为独立 Web 布局证据，原生窄屏及标题栏结果单列在上节。

## 长文、教学与真实图像编辑

独立 Web 的阅读器打开真实 TypeScript 文档 lib.webworker.txt（787,076 字节，UTF-16 长度 787,040），翻到第 2/2 页后用鼠标选中 URLPattern.pathname 的定义。创建 Topic 19 时文档引用范围为 511990–512131，草稿含真实文档与选文附件；手动发送前日志仅有权限与模型配置，没有模型请求。发送后真实 search_document / read_document 定位到相应原文，seq 41 completed，模型按要求用两句话解释 pathname 匹配规则。分页、绝对偏移引用和工具续读通过该文档实例。

Topic 17 先由用户动作开启学习路线，再手动发送教学请求。真实 todo_write 更新两步并完成，learning_cards 生成一张 debounce/throttle 卡；JavaScript 示例保留换行和缩进，点击复制后的文本与可见代码一致。关闭学习路线后手动发送第二个简短问题，没有新增待办或卡片工具调用；seq 56 completed。开关本身不触发请求，剪贴板已恢复。

Topic 8 的独立 Web 回合使用 codex_connect_image_generate 的 operation=edit 和真实已有 assetId img_9ad3132477dd4c0fb229402a62448767，返回 1672 × 941 PNG、1,469,628 字节，seq 76 completed。请求期间切换到其他 Topic 未中断生成。返回历史并打开实际图片，确认下方路径由紫色变为绿色、上方蓝色及中文标签和布局保留；预览可关闭。学习路线在该次手动提交时仍开启，因此存在真实 todo_write；后续关闭路线的结果另行记录，不把它写成默认自动启用。

## 轮盘追加聚焦修复

12023BE1 包复现：关闭 Citer 后，从真实来源选文点击“自由提问”，引用正确追加到已选中的活动 Topic，但键盘焦点停在 BODY；新建 Topic 路径则正常。原因为重开的停靠面板先测量宿主，此时 dockBody 仍隐藏，原来的单次 requestAnimationFrame 聚焦过早。

改为面板布局与草稿就绪后消费选文及板书种子并聚焦；切换 Topic、关闭或用户已移动焦点时取消旧焦点操作。没有延时重试、后台抢焦点或新的状态提示。双 SDK 类型检查、构建与打包通过。新包 DE935AC3B0B58062EC6FB6FFF18A8467AC7147D238A9628DC84C25D1C8626F43 的 Host 入口仍为 D701E7F3，Client 为 6DE25008B8D9508474A5813B0440E8575BC125CE5D18F2B1D5D4727256686E98。

独立 Web 安装并冷启动新包后，关闭面板、重新选文、自由追加到 Topic 8，实际 document.activeElement 为带正确标签的 TEXTAREA。未额外点击，直接输入“自由提问焦点回归 English 456”全部进入正确草稿，没有新建 Topic 或发送请求。随后通过界面清除此检查输入和新增引用，恢复该 Topic 原来的空草稿。原生窗口复测与最终发布检查继续进行。

DE935AC3 包为 932,794 字节、162 个文件；主 Web 与官方 Desktop 两个 profile 的全部 162 个文件均与压缩包逐字节匹配。仅在独立 Web 停止后安装并启动官方窗口 724922。冷启动恢复 Topic 18 的两行中英混合草稿、Low 模型选择、只读权限和完整的 Web 历史，没有新请求。关闭 Citer，原生鼠标选取来源文字，再点击自由提问；输入框显示光标，无需点击即可通过 Ctrl+End 和真实键入追加“ | 原生焦点通过 123”，原有文字保持。此为原生实际键盘与截图证据；辅助 API 的 focused_element 仍报告 RootWebArea，未把该字段单独用作判断。

重启后再次核对 Topic 13、14 的目录均不存在，complete 回执保留，来源主日志仍为 ECB7FE6CAA620CFE34ABFE661C52498C656A2FA0DB1F65DC68D4678809ACF6C5。Web 的归档边界复测中，选中已归档 Topic 20 再自由提问，实际新建 Topic 21（citeciter-a7774f47-2eb2-425b-8418-1ca350a54d53）；20 的 archive 标记及 revision 2 草稿不变。21 仅有 sandbox/mode 和 model/selection 事件，显示两份真实引用并聚焦空输入框，没有自动发送。

### 自定义动作的两个目标

同一官方 Host 的辅助浏览器中，将空槽 7 临时设为“对照理解”，预设问题为“请用一个反例解释这段话的成立条件。”。目标选当前 Topic 时，真实轮盘动作追加到 Topic 21，保留原草稿“保留原草稿 English 789”和两份真实引用，按空行追加预设问题；焦点进入输入框，没有模型请求。改为新建目标后，相同选文与动作创建 Topic 22（citeciter-0b6824bf-2a3f-4256-a56d-7e0eabbfb077），仅包含该预设问题与两份引用，默认只读；日志只有配置与种子边界记录。通过设置页清空槽 7 并保存后，实际重新显示“7 · 空槽”，没有保留测试设置。此项验证自定义目标，不将这些未发送草稿当作模型回答证据。

## 板书引用的内容与跨刷新身份

进一步检查 Topic 5 的真实 SVG 板书，点击引用后旧实现仅生成“关于黑板上的「黑板元素 async-compare」：”，没有实际讲解文字。新增独立 board-citation 模块解析 SVG text/title/desc 和惰性 HTML 文字，保留已有数学、Markdown 与表格路径；纯图像不伪造文字，保留需查看当前图形的提示。未执行脚本、加载外部资源或把原始 SVG、HTML、图片字节放进引用预览。首次安装复测还发现反斜杠括号会被宿主当作数学分隔符，因此文字改为 Markdown 字符实体，普通代码括号、方括号和美元符号不再变成公式。

906099EB 包在独立 Web 的 Topic 5 中实际展开 SVG 引用，显示原图标题、两种写法、返回值、等待与错误传播各行，代码括号正常。手动提交后 seq 121 的真实 user/message 包含该引用，GPT-6-Sol 于 seq 124 正确复述两种返回值与等待行为，seq 126 completed；接纳后草稿清空，未调用工具。随后真实模型新增文字元素 citation-text，内容为“索引 [0] · English (async) · 费用 $5”，实际 blackboard_apply、blackboard_view 完成，seq 145 completed，原图未改动。

该真实板书又复现引用身份冲突：906099EB 中先引用 SVG 得到 board-1，刷新后再引用新的文字元素，草稿 revision 27 仍只有原 SVG，文字被同名 ID 去重。修复后每次引用使用跨窗口 UUID；相同内容仍按既有语义去重，旧请求不能清除新的引用请求。内联断言覆盖独立窗口身份、旧数字 ID 草稿兼容、相同内容去重及晚到消费；未保留测试脚本。

当前包为 `.refs/artifacts/board-unique-20261009/kirkchinese-dsh-citeciter-0.9.0-alpha.4.tgz`，929,705 字节、163 文件，SHA-256 `23BBF511CB564AD020914EC45E61DA443632712674D54502D3DFF1100F27F205`；Host 入口仍为 D701E7F3，Client 为 `1CBCC37F45838C5E4FA93E687A7528DCCF1208842050CC1BD81A0AA7D66EE65E`。两套类型检查、构建、打包、工作区 peer、Git 入口与 diff 检查通过；主 Desktop/Web 两个 profile 的全部文件与包逐字节匹配。同版本 tarball 必须使用不同候选路径，实际观察到覆盖同一路径后宿主仍使用缓存 Client；已通过独立路径重新安装和字节检查排除本次缓存问题。

23BBF511 在独立 Web 冷启动后保留旧 board-1，点击新文字引用后出现第二个 UUID 附件。刷新并再次引用同一文字，仍恰好两份；revision 29、pending=null，日志最后仅为 seq 146 session/end-seed，没有新模型请求。预览完整显示“索引 [0] · English (async) · 费用 $5”。停止 Web 后启动官方窗口 589866，同一 Topic 恢复两份引用；原生点击第二份预览也完整显示这行文字。来源日志仍为 ECB7FE6CAA620CFE34ABFE661C52498C656A2FA0DB1F65DC68D4678809ACF6C5。

## 当前发布缺口

| 项目 | 当前结论 |
| --- | --- |
| 真实文件跨窗口拖放 | 已请求用户将 README 拖到官方 Citer 面板，尚无结果；不能用 filechooser 或粘贴冒充拖放。 |
| 实际缩放组合 | 宿主会话字号 14→18 已在官方原生窗口与辅助浏览器实际生效，两栏及输入可用，随后恢复 14；浏览器/系统整体缩放尚无有效观察，不能把字号设置等同于它。 |
| 当前失败状态的重复告警 | 已检查成功恢复后的真实长历史与失败子工具；当前回合错误卡和底部告警的去重分支仍缺新包实际故障观察。 |
| 最终 Git 提交安装 | 公开 f0c30dd 安装证据仍仅对应早期产物，需核对本次最终提交。 |
| 清理 | 自动审批拒绝清理本轮误建的空目录 `packages/citeciter/.refs/artifacts/board-citation-20261009/`，仅返回 blocked by policy；目录为空且被忽略，不在包内，未改用其他工具删除。 |

以上缺口未消除前不创建 Release 或发布 npm。独立 Web 已停止；官方 Desktop 是主目录唯一运行中的 Host。Linux/macOS 不在本轮已验收范围。

## README 同步与 Git 安装准备

四份 README 改为指向当前开发分支，并明确固定提交的复现方法；早期 f0c30dd 不再作为最新候选安装命令。板书引用的文字解析、可移除附件与刷新后继续引用同步到中英文说明。对应语言的正文一致，差异仅为语言切换文件名和 npm 所需的绝对图片/文档链接。单末尾换行、Git 元数据、工作区 peer 与 diff 检查通过。

README 更新后重新打包至 `.refs/artifacts/release-docs-20261009/kirkchinese-dsh-citeciter-0.9.0-alpha.4.tgz`，933,913 字节、163 文件，SHA-256 `2DC7E02A361B5E3D5423376D22DFCCCFA4B5DB9B2F6003D136DE2C19DB23B1E9`。Host 与 Client 分别仍为 D701E7F3 和 1CBCC37F，运行代码与前述 23BBF511 包一致；没有测试脚本、假模型、截图、凭证或 .refs 内容入包。该文档包的安装与最终 Git 提交验收在后续记录，不以打包成功代替。

通过宿主通用设置将字号由 14 调到 18，辅助浏览器 1440×900 与官方原生 1283×823 均实际放大来源和 Citer 历史文字。55% 比例下两栏换行正常，输入、附件与发送按钮仍可见；设置恢复为 14。此项是宿主字号缩放证据，不是浏览器页面或系统 DPI 整体缩放证据。
