# 0.9.0-alpha.1 发布检查

2026-09-28。用户确认将只读 PowerShell 问题作为上游宿主限制，不再阻挡本次 alpha 预发布。代码、安装核对和远端 CI 已完成，GitHub 与 npm next 预发布均已完成；用户手动完成 npm 上传，公开下载包已核验。具体结果见文末；npm next、GitHub prerelease，正式版 latest 保持 0.8.2。

## 发布决定与最终包

最终包为 `.refs/artifacts/kirkchinese-dsh-citeciter-0.9.0-alpha.1.tgz`，SHA-256 `15b722387edf919f86731c855420448bfe876118250b1e1e1ec6d6f2f066813f`，SHA-1 `3473d5e9175cbc78399e56c3bdd5ef78bad9ae3d`。相对第二十二包仅两份 README 改变，全部运行时与声明文件逐字节相同。Host/Client 类型检查与完整 prepack 首次通过；144 个文件与主 Web Profile 完全一致。通过 DSH 安装入口安装，随后恢复唯一主 Web。

用户已清理五个目录；复查 `.refs/dsh-rc1` 仍存在，留作本地清理尾项，不进入包或 Git。未再次执行被拒绝的删除，也未委托 DSH。旧数据备份和源码保留。npm 凭据通过官方 whoami 身份验证，未保存到项目。

## 前序包与宿主

第二十二候选包：`.refs/artifacts/citeciter-rc2-4dcee0711a68.tgz`，SHA-256 为 `4dcee0711a68dd2f3e688b063f8d3243b75ef173290a1ec359b402562769a550`。共 144 个文件，与 Web 主 Profile 逐文件一致。相对第二十包只有两份 README 和 package.json 改变；运行时 JS 与声明文件完全相同。publishConfig 声明官方 registry 和 next；实际发布必须显式指定这两项，见下文。pnpm pack 对 scripts 字段进行发布规范化；除此之外，打包 manifest 与源码一致。

npm 查询：DSH latest/next 为 0.1.7-rc.2，alpha 为 0.1.7-alpha.2；Codex Connect alpha 为 0.1.0-alpha.4.52、latest 为 4.50。本机使用 RC2 与未修改的 Connect 4.52。

## Issue #9

