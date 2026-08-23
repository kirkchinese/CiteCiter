# Agent Note：Desktop 覆盖抽屉与生命周期所有权

状态：生命周期与选区部分已实现；面板布局由[可逆宿主 grid 兼容适配器](2026-08-23-reversible-host-grid-compatibility-adapter.zh.md)取代

取代：[当前 DSH 版本线与 Desktop 源码壳支持](2026-08-22-current-dsh-and-desktop-source-shell.zh.md) 中的当前 Desktop 目标与验收声明。其 rc.1/rc.2 包范围和 dataelement 历史证据仍然有效。

## 问题

CiteCiter 把面板注册到 `shell.overlay`，却随后改写 overlay 父元素的 grid 列并隐藏官方 details 拖动柄。Desktop 拥有该 frame，包括 caption row、details 列和 resize handle。Host 与 Client 卸载也只请求取消而没有等待全部已接纳异步工作，安装说明则只写入 Web profile。

## 决定

面板是自包含的右侧覆盖抽屉。它只修改自身宽度，视口至少为 1080 像素时使用 `panelWidthPercent`，低于该断点时使用固定的响应式覆盖布局。它不关闭 details，也不改写宿主 frame。

DSH 选区解析依赖已声明的 `dsh-client-ui-conversation` 包。Read Frog 私有标记存放在独立的 best-effort 适配器中，仅在其完整标记集同时存在时启用。只有在解析出 assistant 选区后才阻止右键默认行为。

Host 与 Client 所有者先停止接纳，再取消可取消工作、抑制迟到发布，并在释放返回前等待每个已接纳操作。所有 registry 贡献都使用 Cordis effect。

CiteCiter 0.4.1 的目标是 anywhere-labs DSH Desktop 2.0.2，对应 tag commit `9d18856ddea4f20eb3ef8c88b0436921c6b19606`，内置 DSH commit `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`（`0.1.1-rc.2`）。正式 Desktop 安装到 `desktop` profile，并自带 Node.js、pnpm 和 DSH。peer 范围仍为 `>=0.1.1-rc.1 <0.1.1-rc.3`。

## 考虑过的方案

**使用官方 details 列。** 这会替换宿主内容，而不是增加用户已选择的常驻学习抽屉。

**继续改写宿主 grid。** `shell.overlay` 只授予叠加的浮动表面，不授予 Desktop frame 几何结构的所有权。

**增加 Desktop 专用适配层。** Desktop 加载标准 Web Client 插件；私有适配层会增加耦合，却不增加新能力。

## 结果

同一份 Client bundle 服务于 DSH Web 和 Desktop。Desktop 随机 loopback 端口可能因 localStorage 按 origin 隔离而丢失仅存于浏览器的“上次查看”指针；Host Topic 仍持久存储，CiteCiter 回退到最近更新的 Topic。固定 Desktop 端口可精确恢复上次查看的 Topic。

同一候选 tgz 必须取得 Windows x64 和 macOS universal 安装包证据，才能声明 Desktop GO。任意平台证据缺失都使 0.4.1 保持 BLOCKED/NO-GO；旧 dataelement Linux 源码壳结果只是历史条件证据。
