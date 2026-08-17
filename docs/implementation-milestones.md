# CiteCiter 实现里程碑记录（build/test/headless 实测数据）

## Milestone 0：包骨架 + 最小通路（已完成）

范围：`@deepseek-ai/dsh-citeciter` 标准 dual-face client 包；host half 空壳；
browser half = 选中 `assistant-step` 文本 → 右键 `Citer!`（`shell.overlay`）→
动态注册 `details` 右栏并显示所选文本/anchor → 关闭恢复。不含解释会话。

### 构建（实际运行）

```sh
cd <repo>
pnpm install                                    # exit 0，+206 包，5.7s
pnpm --filter @deepseek-ai/dsh-citeciter typecheck   # exit 0（tsc --noEmit）
pnpm --filter @deepseek-ai/dsh-citeciter build       # exit 0
```

build 关键输出：

```
tsc -p tsconfig.json
tsdown --env.DSH_BUILD_FACE client
[@deepseek-ai/dsh-citeciter] [ESM] lib/index.js        0.42 kB
[@deepseek-ai/dsh-citeciter/client] [CJS] lib/client.js      10.84 kB
[@deepseek-ai/dsh-citeciter/client] [CJS] lib/client.js.map  12.14 kB
Build complete
```

产物契约检查：`lib/client.js` 以
`window.__ModuleLoader__.load({ id: "@deepseek-ai/dsh-citeciter", factory: (require) => {…`
开头；内含 CSS Module 自动注入（`data-plugin-css`）与 `data-citeciter-menu/panel` 标记。

### 挂载（实际运行，临时 DSH_HOME）

```sh
ln -sfn "$(pwd)/packages/citeciter" /tmp/citeciter-dsh-home/profiles/node_modules/@deepseek-ai/dsh-citeciter
DSH_HOME=/tmp/citeciter-dsh-home dsh --profile web \
  --patch "$(pwd)/packages/citeciter/dev/patch.yml" --port 3907
```

boot graph（`window.__DSH_BOOT__`）新增 1 行：

```json
{
  "id": "@deepseek-ai/dsh-citeciter",
  "url": "/plugins/@deepseek-ai/dsh-citeciter/client.js?rev=aad0a4235e83",
  "inject": ["@deepseek-ai/dsh-client-runtime","@deepseek-ai/dsh-client-ui-layout","@deepseek-ai/dsh-client-ui-slots"]
}
```

`GET /plugins/@deepseek-ai/dsh-citeciter/client.js`：HTTP 200，10751 字节，
ModuleLoader factory=True，`Citer!`/panel 标记 True。

### 浏览器 smoke（实际运行，headless Chromium）

命令：

```sh
node packages/citeciter/dev/smoke.mjs http://127.0.0.1:3907 'make me non blank'
```

结果：

```json
{
  "frameBefore": "280px minmax(0px, 1fr) 0px",
  "dispatch": {"defaultPrevented": true, "selectedText": "iemann curvature tensor,"},
  "menuText": "iemann curvature tensor,\nCiter!",
  "panelText": "CiteCiter\n×\niemann curvature tensor,\nkind\nassistant-step\nanchor\n42:assistant-step7\n\n解释会话接入（fork + 只读权限 + 富媒体渲染）将在下一里程碑完成。",
  "frameOpen": "280px minmax(0px, 1fr) 360px",
  "menuAfterClick": 0,
  "frameClosed": "280px minmax(0px, 1fr) 0px",
  "reopenPanelCount": 1,
  "frameReopen": "280px minmax(0px, 1fr) 360px",
  "errors": []
}
```

结论：最小通路全部通过——选中即菜单、菜单点击开栏、360px 详情栏、关闭 0px、
再次打开仍正常、控制台零错误。所有运行均在临时 DSH_HOME，未触碰真实 `~/.dsh`
与本机 DSH 安装树。

### 提交

- `896df03 feat(citeciter): package skeleton with tsdown client bundle build`
- `6c47c08 feat(citeciter): milestone 0 minimum path (selection -> Citer menu -> details panel)`

## 下一里程碑（未开始）

1. fork 子会话 + `child.command('/permission read-only')` + 解释提示词 + 流式渲染（设计 §4）。
2. Cite 会话管理 UI（D3/D7）。
3. 富媒体渲染协议（MarkdownText + SVG fence + 可选沙箱 HTML，D6）。
4. 包测试与 keyless 快照（DSH 测试规范）。