原报告：[0.8.2 在 DSH 0.1.7-rc.2 上 typert 注册失败](https://github.com/kirkchinese/CiteCiter/issues/9)。此报告包含版本闸门拒绝和 Typert 工厂缺失两项，当前候选版均已修复；0.8.2 本身没有因此被修改或变为兼容。

| 核对项 | 实际证据 |
| --- | --- |
| 版本闸门 | 调用 Web 安装产物的 evaluatePluginCompatibility，使用空例外表和 RC2，无不兼容项；Web Profile 的当前 Citer 例外为空 |
| Host manifest | Web 的 validateTypertManifest 接受实际安装的 lib/typert.host.js |
| 具名 schema | 七项均有 create()，返回同一个 schema，保留旧版 schema 字段 |
| Strict codec | request 参数、request 结果、checkUpdate 结果在 Host 与 Remote 两端各有三个工厂，均返回原 schema；合计核对 13 个工厂 |
| 主机依赖 | 以实际安装插件为解析锚点，Web 的 27 个 peer 均可解析且版本满足声明 |
| 实际启动与 RPC | 第二十二包主 Web 重启恢复 Topic 23 的未发送草稿。第二十包同一运行时代码已完成真实模型的文档 RPC 往返 |

以上通过不依赖 allow-version，不删除兼容检查，也不把未验证的任意未来宿主版本加入 peer 范围。Issue 仍保持原状态，没有代用户发表评论或关闭。

四份 README 增加 0.8.2 与 DSH 0.1.7 不兼容的明确提示，旧 Linux 升级提示限定在 0.8.2 的宿主基线，并补齐流程图的未归档条件。Release 草稿关联 Issue #9。

## 发布审计

| 门槛 | 状态 |
| --- | --- |
| 构建与打包 | 完整 prepack 首次成功，Host/Client 编译通过；本轮未复现 UNKNOWN |
| 打包内容 | 144 项全部位于允许的发布清单，无临时脚本、会话或凭据模式命中；语法树核对五条相对运行时导入均存在 |
| 安装一致性 | Web Profile 通过 DSH 安装入口安装，144 项逐文件一致；未共享活动写入宿主 |
| 真实功能 | Unicode、归档路由、活动 Topic 追加和 Web 草稿恢复见第二十轮；历史结果继续保留原包次及具体范围 |
| 只读 PowerShell | 已知上游限制，用户接受本次 alpha 携带该限制发布；未修复、未计为功能通过，不修改权限 |
| 偶发 UNKNOWN | 本轮完整构建通过；历史错误根因未确定，不声称修复或添加无证据重试 |
| 本地旧目录 | 用户清理后五项已不存在；dsh-rc1 仍在，排除于包和 Git，备份保留 |
| Git 与远端验收 | 4b2a89e 经 PR #10 合并为 main 616ea87；Windows / Ubuntu CI 的锁文件、类型检查、构建与打包全部通过。个人 VS Code 配置和既有宣传制作记录未纳入提交 |
| 发布 | GitHub v0.9.0-alpha.1 prerelease 与 npm next 均已完成；公开 tgz 与本地逐字节一致，SHA-1、SHA-256、SHA-512 integrity 通过，latest 保持 0.8.2 |

安装时 pnpm peers check 报告宿主 peers 未列入 Profile 自身的依赖图；实际 DSH 通过共享依赖链接提供它们。Web 实际模块解析和版本核对通过，因此该警告与 Issue #9 的版本闸门拒绝分别记录，没有额外安装第二套宿主单例来消除警告。

原始证据见 [RC2 联调记录](2026-09-27-connect-450.md)、[残余项](2026-09-28-remaining.md)与[只读 PowerShell 问题](../compatibility/pwsh-readonly-encoding.md)。Linux 和 macOS 不在本轮实机通过声明内。

## 发布参数演练

第一轮 tarball dry-run 暴露本机默认 registry 为 npmmirror.com。第二十二包明确声明官方 registry；但省略 --tag 的 tarball dry-run 仍选择 latest，说明不能仅依赖 publishConfig.tag。最后以 --registry=https://registry.npmjs.org --tag next --access public --dry-run --ignore-scripts 检查同一个候选 tarball，输出确认官方 npm、next、公有包，退出码 0。所有演练都有 --dry-run，没有上传。登录提示仍存在；dry-run 不证明正式发布凭据有效。

## 公开发布结果

[PR #10](https://github.com/kirkchinese/CiteCiter/pull/10) 已合并；发布标签 v0.9.0-alpha.1 指向 616ea87a7aecc0d0fca9b2d2eff9b98cc7839675，与通过检查的 4b2a89e249626114d9e2dae5f86e9d259b57a7be 源码树一致。[CI 36416110193](https://github.com/kirkchinese/CiteCiter/actions/runs/36416110193) 的 Windows / Node 24 与 Ubuntu / Node 22.19.0 均通过，Ubuntu 的静态检查不扩展本轮 Linux 功能声明。

[GitHub Release](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.9.0-alpha.1) 已作为 prerelease 发布，未设为 latest；包含 900835 字节 tgz 和 SHA256SUMS，GitHub 报告的 tgz digest 与本地最终包完全一致。Release 初次发布时明示 npm 尚待上传；用户上传完成后已更新为 npm 安装说明。

npm 正式上传命令被自动审批在执行前拒绝，仅返回 blocked by policy，未提供具体规则。没有换工具、CI 或 DSH 重试同一受限动作。提供给用户的本地手动发布助手固定官方 registry、next、公有包和上述 SHA-256，隐藏输入密钥，只向临时子进程提供凭据，结束后恢复环境并清理无密钥配置文件；助手不入库，语法检查通过，未由代理执行。此前官方 whoami 成功，不能据此宣称上传已经完成。

用户随后在本机执行手动发布助手，npm 返回成功和异步处理提示。开头出现本机 `.npmrc` 的 prefix 配置警告，未阻止上传。最初包级元数据暂未显示新版本，随后官方精确版本端点与 dist-tag 查询均确认公开：next=0.9.0-alpha.1，latest=0.8.2。公开 tgz 为 900835 字节，与本地最终包逐字节一致；SHA-1 3473d5e9175cbc78399e56c3bdd5ef78bad9ae3d、SHA-256 15b722387edf919f86731c855420448bfe876118250b1e1e1ec6d6f2f066813f 和 registry 的 SHA-512 integrity 全部一致。手动发布助手使用后已删除，凭据没有入库。

[npm 0.9.0-alpha.1](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter/v/0.9.0-alpha.1) 与 GitHub 预发布指向同一产物；本机 Web Profile 已安装该产物，无需再次替换运行时代码。合并后的 main CI 36416319519 及首轮发布记录 CI 36416726839 均通过。PowerShell 宿主限制与 Linux/macOS 验收边界保持不变。
