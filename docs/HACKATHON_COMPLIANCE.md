# Event Contracts Hackathon 合规审查

审查日期：2026-08-24

## 结论

产品方向符合赛题允许的 **analytics tool / trading application** 类型，但当前提交仅是可交互 UX 原型，**还不满足正式提交要求**。正式版本必须接入 DreamDEX Event Contracts，并在 Somnia 测试网提供可运行原型。

## 官方要求映射

| 官方标准 | StrategyLab 对应能力 | 当前状态 | 提交前验收证据 |
|---|---|---|---|
| Working prototype on testnet | 经评测后生成 DreamDEX dry-run / testnet order | 未实现 | 测试网 URL、交易哈希、receipt/event |
| DreamDEX Event Contracts integration | 市场读取、订单构造、结算与 claim | 未实现 | `@dreamdex-bot-kit/ec-core` 调用与真实 market ID |
| APIs and/or SDKs | live market adapter + execution adapter | 未实现 | SDK 版本、调用日志、错误处理 |
| Clear and intuitive UX | 四步低代码流程 | 已有原型 | 现场完成策略创建和验证 |
| Innovation | Strategy IR、评测 Skills、冻结验证集 | 原型完成 | 可复现评测报告与版本 Diff |
| Adoption / trading activity | 非程序员安全创建 Event Contract 策略 | 待验证 | 用户测试、testnet forward-test 数据 |
| GitHub repository | 公开源码和运行说明 | 本地已准备 | 公开仓库 URL |
| 2–3 minute demo | 失败策略 → 修正 → 验证 → testnet | 未制作 | 视频 URL |

## 与官方 Bot Kit 的边界

官方 Bot Kit 已提供：

- `ec-starter`、`ec-maker`、`ec-passive`、`ec-laddering-bot`、`ec-oracle-follow` 和 `ec-settlement`；
- Event Contract 下单、精度处理、到期、claim 等基础能力；
- 普通 DreamDEX 策略的历史 OHLCV 回测引擎。

因此 StrategyLab 不应重复包装一个现成 Bot。项目差异应明确限定为：

1. 非程序员可用的低代码策略录入；
2. 编译为可审计的 Strategy IR；
3. 发现未来数据、执行假设、风险、参数脆弱和利润集中问题；
4. AI 只生成 Candidate，确定性验证才能授予 `VALIDATED`；
5. 只有通过硬门的版本可以进入 DreamDEX testnet adapter。

## 必须实现的最小链上闭环

```text
DreamDEX live Event Contract
  → 读取 marketId / strike / intervalSec / status / order book
  → Strategy IR 产生 UP / DOWN / SKIP
  → deployment-readiness 硬门
  → DRY_RUN 订单预览
  → Somnia Shannon testnet 下单
  → receipt 状态 + Event 日志校验
  → 到期后 claim 或显示 claimable 状态
```

### 不可省略的 Event Contract 细节

- 使用 Event Contract 专用 `ec-core` / Markets SDK，不走 Spot Pool API；
- 以链上市场状态为准，Indexer 仅作发现和近似显示；
- 使用 `strike`、`intervalSec`，不解析可能变化的 question 文本；
- 价格和数量按 tick/lot 用整数计算，避免浮点精度拒单；
- 每个订单必须设置小于市场到期时间的 `expireTimestampNs`；
- 写入返回后检查 receipt，不能把 resolved promise 当成功；
- 市场按 `marketId` 建状态，不能按会被复用的 pool address；
- 结算后需要主动 claim。

## 黑客松实现顺序

### P0：合规线

1. 接入只读 live market adapter；
2. 用真实市场字段替换页面里的 BTC/15m 假数据；
3. 接入 `ec-core` DRY_RUN，展示规范化价格、数量和 expiry；
4. 用独立测试钱包完成一笔 Shannon testnet 订单；
5. 保存 market、decision、Skill report、tx receipt 和事件验证结果。

### P1：获奖线

1. 实现 3 个真正确定性的 Skills：temporal integrity、risk profile、profit concentration；
2. 冻结一段验证数据并生成 baseline/candidate 对比；
3. 页面只保留四个用户动作：选市场、组合条件、运行评测、部署已验证版本；
4. Demo 同时展示一个被拒绝版本和一个通过版本。

## Go / No-Go

如果无法在提交前完成“真实 live market 读取 + testnet transaction receipt/event”，则不应以当前纯前端原型提交；它会在 Technical Implementation（25%）和正式提交要求上明显失分。

## 官方来源

- 赛题与评分：<https://dorahacks.io/hackathon/event-contracts/detail>
- Event Contracts 文档：<https://docs.dreamdex.io/developers/event-contracts>
- 官方 Bot Kit：<https://github.com/somnia-chain/dreamdex-bot-kit>
- Bot Kit Event Contract 注意事项：<https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/event-contracts.md>
