# 已接纳发送与状态读取分离

本轮沿用 DSH 0.1.5-rc.1、Desktop 2.0.9 和真实来源分支，未增加模型替身、独立 DSH home 或宿主循环补丁。补充验收针对 Topic 草稿切换、附件拒收、发送后断线及视觉教学组合。

代码检查发现 CompanionController 在同一 try/catch 内先调用 nativeComposer.send，再读取 Topic 状态。后者失败时返回 false，使已经被宿主接纳的消息仍留在输入框，并把读取错误保存为粘滞的操作错误。主要 Web 的 source-world-27 已通过真实 DeepSeek 请求复现：仅在 session/prompt 回执 ok 后中断一次 citeciter get，模型完成回答，但原稿和错误仍在。

修复将发送确认和状态观察分开。只有 nativeComposer.send 拒绝时返回 false；接纳后返回 true，后续读取失败交给可恢复的轮询错误处理。旧操作错误只在同一导航 generation 中清除，跨 Topic 的响应仍通过既有身份校验。source-world-28 重复同一网络故障后，原稿清空，真实回答 21 出现，下一次轮询清除错误。临时 CDP Fetch 拦截已清除并释放所有暂停请求，没有持久化测试脚本。

损坏 PNG 的真实宿主回执为 session/attachment-invalid / INVALID_IMAGE。NativeComposer 现在读取 SessionFace.promptError，给出移除或更换附件的说明；其他错误优先保留宿主消息。两次旧包拒收与新包拒收均保留草稿。正常图片的文件选择和剪贴板粘贴已在 Web 观察到独立附件，真实视觉模型组合验收另行记录在验证文档。

原生文件对话框截图可读，但 Computer Use 返回非目标窗口和索引不可用，属于工具控制限制。已停止 Desktop 后切换主要 Web，未并发使用同一 home。文件拖放需要另行实际确认，不能用文件选择器成功替代拖放结论。

真实图片教学进一步复现窄屏截图空白：同一 Topic 的三个板书 revision 返回完全相同的 485×588 PNG。DOM 检查确认实际画布存在三个元素，但继承 visibility:hidden，仍有非零宽高；旧选择器只检查宽度，因而误选被独立页面覆盖的主区画布。新 board-capture-target 模块仅负责同身份、同版本与可见性判断，排除隐藏/透明祖先及视口外节点，交给既有 BoardView 离屏渲染。未修改窄屏导航规则或宿主样式。

source-world-29 的真实 blackboard_view 在窄屏返回 1000×680 的有内容 PNG，宽屏返回可见板书的 747×696 PNG；两者均读出蓝 A=2 秒、绿 B=4 秒及红色完成线。验收者另行查看实际图片，确认模型指出的标签越界、刻度重叠与代码低对比度。代码计算样式为 rgb(242,234,216) 前景搭配 rgb(250,250,250) 背景，原因是固定深绿画布未覆盖宿主浅色 Markdown token。source-world-30 仅在 BoardView 设置 Markdown 背景 token；移除 SVG 的亮度滤镜，避免改变图中声明的颜色。安装后的 DOM 显示背景 rgb(12,33,27)、滤镜 none。

新原生 Topic 没有使用旧 Presenter 专有提示词，其中的深绿画布说明未传给模型；现在在两种运行时共用的 blackboard_apply 工具描述中说明画布、坐标、颜色、边距和截图复查。blackboard_view 明确图片只包含板书及离屏尺寸，避免把截图宽高误当作整个窗口布局。图形内容通过真实模型调用修订，没有直接编辑日志或伪造工具结果。

继续组合验收在 source-world-30 复现图文混合粘贴丢失文字：同一次 ClipboardEvent 携带 PNG 和 text/plain，附件出现但输入框为空。DSH 的原生 InputBindings 会同时接收文件与文字；Citer 现在在存在文字时保留 textarea 默认插入，只在纯图片时阻止默认行为。source-world-31 相同剪贴板复测后，一个附件和完整说明同时出现，切为窄屏后仍保留，用户式 Enter 提交。

附件错误文案只将 INVALID_IMAGE / IMAGE_TYPE_MISMATCH 解释为损坏或格式错误；模型不支持图片、大小或数量超限等错误保留宿主具体消息，不误报为图片损坏。

最终包 source-world-31 已在主要 Web 通过混合图文真实请求、窄屏真实截图、损坏附件拒收及移除后恢复发送，已同步安装 Desktop。两个 profile 的客户端哈希与构建相同，来源日志哈希未变。Desktop 本轮原生窗口检查被工具 foreground window did not report a process id 阻断，重选和激活一次后仍失败，未改用私有 Electron 接口规避限制。继续等待人工拖放结果，不能声称最终 Desktop UI 全部通过。
