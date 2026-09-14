# 文件拖放的接收边界

用户在主要 Desktop 复现：文件拖入 Citer 后，主对话同时获得一份副本。用户确认整个 Citer 面板接收当前 Topic 的附件，而非仅输入框。拖放仍只准备草稿，发送由用户触发。

已安装的 @deepseek-ai/dsh-client-ui-attachment 0.1.5-rc.2 在 document 冒泡阶段监听 dragenter、dragover、dragleave 和 drop。旧 TopicComposer 仅调用 preventDefault，未停止冒泡，原生 onDrop 又调用主对话的 onAddFiles。Citer 的 createDrafts 原本就使用准确 Topic Session ID，问题不在附件存储共用。

新增 client/file-drop.ts 管理完整文件拖放生命周期，物理面板内的文件事件停止向 document 传播，文字拖放保持原行为。React portal 从面板外传回的事件通过 DOM contains 校验排除。取消监听只在面板打开时注册，关闭和卸载时清理。文件选择、粘贴和拖放共用 CitePanel 的单一附件回调，TopicComposer 不再重复监听 drop。

FileDropHint 仅显示接收的 Topic，无服务发现或业务状态，且不截获指针。没有可用 Topic 时显示不可接收提示，并阻止文件落入背后的主对话。未修改宿主监听器、Agent Loop、Session 持久化或权限。

source-world-32 完成 pnpm typecheck 与 npm pack 的完整构建，并安装到主要 Web 和 Desktop profiles。两边 client.js 与工作区 SHA-256 均为 5331DF06DC55818464E7C275021C0AE4FEF79FF14388CB1B3C11687FF3ECE8BF。来源日志哈希保持 B24A20D3427B8F3C85BE1484889F65DE92F68500276545C433AD10D4E2296036。Desktop 重启后同一真实 Topic 的历史、权限和输入框正常显示，没有自动发送。

Computer Use 已恢复主要 Desktop 的原生截图。资源管理器跨窗口拖动被工具拒绝为目标坐标超出窗口边界；没有用合成事件或文件选择器成功替代真实拖放验收。已请求用户分别拖入 Citer 和主对话，并检查越过边界后不重复添加、提示正常消失；结果待补充。未创建临时脚本、模型替身或独立 DSH home。
