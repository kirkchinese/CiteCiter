# 参与 CiteCiter 开发

[English](CONTRIBUTING.md)

CiteCiter 是外部 [DSH](https://github.com/deepseek-ai/deepseek-harness) 插件，遵循 DSH 的[架构](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)和[插件规范](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md)，并以所构建的 DSH 版本为准核对接口。产品规则见 [docs/product.zh.md](docs/product.zh.md)。

## 环境与检查

使用 Node.js `^22.19.0 || >=24.0.0` 和 pnpm `11.21.0`。

```sh
pnpm install --frozen-lockfile
pnpm check:git-entry     # 根目录的 Git 安装入口与包 manifest 一致
pnpm check:readme        # 包内 README 与仓库 README 一致
pnpm peers check
pnpm typecheck           # 用主 SDK 检查 Host 与 Client
pnpm typecheck:desktop   # 用官方桌面版 SDK 检查同一套源码
pnpm test                # 单元测试（会先编译）
pnpm build               # 重新生成提交在仓库中的 lib/
```

CI 在 Ubuntu 和 Windows 上运行同样的命令。`pnpm --dir packages/citeciter dev` 监听源码并重新构建，不会启动 DSH。

## 仓库结构

| 路径 | 内容 |
| --- | --- |
| `packages/citeciter/` | 插件本身：`src/`（顶层是 Host 代码，`client/` 是浏览器代码）、`tests/`、`scripts/` 和提交在仓库中的构建产物 `lib/` |
| `packages/citeciter-compat-desktop/` | 私有、只用于编译检查的 manifest，固定官方桌面版 SDK，供 `typecheck:desktop` 使用 |
| 根目录 `package.json` | Git 安装入口，由包 manifest 生成 |
| `docs/product.zh.md` | 产品规则 |

## 两套 SDK 基线

包的 `devDependencies` 固定主 SDK（目前为 DSH `0.2.1-alpha.2`），`peerDependencies` 列出插件支持的全部 DSH 版本。`citeciter-compat-desktop` 固定官方桌面版 SDK（`0.2.0-rc.2`），`scripts/check-desktop.mjs` 用它编译同一套 Host 和 Client 源码。Host 与 Client 是两个独立的 TypeScript 程序（`tsconfig.host.json`、`tsconfig.client.json`），因为两侧声明了同名的服务。

支持新的 DSH 版本时：更新 `devDependencies` 中的 DSH 版本（桌面版更新则改 compat 包），把新版本加入每个 DSH peer 范围，运行 `pnpm sync:git-entry` 和 `pnpm install`，再运行全部检查。只有 `src/` 不再引用某个包时才删除对应的 peer。

## 提交构建产物与 Git 安装

`lib/*.js` 和 `lib/types/**/*.d.ts` 是发布文件，提交在仓库中，Git 安装直接使用它们，不需要构建。修改源码后要先重新构建再提交。`tsc` 为打包器生成的中间文件 `lib/types/**/*.js` 已被忽略。

pnpm 的 Git 安装读取仓库根目录，并且不认 `publishConfig.directory`，所以根目录的 `package.json` 镜像包 manifest，路径指向 `packages/citeciter/`。只修改 `packages/citeciter/package.json`，然后运行 `pnpm sync:git-entry`。根目录脚本使用 `pnpm --dir packages/citeciter`；两个 manifest 同名，不要用 `--filter` 按包名选择。

只修改仓库根目录的 README。`pnpm sync:readme` 生成 `packages/citeciter/README.md`（英文，显示在 npm 上）和 `README.zh.md`，并把相对链接改写到发布标签。

## 架构

行为都放在插件贡献和 DSH 公开的服务上，不修改宿主的 Agent Loop。每个 Topic 都是一个原生 DSH 会话，保存在来源会话的 `citeciter/` 目录中，不出现在宿主的会话列表里。

| 部分 | 模块 |
| --- | --- |
| Host 入口与 Remote API | `index.ts`、`service.ts`、`typert.*.ts`、`host-settings-adapter.ts` |
| Topic 用例 | `topic-runtime.ts`（创建、准入队列、问答、删除、模型路由） |
| 原生会话 | `host-session-adapter.ts`、`citer-session-world.ts`、`citer-session-store.ts`、`citer-agent-registry.ts`、`host-agent-modules.ts` |
| 存储 | `source-storage.ts`、`topic-index.ts`、`topic-deletion-receipts.ts`、`owned-session-cleanup.ts`、`legacy-migration.ts`、`session-migration.ts`、`session-format-guard.ts` |
| 日志投影 | `topic-log.ts`、`tool-events.ts`、`tool-approval-projection.ts`、`message-projection.ts`、`topic-stream.ts` |
| 证据与来源 | `observer.ts`、`citation-mapping.ts`、`evidence-text.ts`、`source-session.ts`、`source-read-tool.ts`、`documents.ts`、`document-tools.ts`、`document-access.ts` |
| 草稿与问答 | `draft-*.ts`、`question-draft-*.ts`、`topic-questions.ts`、`topic-question-bridge.ts`、`blocking-question-recovery.ts`、`question-reply.ts` |
| 板书与学习 | `board.ts`、`blackboard-tool.ts`、`board-capture*.ts`、`learning*.ts` |
| Client | `client/index.ts` 组装各个 controller；`client/components/` 中的 React 组件只接收快照和回调，不自行查找 Cordis 服务 |

有三处有意保留的宿主适配，它们各自隔离在一个模块里，不要扩散：

- `citer-session-access.ts` 在插件运行期间包装宿主的 `sessions.flush`，把 Citer 自己的会话写入它们自己的存储，并通过公开的 `llm/stream` 事件在每次模型请求前做检查点。卸载时恢复原来的 `flush`；宿主的 `get`/`list` 保持不变，因此 Topic 不会进入会话列表。
- `host-agent-modules.ts` 通过 Profile 的依赖解析加载宿主的 AgentLoop、SessionStore、标题服务和 scope 工厂，使桌面版和通过符号链接启动的 CLI 共用同一个模块实例。
- `client/host-dock.ts` 及其 CSS 为面板预留布局空间，关闭时恢复宿主样式。

其他规则：注册都是 effect（`ctx.effect()`、`ctx.on()`），随所有者一起释放；waterfall 监听器除非有意接管请求，否则必须调用 `next()`；在文件、网络和配置边界校验数据，同进程的类型化调用直接信任；模型可见的输入必须能从 Topic 日志重建；读取已保存的设置时逐字段解析，忽略其他版本的字段。

## 测试

`packages/citeciter/tests/` 中的单元测试使用 `node:test`，针对编译输出 `lib/types/` 运行，`pnpm test` 会先编译。测试纯逻辑（引用定位、日志投影、草稿合并、设置与元数据解析），不使用假的模型提供者。

静态检查和单元测试不能证明功能可用。用户可见的改动要在真实 DSH 中用真实模型验证：把打包或 Git 构建安装到一个 Profile，在实际界面中操作，并检查写出的 Topic 文件。同一个 DSH 主目录不要同时运行两个宿主进程。

## 发布

1. 修改 `packages/citeciter/package.json` 中的 `version`，运行 `pnpm sync:git-entry` 和 `pnpm sync:readme`。
2. 把 `CHANGELOG.md` 中 `Unreleased` 下的内容移到新版本和日期下。
3. 运行全部检查、`pnpm build` 和 `pnpm --dir packages/citeciter pack`。
4. 在真实 DSH 中验证打包结果。
5. 指定 registry 和标签发布：`npm publish <tarball> --registry=https://registry.npmjs.org --tag <tag>`。
6. 合并到 `main`，打上 `v<version>` 标签，用同一个 tarball 创建 GitHub Release。

不要提交凭据、`.env`、`.npmrc`、会话数据、截图或 tarball。

MIT License.
