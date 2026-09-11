# 参与 CiteCiter 开发

[English](CONTRIBUTING.md)

开发基线为 Node.js `^22.19.0 || >=24.0.0`、pnpm `11.21.0` 和 DSH `0.1.5-rc.1`。Windows 实测为 Node 24.19.0。Desktop 2.0.9 内置同一 DSH；Desktop master 与 DSH alpha 需要另行适配。

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm test:snapshot
git diff --check
```

发布包位于 `packages/citeciter/`，Host 与 Client 分别编译，生成的 `lib/` 纳入版本管理。`pnpm --dir packages/citeciter dev` 直接通过 Node 监视两套 TypeScript 配置和客户端打包，支持 Windows。Host 修改后重启宿主，Client 修改后刷新页面。

## 隔离开发环境

在独立 PowerShell 中启动：

```powershell
$env:DSH_HOME = Join-Path $PWD '.refs/manual-web'
dsh plugin --profile web add "$PWD/packages/citeciter"
dsh --profile web --host 127.0.0.1 --port 10519 --no-open
```

选择空闲端口，一个活动进程独占一个 home。Desktop 使用另一个 `DSH_HOME`，从该环境启动已安装的 Desktop，再在其自带终端运行 `dsh plugin add <源码目录或 tarball 的绝对路径>`。该终端选择 Desktop 内置 CLI、当前 profile 和 home；全局 CLI 不能管理保留的 `desktop` profile。全局 CLI 升级不会同步升级 Desktop 内置运行时。

## 实际应用快照与安装包

`pnpm test:snapshot` 依赖已安装的 DSH CLI，自动创建临时 home、安装插件并挂载无密钥模型。它运行真实来源会话、Observer、Exact Fork、五阶段、板书和卡片，对照 `tests/snapshots/assembled-topic.json`；额外通过公开命令边界验证 Topic 管理、停止与失败恢复、模型提问、重复卡片生成和长文档末页引用，并断言来源日志未改变。第二次启动校验持久恢复。输出目录保留用于诊断，不使用真实 API Key。

脚本在创建 profile 前检查 DSH 包版本。全局 CLI 版本不同时，将 `CITECITER_DSH_BIN` 设置为独立安装的 0.1.5-rc.1 的 `@deepseek-ai/dsh/lib/bin.js` 绝对路径。打包验收也使用该运行时，不修改全局安装。

有意改变输出并审阅差异后，可在该命令环境中设置 `CITECITER_RECORD_SNAPSHOT=1` 更新期望文件，随后移除变量重新回放。不能为了通过失败测试直接重录。

```powershell
pnpm --dir packages/citeciter pack --pack-destination "$PWD/.refs/artifacts"
node packages/citeciter/dev/run-smoke.mjs .refs/artifacts/kirkchinese-dsh-citeciter-0.7.0-beta.3.tgz
```

旧 `dev/seed-smoke-session.mjs`、`smoke*.mjs` 和 `hmr-smoke.mjs` 是 0.5 历史夹具，含旧宿主手写会话和 Linux 路径，不作为 0.6 验收入口。使用真实应用快照与隔离 UI 会话，不要对真实数据运行旧 seeder。

## 变更要求

Topic 使用私有日志和只读工具，不修改来源 Session。公开 UI 注册与版本相关布局适配分开维护；验收最大比例、窄窗口、原生详情栏、关闭恢复和 Desktop 各模式。

同步根目录与包内中英文 README、公开 release 文档和 JSDoc；非简单变更在 `.agents/notes/` 写 Agent Note，这是排除临时设计草稿和本机验收产物规则的明确例外。不提交密钥、临时 home、截图或 tarball。只报告实际运行的检查，区分 Windows 实测与尚未验证的平台。

贡献代码按 [MIT License](LICENSE) 授权。
