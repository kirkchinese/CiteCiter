# 0.8 原生会话真实模型验收

日期：2026-09-12 至 2026-09-13。状态：本轮覆盖项已完成，已知限制见末节。本记录只说明已观察的结果，不承诺所有组合无缺陷。

## 环境

Windows，Node 24.19.0，DSH latest 0.1.5-rc.1，Desktop latest 2.0.9，dsh-codex-connect latest 0.1.0-alpha.4.34。Web 使用本机主要 DSH home、端口 10550；Desktop 与 Web 依次运行，不共用活动写入实例。模型：DeepSeek-V4-Flash-Vision-Exp，Max；图片由连接插件调用真实生成服务。未使用人工模型响应。

来源为 Desktop 中真实创建的 Promise.all / forEach 问答，再通过宿主“在新对话中分支”创建分支。来源分支：`session-79342f01-caa0-4ad1-8a4d-ae4de5a2782c`。以下标识仅定位本机验收记录，不包含日志、凭据或登录地址。

## 已完成

| 场景 | 操作与观察 | 结论 |
| --- | --- | --- |
| 原生来源分支 | 使用完成的真实问答分支创建 Citer；修复宿主 seeded fork 在 readSession 读取时抛错的问题，改用公开 observeSession 并释放观察者 | 创建正常，未修改宿主或 seed 文件 |
| 手动发送 | 新建空 Topic，只有来源附件和空输入框，模型未启动；按 Enter 后产生首条 human message | 通过 |
| 权限默认值 | 来源为完全权限，新 Topic 仍显示并记录 read-only | 通过 |
| 删除来源附件 | 移除来源对话 chip 后发送；模型两次调用 read_source_session，均被实际拒绝 | 通过；未隐式继承来源历史 |
| 显式编程权限 | 用户操作模式菜单选择工作区修改；真实模型在限定临时目录创建并运行并发示例 | 写入与运行成功；独立复运行 6 项断言通过 |
| 重启恢复 | 正式 Web 重启后重新打开相同 Topic | 对话、板书和显式 workspace-write 选择保留 |
| 自动学习路线 | 勾选学习路线后手动发送教学请求 | 模型自行选取 4 项 todo_write 计划并更新至 4/4，无逐阶段自动请求 |
| 板书视觉闭环 | blackboard_apply → blackboard_view → 修改 SVG → blackboard_view | 两次成功取得真实 PNG；模型修正标签，实际黑板显示四条时间线 |
| 学习卡 | 模型提交两张卡片，随后按要求核对并替换完整卡片组 | 流程正常；首次卡片出现知识错误，已单独记录 |
| 原生排队 | 纠错仍运行时手动发送排队问题 | 当前回答完成后出现下一条用户消息和真实回答，未覆盖前一轮 |
| 图像生成与查看 | 只读 Topic 调用 codex_connect_image_generate 生成一张图，再调用 view_image | 实际生成 1774 × 887 PNG 并查看；人工核对四条彩色线，一条明显较短，无文字 |
| 图片与文件组合 | 同时上传生成的 PNG 与文字文件，手动发送；模型读取真实附件 | 正确辨认四条线的颜色、长度顺序及文字内容 |
| 普通文字 | 在图片 Topic 中继续要求多段说明 | 真实完成；没有文件操作 |
| 插话 | 长回答运行时发送两句回答的插话要求 | DSH 在当前 step 结束后注入同一 turn，最后按新要求回答；不是即时截断当前 step |
| 停止与恢复 | 停止长回答，再发送短问题 | 原输出停止，新问题正常得到“可以继续” |
| Shift + Enter | 在未发送的文档问题末尾按 Shift + Enter | 输入值包含换行，未产生发送；再按 Enter 提交 |
| 只读拒绝写入 | 要求 write 创建限定临时文件，保持只读且不提权 | 工具返回 sandbox file access denied；独立确认文件不存在 |
| 原生长文档 | 从 625357 字节 Markdown 原生预览切换 CiteCiter 学习，翻到第 2 页并选取末尾例题 | 完整末页可见，轮盘仅建立草稿；模型通过文档工具返回 CITER-END-47 和 8 秒答案 |
| 文档附件删除 | 新文档 Topic 移除来源、文档和选文后手动要求 read_document | 工具真实拒绝，模型没有改用工作区文件 |
| 独立阅读器 | 打开相同长文档，翻到第 2 页，选文并准备草稿 | 阅读器自动收起；来源与文段附件保留；没有自动调用模型 |
| Topic 导航 | 搜索标题、切换 Topic、双击标题后 Enter 保存 | Web 通过；重启 Desktop 后新标题保持 |
| 模型菜单 | 模型与思考强度菜单将 Max 改为 High | UI 与后续原生会话选择保持一致 |
| 布局组合 | Web 宽 1600、窄 820，比例 55%，打开原生详情、关闭与重开 | 早期包验证自动悬浮；用户随后要求改为窄屏独立页面，最终行为见下表 |
| 拖动 | Web 与 Desktop 分别从标题空白区域拖离，再拖回右缘 | 两端均切换为悬浮并恢复停靠 |
| Desktop 原生工具 | 完全重启后恢复 Web Topic，Enter 提交数学板书问题 | blackboard_apply 和两次 blackboard_view 成功；暴露公式字号被 CSS 覆盖问题，已修复；后续原生视觉回归确认完整显示 |

