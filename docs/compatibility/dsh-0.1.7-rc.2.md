# DSH 0.1.7-rc.2 适配

本文保留 DSH Web `0.1.7-rc.2` 的历史接口迁移与修复记录，不代表当前官方桌面版或更新 SDK 的兼容结论。

## 接口核对

参考 [RC2 发布说明](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.7-rc.2)以及同一标签下的 AGENTS.md 和 docs/architecture.md。安装产物是编译与运行接口的依据，GitHub compare 的前 300 个文件不能代表完整差异。

Agent 创建、原生 SessionFace、附件发送、设置镜像与独立 Session 工厂继续通过既有适配层调用。RC2 的工具审批增加可选 displayReason；Citer 保留宿主审批服务，不建立第二套审批规则。Session 的 request/header.startsSeries 说明扩展到所有 reason，Citer 不改写原生日志。宿主 Coding Tools 的默认模式变化不覆盖用户明确要求的 Citer 默认只读。

当时全部 DSH 开发依赖与 dsh-util-values 运行依赖固定到 0.1.7-rc.2。发送方式覆盖值改为显式检查 null；该修复不改变 Enter、Ctrl+Enter 或宿主 busyEnter 设置的含义。Web SDK 的 Host/Client 类型检查通过。

RC2 的原生 selectModel 会拒绝目录中不存在的历史模型。Citer 的模型、思考强度及组合设置先取得宿主接受结果，再更新自身元数据，避免失败后界面仍显示已保存。新建 Topic 遇到历史模型下架时保留草稿，显示提示并禁止发送，用户明确选择可用模型后才恢复，不自动换用另一个模型。

## 连接插件

主 Web Profile 当时更新到上游 dsh-codex-connect 0.1.0-alpha.4.52，安装文件与 npm 包一致。旧 4.47 / RC2 的精确版本例外已撤销；没有修改连接插件源码、Agent Loop 或模型权限。生成图片与 view_image 是两个独立能力开关，不能把开启生成视为同时启用本地图片读取。

安装时 pnpm 报告 @google/genai 与 protobufjs 安装脚本未决；仅为这两个已列出的依赖设置 profile allowBuilds，重新安装成功，未全局放开脚本。

## 已知限制

RC2 的 pwsh-local 仍添加 System.Text.UTF8Encoding 构造语句；此前 Windows 只读受限语言问题未得到上游修复。详见 [PowerShell 记录](pwsh-readonly-encoding.md)。不能用正确算术输出替代无错误的工具验收。

本机一次 prepack 在 normalize-bundle 写 lib/client.js 时返回 UNKNOWN。文件为普通 Archive 属性，无活动构建进程；独立归一化和完整重试成功。尚未确定临时占用者，不能宣称已根治。最终产物及实际功能结果见 [RC2 验收记录](../validation/2026-09-24-rc2.md)。
