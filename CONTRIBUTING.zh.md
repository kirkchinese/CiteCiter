# 参与 CiteCiter 开发

[English](CONTRIBUTING.md)

使用 Node.js `^22.19.0 || >=24.0.0`、pnpm `11.21.0`、DSH `0.1.5-rc.1`，Desktop 基线为 `2.0.9`。安装包位于 `packages/citeciter/`，Host / Client 分别通过严格 TypeScript 编译。

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm --dir packages/citeciter pack --pack-destination E:/project/CiteCiter/.refs/artifacts
git diff --check
```

`lib/` 是受版本控制的发布产物，源代码修改后必须重建。`pnpm --dir packages/citeciter dev` 仅监听构建，不启动模型或创建测试实例。CI 只检查依赖、类型、构建与打包；不要将静态成功称为功能验收通过。

## 架构边界

遵循 [DSH 架构](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) 和 [插件规范](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md)，同时核对实际安装子包的接口与版本。CiteCiter 是外部插件，不能声称运行了 DSH monorepo 专用门禁。

| 模块 | 责任 |
| --- | --- |
| host-session-adapter.ts | 原生 Agent 创建、恢复、权限初始化和作用域贡献 |
| citer-session-world.ts / citer-session-store.ts | 独立原生工厂与实时成员；不向主列表发布 Topic |
| citer-session-access.ts | 可逆的原生 get / flush 适配；list 不变，按精确身份路由 |
| source-storage.ts / session-migration.ts / owned-session-cleanup.ts | 来源路径、完整日志迁移与所有权受控清理 |
| source-session.ts | 来源观察、释放与已发送附件检查 |
| topic-index.ts | 元数据校验、索引与旧私有日志清理 |
| topic-runtime.ts | Topic 用例编排、工具贡献及旧日志兼容 |
| board-capture.ts | 截图请求关联、取消、超时和原生附件保存 |
| client/native-composer.ts | 适配公开 DSH 附件、发送与队列服务 |
| client/draft-references.ts | 待发送引用构造和精确序列化 |
| client/learning-route.ts | 学习请求约束与原生 todo 结果读取 |
| client/panel-drag.ts、host-dock.ts | 拖动及宿主布局生命周期 |
| client/components/ | 受控 UI；接收快照与业务回调，不发现 Cordis 服务 |

不要补丁宿主 Agent Loop，不要将 Topic 工作追加到来源会话，不要通过隐式 seed 泄露已从草稿删除的引用。新 Topic 默认只读，显式更改后仍遵循 DSH 权限和审批。迁移旧日志必须逐条核验并保留原副本，不自动扩大权限。

使用作用域 injection、ctx.effect 和 ctx.on；释放事件监听器、观察者、截图请求、对象 URL 和 Agent 工厂句柄。读取外部 JSON 时校验，typed 同进程调用无需重复解码。公开 API 注释说明输入、输出与生命周期。

## 本机安装与真实验收

本轮按用户要求在主要 DSH home 验收。先确认没有另一个 Web / Desktop 进程使用同一 home，再启动或重启目标宿主。不要删除用户会话或通过批量清理扩大范围。开发实例的进程和目录必须逐项确认归属。

Web 使用全局 CLI：`dsh plugin --profile web add <安装包绝对路径>`。Desktop 使用管理终端中的 `dsh plugin add <安装包绝对路径>`，它选择内置 CLI、desktop profile 和 home。全局 CLI 不能替代 Desktop 的保留 profile 管理。

首次打开 Web 使用宿主输出的完整登录地址，成功后通过会话 cookie 访问。登录参数属于凭据，不放进文档或 Git。宿主代码更新后重启，客户端代码更新后刷新。

功能验收必须使用真实模型和真实来源分支，并从实际 UI 操作。覆盖文本、编程、图像、问答、教学、附件组合、权限默认值与切换、模型/思考强度、排队/插话/停止、来源移除、文档分页、归档/恢复、窗口布局和重启恢复。观察实际输出、文件副作用、持久化日志及布局，不能仅依靠脚本判定。

不保留人工模型提供者、测试夹具或临时测试脚本。临时脚本运行完即删除；验收记录保留操作、结果与限制，不保留会话、凭据、截图或安装包。已提交过的脚本只从当前分支删除，不改写 Git 历史。真实模型回答也可能出错；将知识错误与工程错误分别记录，产品预期不明确时向用户确认。

## 文档与交付

根目录与包目录的中英文 README 保持一致。修改公开行为时同步 Release 说明、JSDoc、`.agents/notes/` 和 `docs/validation/`。图片应标明示意图或真实结果；每段一个物理行，文件末尾一个换行。

当前授权仅包括提交与推送开发分支，不包含发布 npm、打标签、合并或创建正式 Release。构建安装包不等于发布。

MIT License.
