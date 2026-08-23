# Agent Note：可逆宿主 grid 兼容适配器

状态：已实现

取代：[Desktop 覆盖抽屉与生命周期所有权](2026-08-23-desktop-overlay-and-lifecycle.zh.md)中的面板布局决定与发布级 Desktop 验收门禁；其中的生命周期和选区决定继续有效，Desktop 保留为后续目标，适配与验收推迟到原生 Windows 和 macOS 开发环境。

## 问题

公开的 `shell.overlay` slot 是 AppFrame 列求解器之外的浮动层。只使用 overlay 的 CiteCiter 面板会覆盖主对话，无法保持既有的并排学习体验。DSH rc.1 与 rc.2 均未提供可增量贡献的公开右侧 dock 位置。

## 决定

CiteCiter 继续把面板注册在 `shell.overlay`。当所属 AppFrame 能同时容纳最小 360 像素的 CiteCiter 和 480 像素主对话时，版本锁定的兼容适配器会在该 frame 上增加一个带 owner 的 namespaced 属性和两个 namespaced CSS 变量，并以 CiteCiter 宽度替换可见的 details 轨。被隐藏的 details 内容按其紧邻公开 overlay 元素之前的位置选取，而不是依赖子节点序号，因此 Web AppFrame 与含 caption row 的 Desktop AdvancedFrame 都不会隐藏主对话。适配器不注册 `details` slot，也不调用 `ctx.layout.closeDetails()`。

当这两个最小宽度无法同时容纳时，适配器清除宿主写入，并把面板渲染为最大 720 像素的覆盖层。每个挂载实例使用唯一 owner token，旧实例的清理不能删除后继实例的贡献。关闭、卸载和 HMR 清理只移除本实例拥有的属性和变量。

## 结果

宿主 details 偏好保持不变，但宽屏 dock 打开期间其列与 resize handle 会被隐藏，关闭后恢复。该实现依赖私有 AppFrame DOM 与 CSS，不属于 DSH 公开集成模式；每个受支持的 DSH 版本和 Desktop build 都必须重新进行浏览器验证。

只使用 overlay 的候选仍可作为公共 API 的 A/B 基线，但不再代表当前候选。第一个冻结替代候选在 Desktop AdvancedFrame 验证中暴露了依赖子节点序号的选择器，现已否决。修正后的选择器已有新的包矩阵与组装 rc.2 Web 浏览器证据。一次托管 Desktop 尝试在两种原生 runner 架构上验证了 macOS universal 产物，但未进入候选 UI 流程；Windows runner 则停在验证器自身。当前只有 Linux 验收环境，因此正式 Desktop 浏览器验证按 SKIPPED 记录，不能视为通过。上游 Discussion 请求由 AppFrame 管理的可逆右侧 dock 扩展点；上游提供该公共扩展后，CiteCiter 应删除此适配器。

## 考虑过的方案

**继续只使用 overlay。** 这遵守公开接口，但会在宽屏遮挡来源对话。

**使用官方 details slot。** 这会替换宿主 details 内容，并非增量伴侣表面。

**增加第四条私有 grid 轨。** 当前 details resize handle 按三轨求解器定位，第四轨会使宿主几何关系不一致。