文字与权限 Topic：`citeciter-75e0ce66-deb9-4a55-92d2-685d03630c33`；编程、教学与队列 Topic：`citeciter-0790e355-b57c-4807-8671-5d035777e616`。视觉回执分别为 1000 × 680 PNG，229130 / 230960 字节；生成图片为 669219 字节。图片保存在本机 DSH 附件仓库，未提交到仓库。

## 发现与修复

来源读取原先对 seeded native fork 调用 readSession，引发继承前缀长度断言。使用 sessionQuery.observeSession 的日志观察接口读取，结束时通过 Symbol.dispose 释放；不修改来源历史。

原生 Agent 上通过未注入的上下文读取 sandboxPolicy 会失败。权限、持久化和工具装配改为显式依赖；Agent 作用域仅承载属于该 Topic 的注册。

窄输入框中长模型名称挤出发送按钮。模型控件现在允许收缩、截断名称，窄宽度下权限仅显示图标，完整值保留在可访问名称和菜单中。

Desktop 加载外部插件时，安装包内的 dsh-scope 与全局 CLI fallback 解析到不同模块，两份私有 Symbol 导致 scopeOf 无法读取宿主 Agent 的标记。Citer 现在通过 agent.ctx.plugin 挂载声明依赖的子模块，继承宿主现有作用域并以子 fiber 管理生命周期。完全重启 Desktop 后原生 Topic 恢复及真实工具调用通过；没有修改宿主解析器。

数学板书使用 style.fontSize=34px，但 MathElement 的 CSS 固定为 15px，覆盖了模型的字号调整。改为继承元素字号。截图只选择同一 Topic、同一板书 revision 的可见画布；不匹配时使用对应快照离屏渲染，避免跨 Topic 误取。

原生学习预览补充 mjs、cjs、mts、cts 扩展名。阅读器更换系统字体、图标翻页与受控导入按钮，统一焦点提示、圆角和减少动态效果设置。原生文件读取与 Citer 导入快照仍分开管理。

模型曾将“后续拒绝无人接手”写入卡片。实际 Promise.all 会为输入注册拒绝处理器；聚合结果不再变化不等于输入没有被处理。核查依据为 [ECMAScript PerformPromiseAll](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-performpromiseall)。真实模型随后运行 Node 内联实验，确认只有独立裸拒绝触发 unhandledRejection，并纠正卡片。此问题说明模型自查不等于独立事实核验。

模型内置 web_fetch 对规范网站返回“解析为非公网 IP”，未能读取原文。它报告了限制，没有把搜索标题称为已读正文。外部规范已由验收者另行查阅；未更改宿主网络防护以绕过此错误。

## 独立存储与导航回归

| 场景 | 实际证据 | 结果 |
| --- | --- | --- |
| 完整历史迁移 | 7 条历史经公开持久化接口读写，核验原头部和每条事件；原副本按用户确认移入来源的 citeciter/migration-backups | 数据保留，旧根目录重复入口清除 |
| 来源保护 | 主 Session 文件 SHA-256 在迁移前后相同 | 未追加、删除或改写来源日志 |
| 新建独立 Topic | Topic 8 实际创建后请求 read_source_session，并得到真实回答；根会话目录无其副本 | 新日志仅存于来源 citeciter 子目录 |
| 删除与恢复 | Web Topic 9 真实回答 2+3=5；归档、恢复、永久删除后重启 | 自有目录消失，索引不复活，其他 Topic 保留 |
| Desktop 历史恢复 | 迁移后打开同一图片 Topic，再调用 blackboard_view | 真实 PNG 返回，公式与说明完整且无堆叠 |
| 窄屏页面 | 约 900 像素窗口展开主侧栏及 120% 缩放，显示左上角返回 | 主内容区由 Citer 占据，返回释放来源；100% 已恢复 |
| 主列表隔离 | Desktop source-world-15 安装包真实发送后展开主侧栏 | 主列表仅显示真实来源；Citer 标题只在右侧/独立页面出现 |
| 发送失败恢复 | source-world-14 在 pre-step 抛出存储归属错误；source-world-15 通过精确身份的 get/flush 路由修复 | 手动重试完成真实回答；输入与发送占位清空，无重复用户消息 |
| 持久化回执 | 原生 inbox 插入后、user/message 之前的失败原先留下“发送中” | 增加对持久化 inbox 插入的精确 requestId 回执，覆盖被提前消费的请求 |

