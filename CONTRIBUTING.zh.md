# 参与 CiteCiter 开发

[English](CONTRIBUTING.md)

使用 Node.js `^22.19.0 || >=24.0.0` 和 pnpm `11.21.0`。`0.9.0-alpha.4` 候选版以 DSH `0.2.1-alpha.1` 为主 SDK；`typecheck:desktop` 使用官方桌面 SDK `0.2.0-rc.2` 检查同一套 Host / Client 源码。桌面适配只以 DSH 官方应用为目标，不再保证社区桌面版兼容。编译检查与真实模型验收分开记录，实际状态见 `docs/validation/2026-10-07-official-desktop.md`。安装包位于 `packages/citeciter/`。

```powershell
pnpm install --frozen-lockfile
pnpm check:git-entry
pnpm peers check
pnpm typecheck
pnpm typecheck:desktop
pnpm build
pnpm --dir packages/citeciter pack --pack-destination E:/project/CiteCiter/.refs/artifacts
git diff --check
```

`lib/` 是受版本控制的发布产物，源代码修改后必须重建。`pnpm --dir packages/citeciter dev` 仅监听构建，不启动模型或创建测试实例。CI 只检查依赖、类型、构建与打包；不要将静态成功称为功能验收通过。

## 仓库 Git 安装入口

`packages/citeciter/package.json` 仍是 npm 包的权威 manifest。根 manifest 是私有的 Git 安装入口，与内层保持相同包名、版本、运行时元数据和开发依赖，导出与 bundle patch 直接指向 `packages/citeciter/` 内已提交的文件。pnpm 的 Git fetcher 不应用 `publishConfig.directory`，仅增加该字段无法修复 monorepo 插件安装；根目录保留该字段，使 `pnpm pack` 仍输出内层 npm 产物。

修改权威 manifest 后，运行 `pnpm sync:git-entry`，再运行 `pnpm install` 更新锁文件。`pnpm check:git-entry` 检查漂移，并作为构建与 CI 门禁。根命令使用 `pnpm --dir packages/citeciter`；根和内层有意使用相同包名，不要改用按包名 `--filter`，以免递归执行。包括 `dsh-util-values` 在内的宿主模块使用声明的 peer 范围，各编译门分别固定自己的 SDK；不要通过忽略 peer 错误掩盖跨版本冲突。

Git 安装使用已提交的构建产物，不需要根 `prepare` 钩子、嵌套 `file:` 依赖或依赖某个已发布的 CiteCiter 包。修复提交 `f0c30dd99299e4c054f1951a014489364ee7713e` 已公开在 `codex/official-desktop-october` 分支，尚未合并 `main` 或发布新的 Release/npm 包。仅供候选复测的命令为 `dsh plugin --profile web add "git+https://github.com/kirkchinese/CiteCiter.git#f0c30dd99299e4c054f1951a014489364ee7713e"`；这不是已完成完整功能验收的推荐版本。

10 月 7 日的早期记录包括 pnpm `11.7.0` 的真实本地 Git 快照安装，以及官方 CLI `0.2.0-rc.2` 使用 pnpm `11.21.0` 从早期 `f8825a6` 固定提交完成的公开 GitHub 安装。此后官方 Desktop 插件页已实际安装上述 `f0c30dd` 固定提交、立即启用，并在完整退出后重新启动。156 个发布文件（含 149 个 lib 文件）均与该 Git 提交逐字节一致，入口与先前 `636409058e77` tarball 相同；来源、5 个 Topic、5 份普通草稿及附件保持完整。当前是 Git 安装，不把其 156 个文件与 tarball 的 154 个文件混为一项。完整功能矩阵仍未通过；本次后续文档更新不改变已安装固定提交，其 README 正文可与工作树不同。

## 架构边界

遵循 [DSH 架构](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) 和 [插件规范](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md)，同时核对实际安装子包的接口与版本。CiteCiter 是外部插件，不能声称运行了 DSH monorepo 专用门禁。

