# `@deepseek-ai/dsh-citeciter`

CiteCiter 是 DSH Web 的浏览器插件。选中助手回复中的文本，右键点击 `Citer!`，即可在可调宽的 `details` 右栏中查看解释。

## 行为

- 只处理 `assistant-step` 会话节点内的选区。
- 先用 DOM anchor key 在当前会话 snapshot 中查找节点，再用该节点的 `anchorSeq` 在对应的已完成轮次边界 fork 当前会话；不会把会话 key 开头的 kind 长度误当成事件序号。子会话打开但不会成为当前会话。只有 `/permission read-only` 成功且命令确实匹配后，插件才向该子会话发送解释提示词。仅当父会话与解析后的 anchor 都未变化时才复用现有子会话。
- 插件不向父会话写入内容。子会话独立拥有提示词、模型回复、取消动作和错误。
- 面板流式渲染 Markdown、KaTeX 和代码。完整且安全的 `svg` 围栏作为惰性 data-URI 图片渲染；完整 `html` 围栏在禁脚本、禁网络的 sandbox iframe 中渲染。被拒绝或未闭合的围栏仍按普通 Markdown 代码块显示。

## 模型体验

模型只在 fork 出的解释子会话中收到解释提示词。模型回复和任何工具请求都属于该子日志；父会话的 transcript 与模型上下文保持不变。

## 构建与测试

```sh
pnpm install
pnpm --filter @deepseek-ai/dsh-citeciter typecheck
pnpm --filter @deepseek-ai/dsh-citeciter test
pnpm --filter @deepseek-ai/dsh-citeciter build
```

## 本地验证（临时 DSH_HOME）

```sh
ln -sfn "$(pwd)/packages/citeciter" /tmp/citeciter-dsh-home/profiles/node_modules/@deepseek-ai/dsh-citeciter
node packages/citeciter/dev/seed-smoke-session.mjs /tmp/citeciter-dsh-home "$(pwd)"
DSH_HOME=/tmp/citeciter-dsh-home dsh --profile web \
  --patch "$(pwd)/packages/citeciter/dev/patch.yml" --port 3907
node packages/citeciter/dev/smoke.mjs http://127.0.0.1:3907 'CiteCiter' \
  /tmp/citeciter-dsh-home/citeciter-smoke.json
```

seed 脚本写入一个含真实 `14:assistant-step1:1` anchor 的完整已结算轮次；浏览器 smoke 必须从该实际会话节点选区，不再插入伪 DOM fixture，并验证整个交互前后父日志的文件 revision 未变化。

## 实时浏览器开发

1. 将插件链接到临时 Web profile，并通过 `dev/patch.yml` 挂载。
2. 启动该 DSH Web profile，并至少打开一次它的 URL；Web profile 会挂载 Cordis client-HMR 的 Host 与浏览器插件。
3. 在本工作区运行 `pnpm --filter @deepseek-ai/dsh-citeciter dev`；该命令先构建，再同时监听 declaration 模块和浏览器 bundle。

DSH Host 检测 bundle 变化后会发送 `/plugins/events` rebuild 帧，浏览器随后替换 CiteCiter 的 Cordis fiber。插件内 React 与面板状态会重置，DSH 持有的会话数据不会重置。只有修改 DSH 自有 client package 源码时，完整的 DSH 源码检出目录才需要运行它自己的 `pnpm run dev:web`；已安装的运行时包没有开发脚本。Web shell 变更仍需重新构建 Web 产物并刷新现有 URL。

开发服务器已挂载插件时，可运行 `node packages/citeciter/dev/hmr-smoke.mjs http://127.0.0.1:3907`。该脚本以原子替换方式临时修改并还原 bundle，并验证 rebuild 帧、旧 fiber 回收、新 fiber 交互和浏览器错误。
