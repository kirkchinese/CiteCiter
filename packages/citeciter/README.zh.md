# `@deepseek-ai/dsh-citeciter`

CiteCiter：在 DSH Web 会话中选中助手回复文本，右键 `Citer!`，在可调宽右侧详情栏中打开解释侧边栏。解释会话走独立的 fork 子会话，只读继承主会话上下文、不写回主会话（见仓库 `DESIGN.md`）。

## 当前里程碑（1）

- 标准 dual-face client 插件：host half 为无副作用空壳；browser half 由
  `tsdown` 以 DSH 客户端 bundle 契约构建（`window.__ModuleLoader__.load` 工厂）。
- 已实现：选中 `assistant-step` 文本 → 右键 `Citer!` 浮层菜单 → 打开官方 `details`
  右栏（300–520px 可拖拽）→ fork 独立解释子会话 → `/permission read-only` →
  发送解释提示词 → 流式状态与 `MarkdownText` 回答/错误渲染。
- 未接入：Cite 会话管理 UI（D3/D7）、SVG/沙箱 HTML fence 渲染（D6）、keyless 快照。

## 布局

```
packages/citeciter/
├── package.json            # exports + dsh.client 声明
├── tsconfig.json           # Client aggregate 编译设置
├── tsdown.config.ts        # 调用 scripts/tsdown.client.ts
├── scripts/tsdown.client.ts # 适配自 DSH packages/client/tsdown.client.ts（MIT）
├── src/index.ts            # host half（空壳）
├── src/client/index.ts     # browser plugin body
├── src/client/selection.ts # DOM 选区解析
├── src/client/types.ts     # CiteBus / CiteSelection
├── src/client/components/  # SelectionMenu / CitePanel / CSS Module
└── dev/                    # 本地 patch 与 browser smoke
```

## 构建

```sh
pnpm install
pnpm --filter @deepseek-ai/dsh-citeciter typecheck
pnpm --filter @deepseek-ai/dsh-citeciter build
```

产物：`lib/index.js`（host）、`lib/client.js`（browser factory）、`lib/types/**`。

## 本地验证（临时 DSH_HOME，不触碰真实 `~/.dsh`）

```sh
# 1. 让临时 profile 按包名解析本包（模拟 dsh plugin add 的安装效果）
ln -sfn "$(pwd)/packages/citeciter" /tmp/citeciter-dsh-home/profiles/node_modules/@deepseek-ai/dsh-citeciter

# 2. 启动临时 web（独立端口）
DSH_HOME=/tmp/citeciter-dsh-home dsh --profile web \
  --patch "$(pwd)/packages/citeciter/dev/patch.yml" --port 3907

# 3. 另开终端跑 browser smoke（需要 playwright 可用）
node packages/citeciter/dev/smoke.mjs http://127.0.0.1:3907 'make me non blank'
```

## Model Experience

解释提示词通过普通 `session.prompt` 写入独立的 fork 子会话，主会话零写入。
模型响应只影响子会话上下文；主会话 KV cache 不受影响。