| 模块 | 责任 |
| --- | --- |
| host-settings-adapter.ts / typert-codec.ts / client/host-ui-adapter.ts / client/host-icons.ts | 独立适配两套固定宿主契约 |
| client/host-source-chat.ts | 通过公开 Client Session/Conversation 接口读取投影，不持有或改写来源历史 |
| session-format-guard.ts | 阻止旧宿主写入较新的原生日志，不重写日志格式 |
| draft-contract.ts / draft-store.ts / client/draft-controller.ts | 草稿版本、附件字节存储、修订号比较保存及精确发送回执核对 |
| model-admission.ts | 继承模型失效时保留 Topic 和草稿，阻止未选模型的发送 |
| client/components/ToolMessage.tsx | 工具详情与直接可见的附件，使用会话授权的读取接口 |
| client/transcript-position.ts | 各 Topic 阅读锚点、手动发送跟随和图片重排恢复 |
| host-session-adapter.ts | 原生 Agent 创建、恢复、权限初始化和作用域贡献 |
| citer-session-world.ts / citer-session-store.ts | 独立原生工厂与实时成员；不向主列表发布 Topic |
| citer-session-access.ts | Citer 模型请求持久化与可逆的 flush 适配；宿主 get / list 保持不变 |
| source-storage.ts / session-migration.ts / owned-session-cleanup.ts | 来源路径、完整日志迁移与所有权受控清理 |
| source-session.ts | 来源观察、释放与已发送附件检查 |
| topic-index.ts | 元数据校验、索引与旧私有日志清理 |
| topic-runtime.ts | Topic 用例编排、工具贡献及旧日志兼容 |
| source-read-tool.ts / topic-prompts.ts | 来源工具契约、分页说明与原生提示词组合 |
| document-tools.ts | 经授权的文档读取／搜索契约、UTF-16 区间、返回预算和续读说明 |
| topic-archive.ts | 按用户消息接收事件恢复归档，区分后续出队、模型与工具事件 |
| board-capture.ts | 截图请求关联、取消、超时和原生附件保存 |
| board-capture-protocol.ts / client/board-capture-controller.ts | 按 Topic 与版本轮询待截图请求，独立于面板和导航生命周期 |
| client/components/BoardCaptureWorker.tsx / BoardCaptureSurface.tsx | 复用真实板书组件渲染截图，不创建模型调用 |
| tool-events.ts / document-access.ts | 原生与 PTC 工具事件适配、已发送文档地址授权 |
| tool-outcome-contract.ts | 无依赖的共享问题状态码，不把 Host 事件类型声明带入 Client schema |
| tool-approval-projection.ts | 仅从唯一明确的工具调用 → 审批请求 → 拒绝决定 → 失败结果关联派生“已拒绝”展示；不改变权限、日志或原始结果 |
| client/native-composer.ts | 适配公开 DSH 附件、发送与队列服务 |
| client/draft-references.ts / selection-references.ts | 真实选文的待发送引用构造、去重和精确序列化 |
| client/learning-route.ts | 学习请求约束与原生 todo 结果读取 |
| client/panel-drag.ts、host-dock.ts | 拖动及宿主布局生命周期 |
| client/components/ | 受控 UI；接收快照与业务回调，不发现 Cordis 服务 |

不要补丁宿主 Agent Loop，不要将 Topic 工作追加到来源会话，不要通过隐式 seed 泄露已从草稿删除的引用。新 Topic 默认只读，显式更改后仍遵循 DSH 权限和审批。迁移旧日志必须逐条核验并保留原副本，不自动扩大权限。

使用作用域 injection、ctx.effect 和 ctx.on；释放事件监听器、观察者、截图请求、对象 URL 和 Agent 工厂句柄。读取外部 JSON 时校验，typed 同进程调用无需重复解码。公开 API 注释说明输入、输出与生命周期。

## 本机安装与真实验收

本轮按用户要求在主要 DSH home 验收。先确认没有另一个 Web / Desktop 进程使用同一 home，再启动或重启目标宿主。不要删除用户会话或通过批量清理扩大范围。开发实例的进程和目录必须逐项确认归属。

使用官方宿主公开的插件安装流程，核对仓库中的实际包位置、入口与依赖。Git 安装与打包安装应分别验收，比较时使用同一最终候选产物。全局 CLI 不会更新官方桌面应用内置的运行时；当前安装方法与限制以官方桌面审计和验收记录为准。

首次打开 Web 使用宿主输出的完整登录地址，成功后通过会话 cookie 访问。登录参数属于凭据，不放进文档或 Git。宿主代码更新后重启，客户端代码更新后刷新。

功能验收必须使用真实模型和真实来源分支，并从实际 UI 操作。覆盖文本、编程、图像、问答、教学、附件组合、权限默认值与切换、模型/思考强度、排队/插话/停止、来源移除、文档分页、归档/恢复、窗口布局和重启恢复。观察实际输出、文件副作用、持久化日志及布局，不能仅依靠脚本判定。

不保留人工模型提供者、测试夹具或临时测试脚本。临时脚本运行完即删除；验收记录保留操作、结果与限制，不保留会话、凭据、截图或安装包。已提交过的脚本只从当前分支删除，不改写 Git 历史。真实模型回答也可能出错；将知识错误与工程错误分别记录，产品预期不明确时向用户确认。

## 文档与交付

根目录与包目录的中英文 README 保持一致。修改公开行为时同步 Release 说明、JSDoc、`.agents/notes/` 和 `docs/validation/`。图片应标明示意图或真实结果；每段一个物理行，文件末尾一个换行。

仅在明确要求发布时，发布已验收提交对应的检查后安装包。发布后核对 npm 版本、dist-tag 和完整性，并将同一安装包附在对应 GitHub Release。构建安装包不等于发布，也不授权合并分支。

MIT License.
