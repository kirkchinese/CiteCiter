# 官方 Desktop 后台重启后的浏览器白屏

记录日期：2026-10-07（Asia/Shanghai）。状态：已复现，包含停用 CiteCiter 的对照；未修改宿主、未发布上游 issue。本项仍是已知外部兼容限制，不计为原位重连验收通过。

## 环境与影响

官方 Windows Desktop 及其内置 DSH 均为 `0.2.0-rc.2`，由实际安装的 `app.asar` 中 package.json 核实。可执行程序位于 `%LOCALAPPDATA%/Programs/DeepSeek Harness/DeepSeek Harness.exe`，受查产物位于同目录的 `resources/app.asar`。最初组合中 CiteCiter 为 `0.9.0-alpha.4`，候选包 SHA-256 为 `8873D130520E7900583943A7C363B5DD3A3A4F065DA396C1A90D280DAEC34003`。

受影响的是另一个浏览器客户端：它保持打开官方 Desktop 后台的 `http://127.0.0.1:19387/`，在 Desktop 完整退出并重启后尝试原位恢复。新打开的官方原生窗口正常；旧浏览器页面白屏，手动刷新后恢复。此观察不等于独立 CLI Web 的重连失败，也不等于官方原生窗口启动失败。

## 复现与对照

1. 在官方 Desktop 主来源会话上打开第二个已认证的浏览器页面；浏览器不刷新、不更换 URL。
2. 通过官方应用菜单正常退出 Desktop，确认官方进程退出且端口 `19387` 不再监听，再重新启动官方 Desktop。
3. 新原生窗口正常加载，原浏览器页面在自动恢复期间白屏。
4. 在相同浏览器的插件页停用 `@kirkchinese/dsh-citeciter`，核实开关关闭、Citer 按钮消失；刷新后确认主来源仍显示且没有 Citer，再重复第 2、3 步。无 Citer 时仍出现同样白屏。
5. 手动刷新白屏页面后恢复。带 Citer 的第一次重启前后，保留下来的 45 个来源目录文件逐字节一致；来源会话、其他 Topic 均存在，已授权删除的验收 Topic 7 没有重新出现。

控制台时间为 UTC。首次组合复现的首个致命错误在 `2026-10-07T14:32:59.180Z`；无 Citer 对照在 `14:46:20.115Z` 再次出现 `SlotAssemblyError: scope 'session-maybe' rendered without an installed adapter`。随后分别在 `14:32:59.185Z`、`14:46:20.119Z` 出现 `conversation.input: sessions service unavailable`。再之后才出现 `locale subscriber crashed` / `uiConversation.binding: unknown session`，其中身份是仍然存在的主来源。无 Citer 对照在 `14:46:22.640Z` 同样记录 `cannot get required service slots in inactive context`，因此这个后续异常也不能单凭合并 bundle 中含插件代码就归因于 Citer。

## 已安装产物定位

下表的包路径均位于 `resources/app.asar/dsh/node_modules/@deepseek-ai/`，行号来自安装产物中的对应文件，不是浏览器合并 bundle 的行号。各列包的 package.json 均为 `0.2.0-rc.2`。

| 包内位置 | 已核实行为 |
| --- | --- |
| `dsh-client-ui-renderer/lib/client.js:288–293` | `ScopeProvider` 订阅 `scopeRevision`，读取当前 adapter；缺失时直接抛出本次首个致命错误。 |
| `dsh-client-ui-renderer/lib/client.js:1242–1249` | 根 `ScopeProvider` 包住 `RootOutlet`，位于 `RootOutlet` 内的 Slot 错误边界之外。 |
| `dsh-client-ui-renderer/lib/client.js:1466–1477` | `installScope` 的卸载函数删除 adapter 后立即发布 `scopeRevision`，可以触发仍挂载的根树重新渲染。 |
| `dsh-client-ui-session/lib/client.js:476` | Session UI 服务安装上述 `session` adapter；`session-maybe` 共用它。 |
| `dsh-web-frontend/dist/assets/index-5SrrfWpU.js` | `web boot: application mount` 所属函数仅 `inject(["uiRenderer"])`；没有随着 Session adapter 的暂时撤销卸载 React 根树。此文件经过压缩，按函数文本定位。 |
| `dsh-api-session-controller/lib/client.js:3175–3190` | 清退时先清空 `scopes`，再等待各 binding fiber 的异步释放。 |
| `dsh-client-ui-conversation/lib/client.js:17985–18020` | `refreshViews` 仍遍历已跟踪 binding，并按 Session id 重新读取当前 binding；清退期间可产生后续 `unknown session`。 |
| `dsh-client-locale/lib/client.js:1443–1454` | Locale 发布逐个捕获订阅者异常并记录日志；该日志本身不是最早的白屏原因。 |

实际错误顺序与源码一致：Session adapter 已撤销时根树仍渲染，缺失 adapter 的异常越过根 Slot 错误边界，随后旧输入和视图订阅者继续访问正在撤销的服务。无 Citer 对照表明该路径不依赖 CiteCiter。Citer 的删除逻辑只释放自己的会话对象，不删除或释放宿主来源 Session；没有对宿主 Agent Loop、renderer 或 Session Controller 应用补丁。

## 处理边界

当前可用恢复方式是刷新仍连接旧后台的浏览器页面；官方原生窗口重新启动正常。不能据此将自动原位重连标为通过。后续应由宿主在 adapter 撤销前卸载依赖它的根树，或明确支持 adapter 暂不可用时的安全渲染与恢复；Citer 不以复制宿主私有实现、替换根渲染器或修改宿主包来掩盖此问题。

本次已安装的 CLI Web `0.2.1-alpha.1` 中仍能找到同类无条件视图恢复循环，但这只是静态观察，不证明该版本具有相同白屏，也不证明未来版本已经修复。其他插件仍在对照环境中，尚未进行零扩展的独立宿主复现；此限制不影响“停用 Citer 后仍复现”的结论。完整验收状态见 [官方 Desktop 验收记录](../validation/2026-10-07-official-desktop.md)。