主列表泄露源于共享 SessionStore 的实时成员和创建事件，非磁盘递归扫描。Citer 使用独立存储成员与创建事件作用域；原生 get/flush 适配只处理已登记 Citer 身份，保留主枚举。该适配不修改磁盘宿主代码及 Agent Loop。

Desktop source-world-15 另已完成原生文件选择器同时选择 PNG 和 TXT、显示上传附件、手动发送、模型读取附件并调用 blackboard_view。模型报告图片颜色和长短顺序正确，返回 490×679 的真实黑板，公式与说明均无裁切或重叠；随后生成课堂说明。原生工具检查点与附件接纳均通过。

文字回归暴露模型将 allSettled 描述为“从不 reject”，后经用户式追问收窄到输入 Promise 的失败；它对迭代器异常的错误类型仍概括过度。验收记录将此归为模型知识准确性限制，不把 API 流程完成等同于内容正确。

## 9 月 13 日补充回归

source-world-16 安装包已完成真实模型 ask_user_question：两个选项显示在 Citer，选择“代码时序”并提交后，原生工具结果记录答案，问题卡自动收起并继续回答。新模块消费 uiSession.pendingInteractions，不另建审批策略。停止前的 steering 消息在重启后仍存在，下一次手动发送时被接收。

Windows 编程回归使用原生 pwsh 工具执行 Node 内联程序，不生成脚本，不提权。A 在 20007 ms 完成，B 在 30005 ms 完成，Promise.all 总耗时 30005 ms，退出码 0；后续追问回复相同实测耗时。此前 Bash 在受限环境下失败，分别为 WSL E_ACCESSDENIED 和 Git Bash signal pipe Win32 error 5；未修改宿主安全设置。

此前真实工具请求审批时，Citer 未显示待确认交互，已接入 DSH 原生审批、问题及计划确认类型；关联工具参数可展开查看。允许与拒绝的人工交互结果见下文，未通过自动授权代替验证。

Cordis 会并发清理同级 effect。Citer 的身份/保存适配现在等待所属运行时完成关闭后再恢复原方法，恢复原属性描述符。

已删除 .refs 下 36 个自有临时操作与验收脚本，包括旧人工模型路径、隔离实例启动脚本和临时修改脚本。Git 历史保留。

## 思考展示回归

Desktop source-world-19 恢复了日志中原有的 reasoning；缺失原因是客户端过滤了只有思考的消息，且回答组件遗漏该字段。真实 DeepSeek-V4-Flash-Vision-Exp Max 回答“五个互不相同正整数之和为 50 的最大乘积”，已观察到正文之前的“思考中”、展开的实时 Markdown、最终回答和数学公式。答案为 8、9、10、11、12，乘积 95040，证明检查了互异约束下的平滑条件。

source-world-20 进一步通过 DSH 公开 end-frame 的精确提交 seq 关联显示标识，避免实时消息结算为历史消息时重挂载。第二轮真实追问已观察到思考行从“思考中”转为“思考”，完成后展开内容仍保留。Shift+Tab 可回到思考按钮，Enter 收起内容并保留单行预览，不触发模型发送。关联仅用于当前 Agent 生命周期的界面，不更改原始消息 ID 或持久化格式。

本轮重新读取 Computer Use 26.908.40834 后，Desktop 截图、滚动、点击、拖动、输入和 Enter 发送均恢复。浏览器环境枚举恢复，实际网页操作另行验收。source-world-18 的侧栏拖出后仍停留在同一表格片段，没有跳到底部。

source-world-22 已安装到主要 Web 与 Desktop profiles。Web 真实模型在仅返回思考时停止，原生日志 assistant/message seq 287 标记 interrupted，包含 14217 字符 reasoning、0 字符回答正文，turn/end 为 aborted。停止后仍可展开，刷新后思考前缀保留；未自动重发。

Web 已在 820×900、420×860 视口检查 Citer 独立页面、返回来源、历史思考展开和模型菜单。420 像素发现读书入口覆盖模型选择，已移入 Topic 操作菜单并实际打开阅读器和设置；模型标签被长模型名挤成两行的问题已修复并复查。真实 Topic 2 完成归档/归档列表/恢复，消息与思考均保留。1440×900 深色主题下正文、思考和菜单可读，测试后恢复“跟随系统”。

