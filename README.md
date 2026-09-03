# CiteCiter

**为 DeepSeek Harness 打造的 AI 输出学习、检查与纠偏插件。**

选中一段回答，即可在不打断主任务的情况下反复追问、切换模型、建立多个独立 Topic；也可以直接创建自由问答或讲解 Topic，让 AI 在主工作区的小黑板上用公式、图形、表格和动画逐步说明。

[English](README.en.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues) · [加入社区](#社区交流) · [⭐ Star CiteCiter](https://github.com/kirkchinese/CiteCiter)

<p align="center">
  <img src="assets/hero/citeciter-hero.png" width="100%" alt="CiteCiter 娘将选中的 AI 回答展开为多个独立 Topic">
</p>

## 安装

CiteCiter 0.5.0 需要 Node.js `^22.19.0 || >=24.0.0` 与 DSH Web `>=0.1.1-rc.1 <0.1.1-rc.3`。

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.5.0
dsh plugin --profile web list --depth 0
```

确认列表显示 `@kirkchinese/dsh-citeciter@0.5.0` 后，重启 DSH Web 并刷新页面。旧 Topic、设置和来源 Session 不需要迁移或重写。本版本只发布 Web 安装路径；Desktop 适配按计划暂缓。

## 开始使用

- 选中一次已经提交的助手回答或思考内容，右键输入问题，再点击“开始提问”或“开始讲解”。
- 打开右侧 CiteCiter 学习栏，点击 `+ 新 Topic`，选择“问答”或“讲解”。新建的主会话需要先发送一条主对话消息，让 CiteCiter 复用当前模型。
- 在 Topic 中继续追问、切换模型和思考强度，或修改标题、归档、恢复和永久删除。
- 讲解 Topic 的板书显示在 DSH 主工作区“小黑板”标签中；“引用到提问”会把板书内容追加到现有草稿。

<p align="center">
  <img src="assets/demo/citeciter-0.4.0.gif" width="100%" alt="选中一段 AI 回答并在 CiteCiter 中继续追问">
</p>

## 主要功能

- **来源可核查。** 创建 Topic 前重新核对可见选区与已提交回答；来源轮次仍在运行时，也能引用已提交的中间模型调用。
- **旁路讨论。** Observer Topic 独立保存，按需只读来源事件和工作区文件，不改变主 Session 或仓库。
- **多种入口。** 支持助手选区、工具结果、终端结果、代码差异、自由 Topic，以及文本或 Markdown 文档 Reader。
- **讲解小黑板。** Presenter 通过原子 `blackboard_apply` 提交构建公式、Markdown、表格、安全 SVG、隔离 HTML 动画和内嵌图片；失败提交不会破坏上一版画面。
- **完整 Topic 生命周期。** 支持继续追问、模型与思考强度切换、标题修改、归档、恢复和带 Session ID 确认的永久删除。
- **响应式并排界面。** 宽屏时主对话、学习栏和 Topic 导航并排；空间不足时自动收起 Topic 导航或回退覆盖显示。
- **版本更新提醒。** Web 端发现 npm 稳定新版后在右上角提供“更新”“下次一定”“不再提示”；“更新”只复制安装命令，不会自动修改环境。

## 兼容范围与限制

- 已支持 DSH Web `0.1.1-rc.1` 与 `0.1.1-rc.2`；DSH `0.1.0-rc.7` 用户应继续使用 CiteCiter 0.3.2。
- DSH 尚无公开的右侧 dock 扩展点，CiteCiter 使用可逆布局适配；升级 DSH 后需要重新验收。
- Exact Fork 只能从已结束的来源轮次开始；仍在流式输出、尚未提交的文字没有稳定引用坐标。
- DSH rc.2 没有 Session 删除 API，因此永久删除只维护 CiteCiter 私有存储。一个 DSH home 不支持被多个活动 CiteCiter 进程共享。
- Desktop 与 TUI 尚未支持。

## 开发接口

0.5.0 提供 Host 侧 v1 服务 `ctx.citeciterRuntime`（`create`、`ask`、`get`、`list`、`delete`）和 `citeciter/topic-created`、`citeciter/topic-updated`、`citeciter/topic-deleted` 事件。浏览器入口注册、preset 和独立客户端 face 仍在后续 M4/M5 范围内，因此前端扩展接口尚未稳定。

## 开发计划

### 已完成

- [x] **v0.3.1–v0.4.3** Topic 管理、跨轮次选择、模型切换、复杂 Markdown 选区和运行中间输出修复。
- [x] **v0.5.0** EvidenceRef v4、多入口与 Reader、自由 Topic、Presenter 小黑板、Topic 永久删除、Host v1 API、快捷键/提示词设置和 Web 更新提醒。

### 后续

- [ ] 小黑板使用宿主推送替代轮询，并评估手写批注等交互。
- [ ] 完成开发接口 M4/M5：公开入口/preset 注册、客户端 face、兼容矩阵和示例插件。
- [ ] DSH Desktop 适配与插件市场发布。

## 开发与贡献

源码开发需要 Node.js `^22.19.0 || >=24.0.0` 与 pnpm `11.21.0`。

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Topic 数据位于 `$DSH_HOME/citeciter/workspaces/`，Topic 日志位于 `$DSH_HOME/citeciter/sessions/`。欢迎提交 [Issue](https://github.com/kirkchinese/CiteCiter/issues) 和 Pull Request。

## 社区交流

欢迎加入 DSH-Citeciter QQ 群（群号 `1108040435`）。

<p align="center">
  <img src="assets/community/qq-group.jpg" width="280" alt="DSH-Citeciter QQ 群 1108040435 二维码">
</p>

## 许可证

CiteCiter 使用 [MIT License](LICENSE) 开源。
