# 已提交思考内容的选区

## 问题

CiteCiter 只投影 `text` 块，并拒绝 DSH 思考容器内的所有选区。因此，只有思考内容的模型调用和跨越“思考+回答”的选区都无法建立 Citer；外层 Agent 轮次继续运行时，已经提交的中间模型调用也随之不可用。

## 决定

Client 与 Host 按渲染顺序投影已经提交的助手内容：每个 `reasoning` 块后加入渲染器使用的段落间隔，再继续投影 `text` 块。浏览器只排除自动生成的思考折叠标题和其他生成控件；展开后的思考正文可以选择。

只要已有 `assistant/message`，即使它所在的 step 或外层 turn 尚未结束，也可以建立 Citer。仍在流式输出的 chunk 没有稳定的来源消息，继续保持不可选。

## 兼容性

新建 Citation 使用“思考+回答”组合投影。旧版按纯正文投影建立的 Citation 继续通过 Host 的纯正文回退读取。Topic 文件、Session 日志、设置和 Remote 字段均不改变。

本说明只取代 `2026-08-27-browser-structural-selection-mapping.zh.md` 中排除思考内容的决定；旧说明保持不变，继续记录 v0.4.2 当时的实现。