## 最终包补充验收

source-world-25 在主要 Desktop 完成发送组合回归。宿主默认为排队时，Ctrl+Enter 的 inbox seq 298 为 next-step，Enter 的 seq 299 为 next-turn；回答分别在 turn 13 step 2 和 turn 14 完成。将宿主设置改为插话后，Citer 无需重启即显示插话；Enter 的 seq 322 为 next-step，Ctrl+Enter 的 seq 323 为 next-turn。真实 ask_user_question 等待期间，两条消息均保留；选择 Markdown 表格后，工具结果 seq 324 接纳选项，插话在 turn 15 接收，排队在 turn 16 回复“复习完成”。验收后恢复宿主默认排队。source-world-26 只修正待处理消息移除按钮的可访问名称。

真实 write 审批已完成两个分支。首次标准写入返回 FS_SANDBOX_DENIED；用户手动拒绝一次性升级后，tool/result seq 353 记录拒绝，turn/end seq 358 完成，审批卡收起，文件不存在，模型没有换工具重试。用户随后手动选择“仅允许这次”，tool/result seq 368 记录创建成功，turn/end seq 373 完成；实际内容严格为 CITER_APPROVAL_PROBE 加一个换行。Topic 的 sandbox 仍为 seq 28 设置的 workspace-write，没有永久提权。已按路径与内容核验后删除临时文件。

Desktop 已分别检查兼容、扩展、增强模式。最大比例 55% 保留至少 480 CSS 像素的来源宽度；120% 缩放与原生详情组合触发 Citer 独立页面，返回释放来源。用户实际将窗口缩至约 902 像素；主导航收为图标列，空间可用时仍并排，展开原生文件详情后切为独立 Citer 页面，返回后恢复来源与详情。验收后恢复 100% 缩放、28% Citer 比例和增强模式。

原生文件预览的文件名已出现在草稿附件中。添加菜单用方向键停留再按 Enter，仍能稳定选择来源文档，仅添加一次，不触发模型。文档元信息查询与菜单焦点生命周期分别维护。

source-world-26 暴露运行中热卸载丢失最终中断记录：持久化子模块被并发卸载，日志停在 request/header。source-world-27 将自有 Agent handle 纳入 Cordis 有序 effect，先停止并排空 Agent，再撤下 Session 服务。主要 Web 真实流式回答中禁用插件后，assistant/message seq 391 标记 interrupted，step/end seq 392 与 turn/end seq 393（aborted / disposed）均落盘。宿主进程没有重启，来源日志 SHA-256 保持不变。禁用后刷新页面，Citer 入口与主内容占位均释放。DSH 当前网页插件集合需刷新才能同步 Host 配置变更，不能将旧页面的残留入口视为仍可调用的插件。

本轮静态检查包括 pnpm typecheck、npm pack 触发的完整构建和 git diff --check。安装包包含编译产物与中英文 README，不含测试脚本、人工模型提供者或 Session 数据。编程回归生成的两个临时文件已从工作区移除，导入快照与真实会话记录保留。

第二次热卸载在练习册正文已显示、回答仍运行时触发。assistant/message seq 422 保留 11190 字符 reasoning 和 4962 字符正文，标记 interrupted；seq 424 为 aborted / disposed。两次卸载覆盖仅思考与已有正文两种状态。恢复原始 patch 后，source-world-27 已安装到主要 Web 和 Desktop，两个入口 bundle 哈希均与构建一致。Desktop 完全重启显示同一条中断内容，没有自动续写；手动提交短问题后，seq 433 正常回答、seq 435 completed，输入框恢复空闲。热恢复的 blackboard_view 在 seq 403 返回真实 PNG，实际页面核对四条时间线、标签和箭头，未见明显堆叠。

## 已知限制

真实模型曾生成表头 5 列、分隔行 6 列的 Markdown，界面按原文显示；后续正确 Markdown 表格可正常渲染。另一处代码把 console.log('2a'); f(); console.log('2b') 的顺序写错。此类内容准确性不由会话成功回执保证，未通过改写历史或猜测表格结构掩盖问题。

Desktop 原生文件详情全屏工具栏在 120% 缩放时与 Windows 标题栏控件重叠，鼠标退出操作曾隐藏窗口；重新激活同一窗口并用键盘可退出，没有进程崩溃。该宿主界面问题仍在记录中，未扩展 Citer 布局适配去修改宿主标题栏。未逐一穷举所有第三方工具、图像模型和操作系统 DPI。

开发实例进程已经停止；批量删除临时 DSH 目录被自动审批拒绝（仅返回 blocked by policy），目录仍在磁盘。正式 DSH 数据未删除。编程验收生成的临时脚本已按上述记录删除；不随代码提交。
