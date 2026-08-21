# `@kirkchinese/dsh-citeciter`

**服务于进行中 DeepSeek Harness 对话的独立学习伴侣。** 在一次已经提交的助手模型调用中选中文字，就地提问；来源 Agent 可以继续工作，讨论则在独立的 CiteCiter Topic 中多轮进行。

[English](README.md) · [GitHub](https://github.com/kirkchinese/CiteCiter) · [问题反馈](https://github.com/kirkchinese/CiteCiter/issues)

> **开发状态：** v0.3 用独立 Observer Topic 取代了普通 DSH 子 Thread。API、存储、兼容范围和安装方式仍可能变化。

## 安装

需要 Node.js `^22.19.0 || >=24.0.0`、DSH Web `>=0.1.0-rc.7 <0.1.0-rc.8`（当前验证线为 `0.1.0-rc.7`）和已经配置的模型提供方。

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.3.0
```

安装或升级后，请重启对应的 DSH Web 进程并刷新页面。Host、Typert 描述和浏览器 bundle 都在进程启动时解析。

## 使用

1. 在一次已经提交的助手模型调用中选择文字；外层 Agent 轮次可以仍在运行。
2. 右键，在选区旁的浮层输入第一个问题，然后点击 `Citer!`。
3. CiteCiter 为每次提交创建一个新 Topic，并在宽学习栏中打开它。
4. 继续普通多轮追问，或从 CiteCiter 自己的 Topic 栏恢复旧讨论。
5. 独立调整模型、思考强度、标题、归档状态和学习栏宽度，不改变来源 Session。

默认模式是 Observer。Exact Fork 是来源轮次已经结束时使用的高级模式；`exact-when-available` 在不存在稳定 fork 边界时使用 Observer。

## v0.3 已实现能力

- **模型调用级引用。** 已提交的 `assistant/message` 足以创建 Observer Topic，不需要等待 `turn/end`。
- **精确 Markdown 选区。** 渲染后的可见选区会通过 GFM 源位置映射回原始 Markdown；强调、删除线、链接和代码中的引用都保留 Host 可复验的 UTF-16 范围，UI 仍显示用户看到的文字。
- **一次提交一个 Topic。** 即使选区相同，再次提交也会创建另一条独立对话，不会静默复用旧讨论。
- **独立的标准 DSH Session。** Topic 在 `$DSH_HOME/citeciter/` 下使用 DSH Session、Agent Loop、工具、标题和持久化服务，不进入普通 Session 列表。
- **绑定来源的 Observer 证据。** Topic 专属的 `read_source_session` 只读取固定来源 Session 的结构化已提交事件，记录实际捕获 seq，并且不向模型暴露物理 Session 文件。
- **独立标题和模型控制。** 新 Topic 复制来源模型路由，在首问后通过 DSH 标题流程生成标题，之后可以独立切换模型和思考强度。
- **来源与界面设置。** DSH 设置页可以配置默认上下文模式、来源 reasoning、可选的只读来源文件访问、学习栏宽度和是否恢复上次 Topic。
- **只读执行。** 独立 Agent 使用 read-only sandbox。只有 `read_source_session`，以及启用且可用时的标准文件 `read` 工具会提供给模型。
- **独立生命周期。** Topic 可以恢复、重命名、归档、取消归档、停止和继续，而不导航或写入来源 Session。
- **安全富文本。** Markdown、代码和 KaTeX 正常渲染；保守的 SVG 与沙箱 HTML 处理会在内容不完整或不安全时显示源码。

## 模型输入结构

```text
system：Topic 作用域的 CiteCiter Tutor 与只读策略
history：该 Topic 自己的 DSH 历史；只有 Exact Fork 额外带冻结前缀
user context：持久 Citation 记录，并明确标记为不可信证据
tool result：按需读取的有界来源 Session 或来源工作区证据
user：用户真正输入的首问和后续问题
```

来源文本、reasoning、工具参数、工具结果和工作区文件始终是不可信证据，不会获得 system 权限。产品与存储决定见 [ADR 0002](https://github.com/kirkchinese/CiteCiter/blob/main/docs/architecture/0002-observer-learning-companion.zh.md)。

## 从 v0.2 升级

安装 v0.3 会替换插件代码，但不会改写来源 Session 或 v0.2 fork 出来的 Citation Thread。旧子 Session 仍是普通 DSH 数据，不会导入 v0.3 Topic 栏；新讨论使用 v0.3 独立存储。

请使用 `0.3.0` 这样的合法三段版本号，并检查实际安装结果，不要只依赖包管理器显示的完成提示：

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.3.0
dsh plugin --profile web list --depth 0
```

## 兼容性与限制

- CiteCiter 支持 DSH Web，以及完整位于一个已提交助手 flow 内的选区；暂不支持跨消息或跨 block 引用。
- KaTeX 排版和脚注编号是渲染器生成的 DOM，没有稳定的原文字符坐标，因此直接选中这些元素不会打开 CiteCiter；公式周围的普通文本仍可引用。
- Observer 只能看到已经提交的 Session 事件，不能引用尚未形成 `assistant/message` 的流式片段。
- 只有来源提供方实际记录了 reasoning 且 CiteCiter 设置保持开启时，来源 reasoning 才可读取。
- 来源文件访问要求当前 DSH 组合提供文件系统服务；它始终只读，并且可以关闭。
- 来源 Session 缺失不会删除已有 Topic，但新的来源读取会失败，学习栏会显示来源不可用。
- 界面目前使用中文产品文案，尚无完整国际化和跨平台浏览器 CI。
- DSH 仍处于预发布阶段，后续 DSH API 变化可能要求同步更新 CiteCiter。

## 构建与验证

在仓库根目录运行：

```sh
pnpm install
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
```

仓库跟踪 `packages/citeciter/lib/`。修改源码或构建配置后必须重新构建，并在发布前检查真实 npm tarball。

浏览器开发应使用一次性 DSH home 和动态端口，绝不触碰已经运行在 `3080` 的服务：

```sh
CITECITER_DSH_ROOT="$(mktemp -d /tmp/citeciter-dsh.XXXXXX)"
mkdir -p "$CITECITER_DSH_ROOT/profiles/node_modules/@kirkchinese"
ln -s "$(pwd)/packages/citeciter" \
  "$CITECITER_DSH_ROOT/profiles/node_modules/@kirkchinese/dsh-citeciter"
node packages/citeciter/dev/seed-smoke-session.mjs \
  "$CITECITER_DSH_ROOT" "$(pwd)"
DSH_HOME="$CITECITER_DSH_ROOT" dsh --profile web \
  --patch "$(pwd)/packages/citeciter/dev/patch.yml" --port 0
```

使用命令打印的 URL 进行浏览器检查，并且只停止这个一次性进程。

## 贡献与许可证

请到 [GitHub](https://github.com/kirkchinese/CiteCiter) 提交 Issue 或 Pull Request，并先阅读仓库 [AGENTS.md](https://github.com/kirkchinese/CiteCiter/blob/main/AGENTS.md)。

MIT © CiteCiter contributors
