# `@kirkchinese/dsh-citeciter`

**基于精确历史上下文的、隔离式学习伴侣。** 在 DeepSeek Harness（DSH）的一条已完成助手回复中选中文字，右键点击 `Citer!`，提出你真正想问的问题，并在持久 Citation Thread 中继续追问；源会话不会被写入。

[English](README.md) · [GitHub](https://github.com/kirkchinese/CiteCiter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues)

> **开发状态：** v0.2.0 引入持久化 Host+Client 架构；v0.2.1 修复了 DSH 将已生效的 read-only 重复切换视为幂等 no-op 时，后续追问准备失败的问题。当前仍处于早期开发阶段，API、兼容范围和安装方式仍可能变化。

## 安装

需要 Node.js `^22.19.0 || >=24.0.0`、DSH Web 和已配置的模型提供方。

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.2.1
```

安装或升级后，请重启对应的 DSH Web 进程并刷新页面。Host 与 Typert 清单在进程启动时加载，因此不能只替换浏览器 bundle。

包声明的 DSH peer range 从 `^0.1.0-rc.6` 开始。focused build 使用 rc.6 包集；v0.2 浏览器全链路也在一个全新启动的 DSH `0.1.0-rc.7` 进程中通过验证。

## 使用

1. 在一条已经完成的助手回复内部选中文字。
2. 右键点击 `Citer!`。
3. 输入自定义首问，或选择一个快捷问题。
4. 在同一 Thread 中继续真实的多轮追问。
5. 通过常驻入口恢复、切换、重命名或归档 Thread。

每条 Citation 都会在所选历史边界创建或复用一个隔离子会话。插件不会切换 DSH 主界面的当前会话，也不会修改源会话日志。

## v0.2 已实现能力

- **精确历史 fork。** 浏览器用 `data-chat-anchor-key` 在源会话 snapshot 中解析真实节点，要求它是已关闭轮次中的最终助手回复，再使用节点的真实 `anchorSeq` fork；绝不从 key 文本猜事件序号。
- **稳定 Citation 身份。** 源会话、anchor seq、UTF-16 精确范围、原文和有界前后文按固定格式序列化并计算 SHA-256。同一回复中的不同选区仍是不同 Citation。
- **四层模型输入。** 受限作用域的 system Tutor、fork 继承的精确历史、持久的 user-role Citation Context，以及真正的用户首问/追问保持不同的权限与持久性。
- **持久多轮 Thread。** 首问和每次追问都是子会话中的普通用户消息。侧栏只展示 Thread 自己拥有的问答/错误，不把继承历史和 runtime-context 内部行混进聊天记录。
- **恢复与组织。** Host projection 驱动常驻入口、按父会话分组的选择器、页面刷新/进程重启恢复、切换、重命名和 DSH workspace 归档。
- **失败即关闭的隔离。** 插件在不导航主界面的情况下打开具体子会话，先要求命令确实匹配，再由 Host 等待 `/permission read-only` 持久成功结算并确认当前 sandbox 仍为只读；随后校验 lineage、边界和 Citation 证据，模型工具执行受显式 allowlist 保护。
- **父日志零干扰。** Citation context、提问、回答、停止、错误和标题都属于子会话。浏览器 smoke 会比较源日志的文件大小和纳秒 mtime。
- **富内容安全。** Markdown、代码和 KaTeX 正常流式显示；完整且安全的 `svg` 围栏成为惰性 data-URI 图片；完整 `html` 围栏进入禁脚本、禁网络的 sandbox iframe；不安全或未闭合内容回退为 Markdown 源码。
- **Fiber 生命周期。** Host Agent 作用域、Client Remote、slot、listener、订阅、动画帧和异步状态都可逆；销毁后的延迟异步结果不能重新安装状态。

## 模型输入结构

```text
system：仅作用于该 Thread 的 CiteCiter Tutor
history：截至所选助手边界的精确源会话前缀
user context：持久、被引用的 Citation JSON（不可信数据）
user：用户真正输入的首问与后续追问
```

即使选中文本包含命令口吻、role JSON、HTML 或分隔符，它也不会获得 system 权限。架构决策与同题同模型真实对比见 [`docs/architecture/0001-model-input-layering.md`](https://github.com/kirkchinese/CiteCiter/blob/main/docs/architecture/0001-model-input-layering.md)。

## 兼容性与已知限制

- 只支持 DSH Web 中已完成的 `assistant-step`；不处理用户消息、输入框或任意页面文本。
- 选区必须完整位于同一助手 flow；暂不支持跨消息或跨 block Citation。
- 归档使用 DSH workspace 全局归档集合隐藏 Thread。CiteCiter 暂无取消归档 UI；归档后再次选择同一 Citation 可能创建新的活跃 Thread。
- 只读工具 allowlist 有意保持保守。`run_code` 只用于 sandbox 内分析；Host 准备阶段会持久确认 read-only sandbox，每次嵌套工具分派仍经过权威 allowlist guard。当前 DSH 未安装的工具自然不可用。
- HTML/SVG 安全策略有意保守，被拒绝的内容显示源码而不执行。
- 暂无设置 UI、完整国际化框架、移动端专项布局和跨平台浏览器 CI。
- DSH 仍处于预发布阶段，后续 API 变化可能要求同步适配。

## 构建与验证

在仓库根目录运行：

```sh
pnpm install
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
```

仓库跟踪 `packages/citeciter/lib/`。构建会先清理过期的顶层 hash chunk，再生成 Host 入口、Client bundle、严格 Typert 清单和 declaration。真实模型分层实验、临时 DSH_HOME 浏览器 smoke、HMR 检查和发布门禁见 [`docs/implementation-milestones.md`](https://github.com/kirkchinese/CiteCiter/blob/main/docs/implementation-milestones.md)。

## 本地浏览器验证

```sh
pnpm --filter @kirkchinese/dsh-citeciter exec playwright install chromium
rm -rf /tmp/citeciter-dsh-home
mkdir -p /tmp/citeciter-dsh-home/profiles/node_modules/@kirkchinese
ln -sfn "$(pwd)/packages/citeciter" \
  /tmp/citeciter-dsh-home/profiles/node_modules/@kirkchinese/dsh-citeciter
node packages/citeciter/dev/seed-smoke-session.mjs \
  /tmp/citeciter-dsh-home "$(pwd)"
DSH_HOME=/tmp/citeciter-dsh-home dsh --profile web \
  --patch "$(pwd)/packages/citeciter/dev/patch.yml" --port 3907
node packages/citeciter/dev/smoke.mjs \
  http://127.0.0.1:3907 CiteCiter \
  /tmp/citeciter-dsh-home/citeciter-smoke.json
```

Smoke 使用真实渲染的 `14:assistant-step1:1` 节点和真实 `anchorSeq: 6`，验证自定义首问、持久投影、恢复、重命名、常驻入口、侧栏宽度、父日志 revision 与浏览器错误。临时 profile 没有模型凭据时，正常的 provider 错误也只会在 read-only、Remote 准备、Citation Context 和真实用户消息全部成功后出现。

## 贡献与许可证

请到 [GitHub](https://github.com/kirkchinese/CiteCiter) 提 Issue 或 Pull Request，并先阅读仓库 [`AGENTS.md`](https://github.com/kirkchinese/CiteCiter/blob/main/AGENTS.md)。

MIT © CiteCiter contributors
