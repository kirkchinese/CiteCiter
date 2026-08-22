# Agent Note：当前 DSH 版本线与 Desktop 源码壳支持

Status: implemented

## Problem

CiteCiter 0.3.2 有意限定于 DSH `0.1.0-rc.7`。当前 DSH Web 用户与 dataelement DSH Desktop 用户运行较新的 `0.1.1` 预发布线，因此旧 peer 范围会阻止安装，尽管 CiteCiter 在两个宿主中使用的是同一组官方 Host 与 Web Client 服务。

## Decision

CiteCiter 0.4.x 支持 DSH `>=0.1.1-rc.1 <0.1.1-rc.3`。开发依赖固定为 rc.2，CI 则在打包前使用 Node 24 验证 rc.1，并使用 Node 22.19 验证 rc.2。

Desktop 支持直接在 dataelement 承载的官方 Web 开发壳中使用既有 `dsh.client.platform: web` bundle。CiteCiter 不导入 Electron API、Desktop 私有服务或独立适配层。Desktop 支持声明只覆盖 Linux 源码开发壳及其固定的 rc.1 Web profile；macOS 与 Windows 安装器仍未实测。

兼容性变更不修改 Remote API、Topic 元数据、私有 Session 日志、设置字段或权限模型。DSH rc.7 用户继续使用 CiteCiter 0.3.2，不进入未经验证的混合预发布范围。

## Alternatives considered

**不设矩阵而声明宽泛预发布范围。** 安装看起来更容易，但可能在没有可执行证据时放行不兼容的 DSH API 版本。

**创建 Desktop 专属适配层。** 目标 Desktop 已承载官方 Web 应用，额外适配层会重复现有 Client，并在没有新增用户行为的情况下引入宿主私有依赖。

**在一个版本中同时支持 rc.7 与 rc.1/rc.2。** 这能保留单一版本线，但会要求针对快速变化的预发布 API 维护兼容分支。让 rc.7 继续使用 0.3.2，支持策略更小且可验证。

## Consequences

每个 0.4.x 版本都必须保持两条兼容门禁通过。后续 DSH 预发布版本只有在同一套包级、安装和浏览器检查通过，并明确更新 peer 范围后才成为受支持版本。

Desktop 文档必须点名 dataelement 与已测试的源码壳环境，不得暗示其他同名 DSH Desktop 项目或操作系统安装器也已验证。
