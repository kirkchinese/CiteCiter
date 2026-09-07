# CiteCiter

**为 DeepSeek Harness Web 与 Desktop 打造的 AI 输出学习、检查与纠偏插件。**

选中一段已提交的回答，在旁边创建独立 Topic，反复追问、切换模型，或让 AI 用公式、图形、表格和动画逐步讲解。主任务继续运行，学习记录保存在独立日志中。

[English](README.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues)

<p align="center"><img src="https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/assets/hero/citeciter-hero.png" width="100%" alt="CiteCiter 将选中的 AI 回答展开为独立 Topic"></p>

## 0.7 学习工作台（本分支开发预览）

稳定发布为 [0.6.0](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.6.0)，npm `latest` 已指向该版本。本分支为 **0.7.0-beta.1** 开发预览，尚未发布到 npm；下方安装命令仍安装稳定版。

新版学习路线为 **底层逻辑 → 定性分析 → 定量分析（板书）→ 概念关联 → 总结学习卡片**。阶段可以自由选择或跳过，选择后点击发送才开始，也可随时切回自由追问。新建“学习讲解”默认从底层逻辑开始。定量阶段要求注明变量、单位、假设和算例；不适合定量时说明原因。

- 学习栏内有“讲解 / 板书 / 学习卡”三个视图，Topic 改为顶部切换，模型、标题与管理动作按需展开。窄窗口默认收起阶段导航，把空间留给正文。
- 各类 Topic 均可使用板书和学习卡。侧栏板书默认条目阅读，需要看位置关系时切换画布；原生“小黑板”入口保留。
- 总结通过 `learning_cards` 工具保存完整卡片组。重开 Topic 或重启宿主可恢复；再次总结展示最新完整一组，旧组保留在 Topic 记录中。支持 Markdown 导出和通过追问修订。
- **主动回忆可选、默认关闭**。关闭时直接阅读结论和例子，开启后先看问题再展开参考内容。没有间隔复习、到期提醒或打卡。
- 追问建议和板书引用追加到草稿，随后由用户发送。切换 Topic、收起再打开面板保留本页草稿；刷新页面或重启后未发送草稿不恢复。`Ctrl/⌘ + Enter` 发送，Enter 换行。

在独立测试 home 中体验源码：

```powershell
$env:DSH_HOME = "$PWD/.refs/learning-preview"
pnpm install --frozen-lockfile
pnpm build
dsh plugin --profile web add "$PWD/packages/citeciter"
dsh --profile web --host 127.0.0.1 --port 10529 --no-open
```

