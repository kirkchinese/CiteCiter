# CiteCiter

**为 DeepSeek Harness 打造的 AI 输出学习、检查与纠偏插件。**

选中一段回答，即可在不打断主任务的情况下反复追问、切换模型、建立多个独立 Topic，用自己的方式理解知识、发现错误，或随时抽查长时程任务是否跑偏。

[English](README.en.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues) · [加入社区](#社区交流) · [⭐ Star CiteCiter](https://github.com/kirkchinese/CiteCiter)

<p align="center">
  <img src="assets/hero/citeciter-hero.png" width="100%" alt="CiteCiter 娘将选中的 AI 回答展开为多个独立 Topic">
</p>

## 安装

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.4.1
```

安装后重启 DSH Web 并刷新页面。

## 开始

选中一段回答。右键，问个问题，然后 `Citer!`。

<p align="center">
  <img src="assets/demo/citeciter-0.4.0.gif" width="100%" alt="选中一段 AI 回答并在 CiteCiter 中继续追问">
</p>

## CiteCiter 能做什么

### 理解与学习

遇到没有看懂的概念、推导或结论时，Citer并让AI解答。

### 比较与纠偏

对一段内容有疑问，Citer并让不同模型帮助你发现遗漏、矛盾和错误。

### 抽查长时程任务

想知道 Agent 在干啥？Citer并了解当前进度、检查方向，看看Agent有没有搞错。

### 发展自己的用法

CiteCiter 希望成为你的底座，围绕你的内容与目标，逐渐形成适合你的用法。

## 主要功能

- **旁观模式。** 从同一段回答开始多个Citer会话，不扰乱主要会话的上下文。
- **切换模型** 单独切换模型与思考强度。
- **持久保存** 保留Citer历史。
- **Agent 能力** Citer会话中的模型可以主动查看来源会话，调查代码仓库。
- **响应式界面** 根据窗口宽度调整面板布局。

## 社区交流

欢迎加入 DSH-Citeciter QQ 群，分享你的使用方法、功能想法和遇到的问题。

<p align="center">
  <img src="assets/community/qq-group.jpg" width="280" alt="DSH-Citeciter QQ 群 1108040435 二维码">
</p>

## 开发计划

开发计划从 v0.3.1 记起，这是 CiteCiter 正式从简陋走向可用的版本。

### 已完成

- [x] **v0.3.1** 管理、归档和恢复。为内部AI增加工具。增加了提问工具。CiteCiter 鲸鱼娘加入 UI。
- [x] **v0.3.2** 增加了跨轮次选取功能。增加了思考强度、模型切换能力。优化了部分用户体验。增加了预测下个问题功能。
- [x] **v0.4.0** 适配新的 DSH rc.1 与 rc.2。修复了若干bug。
- [x] **v0.4.1** 修复了若干bug，完善了UI界面和对话逻辑。

### 未完成

- [ ] **小黑板** 为AI增加一块小黑板，允许AI用 HTML、动画、图像和公式等方式，流式控制黑板上的元素，为用户提供讲解。用户可以边提问边看黑板（老师的既视感）。
- [ ] **更多 Citer 入口** 从工具输出、终端结果和代码差异开始 Citer。
- [ ] **读书和论文** 脱离 AI 对话，从书本、论文等内容开始 Citer。
- [ ] **开发接口** 提供用户可自定义的快捷键和提示词。提供其他插件可调用的通用接口。
- [ ] **DSH-Desktop 适配** 为DSH-Desktop提供适配。并入驻其插件市场。

## 开发与二次开发

需要修改 CiteCiter，可从源码开始。需要 Node.js `^22.19.0 || >=24.0.0`、pnpm `11.21.0`。当前开发基于 DSH rc.2，兼容 rc.1。

```sh
git clone https://github.com/kirkchinese/CiteCiter.git
cd CiteCiter
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

- [`packages/citeciter/src/index.ts`](packages/citeciter/src/index.ts)：Host 入口。
- [`packages/citeciter/src/client/`](packages/citeciter/src/client/)：右键入口、面板和设置界面。
- [`packages/citeciter/src/topic.ts`](packages/citeciter/src/topic.ts) 和 [`topic-runtime.ts`](packages/citeciter/src/topic-runtime.ts)：Topic 数据与运行逻辑。
- [`packages/citeciter/tests/`](packages/citeciter/tests/)：回归测试。
- [`packages/citeciter/lib/`](packages/citeciter/lib/)：构建产物，改完源码后记得重新构建。

Topic 数据放在 `$DSH_HOME/citeciter/workspaces/`，对话日志放在 `$DSH_HOME/citeciter/sessions/`。

现在还没有供其他插件稳定调用的开发接口。想做自己的版本，可以先 Fork 并适时合并。

## 参与贡献

欢迎提交 [Issue](https://github.com/kirkchinese/CiteCiter/issues) 和 Pull Request。

如果 CiteCiter 对您有帮助，请为项目点个 [Star](https://github.com/kirkchinese/CiteCiter)。您的 Star 是我继续开发的动力。

## 许可证

CiteCiter 使用 [MIT License](LICENSE) 开源。
