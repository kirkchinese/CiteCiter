# 参与 CiteCiter 贡献

[English](CONTRIBUTING.md)

感谢你帮助改进 CiteCiter。欢迎提交问题报告、范围明确的修复、测试和面向用户的改进。

## 开始之前

- 使用 Node.js `^22.19.0 || >=24.0.0`，以及 `package.json` 声明的 pnpm 版本。
- 基于 DSH Web `>=0.1.0-rc.7 <0.1.0-rc.8` 开发。
- 保持 CiteCiter 为 DSH 外部插件。使用受支持的插件服务和事件，不修改 DSH 核心，也不替换 Agent Loop。
- 大型行为或架构变更请先提交 Issue，确认范围后再开始实现。

## 搭建仓库

```sh
git clone https://github.com/kirkchinese/CiteCiter.git
cd CiteCiter
pnpm install
```

可发布包位于 `packages/citeciter/`。仓库跟踪生成的 `lib/`；修改源码或构建配置后必须重新构建。

## 检查改动

请选择覆盖改动的最小检查集。修改包行为的 Pull Request 在提交前应运行：

```sh
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
git diff --check
```

界面改动还必须使用独立 `DSH_HOME` 和单独或动态分配的端口进行浏览器检查。不得停止或复用他人正在运行的 DSH 进程。

## 文档

- 同步维护 `README.md` 与 `README.zh.md`，内容以用户为中心。
- 包内 README 应与根 README 和已发布版本保持一致。
- 面向公众的更新记录统一放在 `docs/releases/`。
- 不提交产品访谈、设计草稿、内部决策记录、测试报告、本地截图或其他开发过程文档。
- README 不得链接 `docs/` 下的内部文件。

## Pull Request

- 每个 Pull Request 只处理一个明确主题。
- 说明用户可见的问题和修改后的行为。
- 添加一项没有该修改就会失败的最小测试。
- 不提交凭据、`.npmrc`、`.env`、临时 DSH home、生成的 Session、截图或包 tarball。
- 如果修改影响 CiteCiter Topic，请确认来源 Session 保持不变。

提交贡献即表示你同意该贡献按照 [MIT License](LICENSE) 许可。