Desktop 预览需要另一个独立 home，并在实际选择的 profile 中安装本地包。验证与限制见 [0.7.0-beta.1 开发说明](https://github.com/kirkchinese/CiteCiter/blob/codex/learning-workspace-0.7/docs/releases/v0.7.0-beta.1.md)。卡片质量取决于模型；当前没有跨 Topic 搜索、独立手工卡片编辑器、知识图谱数据库或跨端同步。

## 0.6.0 安装与兼容

CiteCiter **0.6.0** 的安装基线是 DSH `0.1.2-rc.1`，Desktop 对应 [DSH Desktop 2.0.5](https://github.com/anywhere-labs/dsh-desktop/releases/tag/v2.0.5)。Node.js 要求 `^22.19.0 || >=24.0.0`；Windows 实测使用 Node 24.19.0。DSH alpha 与 Desktop master 不在此兼容承诺中。

| 环境 | 安装目标 | 状态 |
| --- | --- | --- |
| DSH Web 0.1.2-rc.1 | `web` profile | Windows 实际运行与 UI 验证 |
| DSH Desktop 2.0.5 | Desktop 当前 profile，默认 `desktop` | 适配目标，分模式验证见 release 文档 |
| DSH 0.1.1-rc.1 / rc.2 | 旧环境 | 保留 CiteCiter 0.5.0 |
| DSH alpha、TUI | — | 未支持 |
| Linux / macOS | 相同包 | 0.6.0 Linux CI 通过；Linux/macOS UI 未验证 |

安装或升级 Web 插件：

```powershell
npm install -g @deepseek-ai/dsh@0.1.2-rc.1
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.6.0
dsh plugin --profile web list --depth 0
dsh web
```

确认版本为 0.6.0 后重启相应宿主并刷新页面。也可从 [GitHub Release](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.6.0) 下载 `.tgz`，将安装命令中的包名替换为 tarball 的绝对路径。源码开发使用贡献指南中的本地工作区安装流程。

Desktop 中先确认当前 profile 名称和数据目录，使用**相同的 DSH_HOME**安装：

```powershell
dsh plugin --profile desktop add @kirkchinese/dsh-citeciter@0.6.0
dsh plugin --profile desktop list --depth 0
```

若 Desktop 选择了自定义 profile，把 `desktop` 换成该名称；若使用自定义 home，先在当前 PowerShell 中设置 `$env:DSH_HOME`。重启 Desktop。全局 npm 更新只影响 CLI，Desktop 内置的 DSH 随桌面应用更新。

npm 12 若提示安装脚本被拦截，按此次依赖列表一次性放行并重装；不必改变全局永久策略：

```powershell
npm install -g @deepseek-ai/dsh@0.1.2-rc.1 --allow-scripts=@deepseek-ai/dsh-subprocess-local,koffi,node-pty,@google/genai,protobufjs
```

这解决原生依赖安装问题；旧插件引用已移除的 `effectiveSandboxMode` 则需要升级插件，单独重装宿主不会修复。

## 稳定版 0.6.0 使用流程

1. 选中已提交的助手回答或思考内容，右键输入问题，选择“开始提问”或“开始讲解”。
2. 在右侧学习栏继续追问、切换模型和思考强度，或管理 Topic 标题、归档和删除。
3. 使用 `+ 新 Topic` 创建自由问答或讲解。新的主会话需先发送消息，让 Topic 取得当前模型配置。
4. 讲解内容位于主工作区“小黑板”标签；“引用到提问”会追加到现有草稿。
5. 也可从工具结果、终端结果、差异片段及文本/Markdown Reader 创建 Topic。

<p align="center"><img src="https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/assets/demo/citeciter-0.4.0.gif" width="100%" alt="选中 AI 回答并在 CiteCiter 中继续追问"></p>

上图演示引用流程，录制于旧版；0.6 的宿主布局和控件可能不同。

## 并排学习，不遮挡主对话

- 宽屏为学习栏分配独立列，保留主对话和原生详情栏。
- 保存的面板比例为 28%–55%。空间不足时限制实际宽度，为主对话保留至少 480 CSS 像素；扩大窗口后恢复偏好比例。
- 窄窗口或缩放后无法容纳两列时，学习栏移至下方，主对话仍在上方可见。
- 关闭学习栏后恢复宿主布局。无法识别的宿主仅显示兼容提示。

内容通过 DSH 公开 slots、会话投影和快照 hooks 接入。当前宿主没有公开的右侧 dock 尺寸接口，因此尺寸分配使用集中维护的宿主布局适配器，升级宿主后需重新验收。

## Topic 与数据

Observer 在私有日志中讨论，按需读取来源事件和项目文件；Exact Fork 继承已结束来源轮次的上下文。文件工具保持只读，Topic 不向主 Session 追加事件。未提交的流式文字没有稳定引用坐标；Exact Fork 需等待来源轮次结束。

Presenter 的 `blackboard_apply` 原子提交支持公式、Markdown、表格、安全 SVG、隔离 HTML 动画和内嵌图片。Topic 可继续追问、切换模型、归档、恢复及带 Session ID 确认的永久删除。

Topic 索引在 `$DSH_HOME/citeciter/workspaces/`，日志在 `$DSH_HOME/citeciter/sessions/`；未设置变量时通常为用户目录下的 `.dsh`。升级前备份整个 home。0.6 使用新版会话 API；没有批量重写旧日志。DSH 版本 0 JSONL 的物理 `seedLength` 仍由宿主读取，遇到未知事件应保留原件并诊断，不能删字段绕过。

一个 home 只能由一个活动 CiteCiter 宿主使用。Web 与 Desktop 同时运行时使用不同 home；不要让两者并发写入同一私有存储。更新提醒只复制命令，不自动安装；Desktop 命令使用当前 profile。

## 开发

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm test:snapshot
```

实际应用快照使用临时 profile 与无密钥模型，覆盖 Observer、Exact Fork、来源读取、板书和来源日志不变性。Host API `ctx.citeciterRuntime` 提供 `create`、`ask`、`get`、`list`、`delete` 及 Topic 变化事件。前端入口注册 API 和 preset 扩展仍未稳定。开发流程见 [贡献指南](https://github.com/kirkchinese/CiteCiter/blob/codex/learning-workspace-0.7/CONTRIBUTING.zh.md)，公开变更见 [0.6.0 发布说明](https://github.com/kirkchinese/CiteCiter/blob/codex/learning-workspace-0.7/docs/releases/v0.6.0.md)。

## 社区与许可证

DSH-Citeciter QQ 群：`1108040435`。

<p align="center"><img src="https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/assets/community/qq-group.jpg" width="280" alt="DSH-Citeciter QQ 群二维码"></p>

[MIT License](https://github.com/kirkchinese/CiteCiter/blob/codex/learning-workspace-0.7/LICENSE)
