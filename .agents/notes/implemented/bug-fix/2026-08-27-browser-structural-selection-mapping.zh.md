# Agent Note: 浏览器结构化选区映射

状态：已实现

## 问题

Chromium 跨段落、列表项和嵌套列表生成的选区文本，与 Markdown 投影使用的分隔符并不一致。浏览器可能省略列表项分隔，或在映射器插入空格的位置生成换行，导致有效的多块回答选区找不到引用候选。跨 flow 选区还会把 DSH reasoning 投影写入 `sourceHintText`，而 Host 只校验已提交的正文块。

## 决策

只把 Markdown 映射器自行插入的分隔符标记为 synthetic。精确匹配和空白压缩匹配仍然优先；最后一级回退允许 synthetic 分隔符匹配零个或多个浏览器空白字符，同时保留原始 Markdown 偏移。回答正文自身的空白仍须精确匹配。

收集已提交 DOM 正文时跳过 DSH reasoning 和 Read Frog 翻译投影。

## 备选方案

没有采用删除两侧全部空白的方案，因为它会把 `foo bar` 与 `foobar` 等不同正文错误映射到一起。

## 影响

跨列表和嵌套块的选区能够映射到一个权威 Markdown 范围，跨 flow 提示也只包含已提交正文。Citation 请求、Topic 文件与 Session 格式均不变。
