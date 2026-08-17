# CiteCiter

DSH 会话解释侧边栏插件。本仓库当前包含：

- `DESIGN.md`：调研、原理、流程设计、决策记录（D1–D8 已拍板）。
- `docs/`：探针证据、源码取证、实现里程碑记录。
- `packages/citeciter/`：`@deepseek-ai/dsh-citeciter` 插件包（milestone 0：包骨架 + 最小通路）。
- `probes/`：阶段一的最小可行性探针（保留备查）。

## 快速开始

```sh
pnpm install
pnpm --filter @deepseek-ai/dsh-citeciter typecheck
pnpm --filter @deepseek-ai/dsh-citeciter build
# 本地验证步骤见 packages/citeciter/README.zh.md 与 docs/implementation-milestones.md
```
