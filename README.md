# StrategyLab Hackathon MVP

一个无需构建步骤的交互式产品原型，用于演示 Event Contract 策略的低代码录入、确定性评测、证据化建议、冻结验证集复测与测试网部署门。

当前阶段是 UX 与评测闭环原型，不包含真实 DreamDEX 交易。赛题符合度、技术缺口和提交前硬门见 [docs/HACKATHON_COMPLIANCE.md](docs/HACKATHON_COMPLIANCE.md)。

跨设备继续开发时，Codex 应首先读取 [AGENTS.md](AGENTS.md) 和 [docs/SPEC.md](docs/SPEC.md)。前者是仓库工作约定与续做清单，后者是产品、评测 Skill、Agent Memory、DreamDEX 集成及验收规范。

## 运行

```bash
cd strategylab-mvp
python3 -m http.server 4173
```

浏览器打开 <http://localhost:4173>。

也可以执行静态检查：

```bash
npm run check
```

## 低代码交互原则

首版刻意不做自由拖拽画布。用户只需完成四件事：

1. 选择 BTC/ETH 和合约窗口；
2. 选择一个常见指标条件和一个行情过滤条件；
3. 设置方向、单笔金额和连续亏损限制；
4. 点击一次运行评测。

高级参数、Strategy IR 和评测方法默认折叠，避免阻断普通用户主流程。

## 推荐 Demo 路径

1. 展示默认 RSI + 波动率策略，点击 **View Strategy IR**；
2. 点击 **Run evidence check**，解释七个评测 Skills；
3. 指出 `risk-profile` 和 `profit-concentration` 的失败证据；
4. 点击 **Test on frozen holdout**；
5. 展示候选曲线、指标取舍、`VALIDATED` 状态和版本谱系；
6. 点击解锁后的 **Deploy**，说明当前仅生成 DreamDEX Testnet dry-run。

## MVP 边界

- 使用确定性的重建示例数据，不声称是 DreamDEX 协议历史收益；
- 不执行用户上传的 Python；
- 不连接钱包、不广播交易、不使用真实资金；
- 部署按钮仅模拟 testnet dry-run；
- 所有分数和阈值均为产品护栏，不构成金融建议。

## 下一步工程化

- 将 `app.js` 中回测逻辑迁移到独立服务；
- 接入带来源清单的历史合约数据；
- 把每个 Skill 实现为版本化、固定 JSON I/O 的模块；
- 保存 Strategy IR、数据快照、引擎版本和实验父子关系；
- 接入 DreamDEX Bot Kit 的 testnet dry-run 与 receipt/event 校验。
