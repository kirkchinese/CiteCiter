# Codex Connect 兼容记录

2026-09-28 主 Web 使用 DSH RC2 / 上游 Codex Connect 0.1.0-alpha.4.52，不再使用本地补丁或版本例外。Web 完成了真实读取、图像生成、原图编辑和排队消费。本文保留当时 Web 组合的接口迁移与验证边界，不构成更新版本的兼容结论；下述旧 alpha 补丁不应应用到当前版本。

2026-09-24：主 Web 已升级为 DSH `0.1.7-rc.1` 与上游 `dsh-codex-connect@0.1.0-alpha.4.46`，本地补丁已从运行环境撤下。真实模型成功调用图像生成工具，返回一张 1536×1024 PNG，Citer 展示实际图片。下文仅记录旧 alpha 组合的临时修复，不应用到 4.46。

历史适用组合：DSH `0.1.7-alpha.2`、上游 `dsh-codex-connect@0.1.0-alpha.4.41`。本机补丁包版本为 `0.1.0-alpha.4.41.citer.1`，不是上游发布版本。补丁仅用于恢复本轮验收，不代表该插件所有可选能力已支持 DSH alpha。

## 原因与边界

上游包仍注入已移除的 `settingsScope`，会阻止整个页面完成启动；Host 使用的 `settings.installSection` 也不再存在。仅替换服务名不足以恢复设置页：旧 Config 包含函数型 transform，序列化后不能在 alpha 浏览器表单中重建，页面会一直显示“正在加载插件设置”。

当时的临时补丁将客户端接入公开的 `configForms`，使用共享 describe 镜像与插件原有解码器生成稳定快照，写入继续使用宿主的串行队列和版本冲突处理。Host Config 使用 volatile 值，保留服务端校验，并通过 `settings.configure` 注册自有设置页。原服务的订阅改为作用域内每 500 ms 检查一次不可变配置身份；释放插件时清理计时器、订阅与能力注册。

补丁不修改 DSH Agent Loop、权限、审批、OAuth 凭据存储或 TLS 校验，不自动开启任务委派及自动审批。它也不依赖 CiteCiter 的内部实现。

## 重建与回退

从 npm 下载上游精确版本，在独立临时目录解包；从解包后的 package 目录运行 `git apply --check <本补丁绝对路径>`、`git apply <本补丁绝对路径>`，然后运行 `npm pack --ignore-scripts`。停掉主 Web 进程后使用 `dsh plugin --profile web add <补丁包绝对路径>` 安装，再重启 Web。不要修改 npm 全局缓存或替换 DSH 本体。

应用补丁前校验上游文件 SHA-256：

| 文件 | SHA-256 |
| --- | --- |
| package.json | 49d6f602fa667df8972cb9af753a5b92a4934e5911ea25458a7035e12d37bea4 |
| lib/client.js | 4d9b7a981e052001c6f321f33a4a29210d4754bd6ca0ec70f4138e4081704adf |
| lib/src-BWvQQwSp.js | c24a9486c2483189bb7b3bffbf9d881f9fb057ba7018a89cb058aa31514f867c |

本机安装前的配置备份位于 `.dsh/citeciter/upgrade-backups/2026-09-23-alpha/web-cordis.before-connect-local-patch.yml`。回退时先停用 `llm-openai-codex` 条目，再安装上游精确版本；DSH alpha 下不能重新启用尚未适配的上游包。恢复配置只处理该插件条目，不覆盖后续其他设置，不删除登录文件。

本机曾配置 Windows 本地代理，Node 直连 Codex 超时。验收将此插件配置为使用该现有代理，并保留证书校验；没有改变 Windows 网络设置。其他设备应使用自己的已配置连接方式，不复制本机地址。

上游 peerDependencies 仍只声明旧宿主范围，因此安装会显示 peer 警告；本地补丁未把未验证的全部能力声明为兼容。当前仅以下实测组合可作为依据。

## 实际验证

2026-09-23，在主 Web profile 中确认页面启动、设置页加载、模型显示选项保存和恢复、OAuth 已登录状态均正常。Citer 手动选择 GPT-5.6 Luna 后，真实文字问答成功；提交真实 README 和视频封面后，模型正确读取文件中的 B 站链接和图片标题。主对话没有收到 Citer 的附件副本。

DeepSeek 真实模型能调用 `codex_connect_image_generate`，失败记录与错误可见；图像请求发生网络连接重置 `ECONNRESET`，没有返回图片，现有证据不能区分代理和上游原因。未宣称生成成功，也未把已有封面当成生成结果。用于定位的临时诊断已从补丁移除。

图像生成完成、生成图下载、搜索、上下文压缩、额度回退、任务委派及自动审批尚未作为此补丁的通过项。普通问答成功不能替代这些能力的验收。上游正式适配后应移除本地补丁并重新验证。

0.9 预发布不包含已退役的 4.41 临时补丁文件；当前使用未修改的上游 4.52。本文保留当时的接口迁移说明与验证边界。
