# `@kirkchinese/dsh-citeciter`

CiteCiter 是 DeepSeek Harness（DSH）Web 的浏览器插件。选中已经完成的助手回复，右键点击 `Citer!`，即可在可调宽的 DSH `details` 右栏中查看基于当时会话上下文生成的解释。

[English](README.md) · [GitHub](https://github.com/kirkchinese/CiteCiter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues)

> **开发状态：** v0.1.1 实现了第一条可用通路，但当前仍处于早期开发阶段，很多功能仍然需要完善。API、兼容范围和安装方式可能发生变化，欢迎提 Issue 或提交 PR 共同开发。

## 安装

需要 Node.js `^22.19.0 || >=24.0.0`、DSH Web 和已经配置好的模型提供方。当前开发与验证基准为 DSH `0.1.0-rc.6` client 包。

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.1.1
```

重新启动对应的 DSH Web 进程并刷新页面。然后在一条已经完成的助手回复中选择文本，右键点击 `Citer!`。

## 行为

- 只处理 `assistant-step` 会话节点内的选区。
- 先用 DOM anchor key 在父会话 snapshot 中查找节点，再用该节点真实的 `anchorSeq` 在已完成轮次边界 fork；不会把会话 key 开头的 kind 长度误当成事件序号。
- 子会话打开但不会成为当前会话。只有 `/permission read-only` 执行成功且 DSH 确认命令确实匹配后，插件才发送解释提示词。
- 仅当父会话与解析后的 anchor 都没有变化时才复用子会话。重复请求会先记录已有助手节点，避免把旧回答误当成新结果。
- 插件不向父会话写入内容。提示词、模型回复、取消动作和错误都属于解释子会话日志。
- 面板流式渲染 Markdown、KaTeX 和代码。完整且安全的 `svg` 围栏作为惰性 data-URI 图片渲染；完整 `html` 围栏在禁脚本、禁网络的 sandbox iframe 中渲染。被拒绝或未闭合的围栏仍按 Markdown 代码块显示。

解释子会话是持久 DSH 会话。关闭面板或卸载插件只会解除 CiteCiter 的本地订阅，不会删除或取消已经创建的子会话。

## 兼容性与限制

DSH client peer range 为 `^0.1.0-rc.6`，Cordis peer range 为 `^4.0.1`。发布前已确认所需 `0.1.0-rc.6` 包真实存在于公共 npm registry，并以该版本完成验证；其他 DSH 预发布版本尚未获得相同程度的验证。

当前只支持 DSH Web 和助手回复节点。插件尚无设置 UI、自动子会话清理、移动端专项适配或跨平台浏览器 CI；DSH 预发布 API 的变化也可能要求同步升级 CiteCiter。

## 构建与测试

在仓库根目录运行：

```sh
pnpm install
pnpm --filter @kirkchinese/dsh-citeciter typecheck
pnpm --filter @kirkchinese/dsh-citeciter test
pnpm --filter @kirkchinese/dsh-citeciter build
```

## 本地浏览器验证（临时 DSH_HOME）

先为 Playwright 安装 Chromium，再建立临时 profile：

```sh
pnpm --filter @kirkchinese/dsh-citeciter exec playwright install chromium
mkdir -p /tmp/citeciter-dsh-home/profiles/node_modules/@kirkchinese
ln -sfn "$(pwd)/packages/citeciter" \
  /tmp/citeciter-dsh-home/profiles/node_modules/@kirkchinese/dsh-citeciter
node packages/citeciter/dev/seed-smoke-session.mjs /tmp/citeciter-dsh-home "$(pwd)"
DSH_HOME=/tmp/citeciter-dsh-home dsh --profile web \
  --patch "$(pwd)/packages/citeciter/dev/patch.yml" --port 3907
node packages/citeciter/dev/smoke.mjs http://127.0.0.1:3907 'CiteCiter' \
  /tmp/citeciter-dsh-home/citeciter-smoke.json
```

seed 脚本写入一个包含真实 `14:assistant-step1:1` anchor 的完整已结算轮次。浏览器 smoke 从实际渲染的会话节点创建选区，并验证右键菜单、侧栏开关、父日志文件 revision 和浏览器错误。

## 实时浏览器开发

1. 按上面的方式把包链接到临时 Web profile，并通过 `dev/patch.yml` 挂载。
2. 启动 profile 并至少打开一次 URL；DSH Web 会挂载 Cordis client-HMR 的 Host 与浏览器插件。
3. 运行 `pnpm --filter @kirkchinese/dsh-citeciter dev`，同时监听 declaration 模块与浏览器 bundle。

DSH Host 检测 bundle 变化后会发送 `/plugins/events` rebuild 帧，浏览器随后替换 CiteCiter 的 Cordis fiber。插件内 React 和面板状态会重置，DSH 持有的会话数据不会重置。只有修改 DSH 自有 client package 时，完整 DSH 源码检出目录才需要运行自己的 `pnpm run dev:web`。

开发服务器已挂载插件时，可运行 `node packages/citeciter/dev/hmr-smoke.mjs http://127.0.0.1:3907`。脚本会原子修改并还原 bundle，验证 rebuild 帧、旧 fiber 回收、新 fiber 交互和浏览器错误。

## 贡献与许可证

请到 [GitHub](https://github.com/kirkchinese/CiteCiter) 提 Issue 或 Pull Request，并先阅读仓库 [`AGENTS.md`](https://github.com/kirkchinese/CiteCiter/blob/main/AGENTS.md)。

MIT © CiteCiter contributors
