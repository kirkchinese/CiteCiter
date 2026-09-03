# Agent Note: Web 更新提醒

Status: implemented

## Problem

CiteCiter 发布新版后，使用者需要主动发现 npm 新版本、执行 Profile 插件命令并重启 DSH Web。DSH 0.1.1-rc.2 没有经过认证的运行时包更新 API、活动 Profile 标识、重启 supervisor，也不能热激活变更后的 bundle。若让普通浏览器 Remote 执行 `dsh plugin`，它会通过未认证传输修改身份不明的 Profile，还可能使运行中的 Host 代码与磁盘版本不一致。

## Decision

Host 对固定的 `@kirkchinese/dsh-citeciter` npm `latest` 端点执行有界只读检查。它读取已安装包 manifest，只接受稳定的 `MAJOR.MINOR.PATCH` 版本，拒绝畸形值和预发布版本，并报告 registry 版本是否更新。检查使用固定超时和响应大小上限，不发送凭据，合并并发检查，释放被拒绝的响应 body，缓存成功结果，并只返回稳定失败码，不返回 registry 正文。

更新操作是独立 Typert Remote 方法，不是 Topic 命令。它不创建 Session 事件、不进入 Topic runtime，也不安装包、退出应用或声称某版本已经生效。Web 客户端在设置可用后检查；超过每日间隔后，页面再次变为可见时重新检查。自动检查失败不会进入全局 UI，只写诊断。

发现新版本后，客户端在 `shell.overlay` 中渲染非模态卡片，初始状态严格提供三个操作。`更新` 展示并尝试复制标准 Web Profile 命令，然后说明需要在终端执行命令并重启 DSH Web。`下次一定` 在当前标签页会话内隐藏该版本。`不再提示` 在 CiteCiter 设置中关闭全部更新提醒；不能访问 Host 设置的浏览器改用当前 origin 的浏览器存储。CiteCiter 设置页提供重新开启提醒的入口。

## Alternatives considered

**通过 CiteCiter Remote 安装并重启。** DSH rc.2 不发布活动 Profile 名，也没有特权且经过认证的更新服务；launcher 同样没有重启 supervisor。插件在运行中的 Host 内更新自身还会让已加载代码与安装文件处于不同版本，因此 CiteCiter 保持 Remote 只读。

**把 GitHub Releases 作为第二个版本权威。** npm `latest` 已经标识 `dsh plugin` 当前可以安装的版本。第二个可变来源可能领先或落后 npm，却不能改善更新判断，因此通知只使用一个权威来源，也不渲染远端发布 HTML。

**使用短暂 Toast 或模态框。** 三个操作需要稳定交互，而更新又不紧急到需要阻塞工作区。全局 overlay 可以提供持久提醒，同时不改变对话、详情或 Topic 布局。

**把“下次一定”持久化为按时间延后。** 此处文案表示下一个浏览器会话。按版本使用 session storage 可以跨刷新生效，又不会把临时关闭变成多日策略。

## Consequences

使用者可以收到低干扰的 Web 提醒和可复制的精确包版本，而插件无需获得包管理权限。默认命令使用标准 `web` Profile；使用自定义 Web Profile 时需在执行前替换该名称。提醒只比较包版本，不声明对当前 DSH 的兼容性，因此使用者在安装前需核对新版的宿主要求。手动安装成功后仍要重启 DSH Web 才能生效。

首次包含检查器的版本无法通知仍在运行更旧构建的安装，旧用户需要先手动升级一次；之后发布到 npm 稳定通道的版本可由检查器发现。Desktop 的安装和进程监督不属于本决策。
