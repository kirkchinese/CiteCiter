# Windows 原生控制入口修正

日期：2026-09-12。范围：恢复 Desktop 原生 UI 验收，修正文档，不修改 CiteCiter 运行代码或 Codex 配置。

## 决策

Windows 原生操作使用已安装 Computer Use 技能指定的 node_repl 与 @oai/sky。统一 CUA 的 browser-only 范围只说明该入口不提供原生接口，不能推断整个任务没有原生控制能力。先检查实际工具清单和技能，再判断能力缺失；不修改自动生成的插件清单，不直接调用辅助进程或私有管道。

## 证据

当前 Codex Windows 包为 26.903.9818.0，内部插件版本为 26.903.71938。只读检查应用的能力分配逻辑：统一 CUA 的 computer surface 在 macOS 条件下注册；Windows 专用 node_repl 单独注册 sky 服务。当前启动日志记录 computer-use native pipe startup ready。工具清单包含 mcp__node_repl__js；按技能初始化 @oai/sky 后，list_windows、list_apps、launch_app、get_window、activate_window、get_window_state、click 和 drag 均成功。

实际启动已安装的 DSH Desktop 2.0.9，在首页执行不发送模型请求的界面检查：打开 CiteCiter、侧边切换悬浮、拖动并恢复悬浮窗位置、切回侧边、关闭后主区域恢复宽度、重新打开后再次关闭。截图与控件树确认各状态。最终保留 Desktop 运行，学习栏关闭，与启动后的首页布局一致；未编辑来源会话或切换项目。此检查使用日常安装验证原生控制链路，不作为隔离 Topic 数据验收。

输入后的即时截图有时早于 React 更新；后续观察确认了变化。应在界面渲染完成后重新读取状态，不能因即时截图未变而重复点击。控件索引和截图坐标仅用于产生它们的当前观察。

## 验证与限制

修复的是工具选择与诊断流程，无需重启、重新安装或扩大访问权限。更新中英文贡献指南、Release 及验收记录，并运行 git diff --check。无运行代码变更，不重复执行此前的 178 项测试、类型检查、构建和快照。轮盘完整手势、键盘输入、原生文件预览、明暗主题、DPI、窄窗口、最大比例与原生详情全屏仍未在本次原生检查中验收；不宣称完整用户验收。只推送文档，不发布版本。
