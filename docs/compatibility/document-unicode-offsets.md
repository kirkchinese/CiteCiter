# 文档搜索与 Unicode 偏移

CiteCiter 的文档工具使用 UTF-16 code unit 偏移，与 JavaScript 字符串的 length、slice 以及阅读器选区一致。偏移不是 UTF-8 字节数，也不是可见字符数。read_document 的起点包含、终点不包含；search_document 返回的范围可以直接用于读取原文。

## 为什么必须在原文上搜索

İstanbul：文档中的大写带点 I（İ，U+0130）转换为小写后，会变成 i 与组合点两个 code unit。如果先将整篇文档转为小写再搜索，后续命中的下标可能整体右移，无法再直接用于原文的 slice。搜索在原文上执行 Unicode 不区分大小写的字面匹配，保留原始命中的起止偏移；用户输入的正则元字符按普通字符处理。

## 非 BMP 字符

🧭 导航符占两个 UTF-16 code unit。字符串中的表情、部分历史文字和数学符号可能由代理对组成，因此视觉上的一个字符不一定对应一个偏移单位。模型应使用工具返回的 startOffset、endOffset 或 nextFromOffset，不根据屏幕字符数猜测位置。

## 字节预算与续读

read_document 最多返回 50 KiB UTF-8 文本。bytesUsed 是返回文本的 UTF-8 字节数；documentLength 是完整文档的 UTF-16 长度。truncated 表示本次请求范围被预算截断，hasMore 表示文档后面仍有内容。继续读取时使用 nextFromOffset，并省略未知的 throughOffset。明确传入非法范围会收到错误，不静默截取或跳到全文开头。

## 访问边界

搜索和读取只接受已经手动提交到当前 Topic 的文档引用。未发送草稿、阅读器中打开的文件、其他 Topic 的附件不授予读取权限。文档导入后保持原文不变；不通过改写文档或宿主日志来修正偏移。
