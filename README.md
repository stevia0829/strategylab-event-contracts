# StrategyLab

> Evidence-based low-code strategy validation for DreamDEX Event Contracts.

StrategyLab 帮助用户把 Event Contract 交易想法转化为可复现的策略实验：通过低代码或 Python 接口定义策略，运行确定性评测 Skills，结合历史实验记忆生成候选优化，并且只允许通过冻结验证集和安全门的版本进入 Somnia 测试网流程。

当前仓库是 **Vite + TypeScript 交互原型**。它完整演示了产品闭环，但回测数据、Agent Memory 和部署动作仍是确定性模拟，尚未连接真实 DreamDEX 市场、钱包或交易。

## 产品工作流

```text
Visual Builder / Python Strategy
                │
                ▼
         Versioned Strategy IR
                │
                ▼
       Event Contract Backtest
                │
                ▼
       Deterministic Eval Skills
                │
       ┌────────┴────────┐
       ▼                 ▼
 Findings & Evidence   Agent Memory
       └────────┬────────┘
                ▼
       Candidate IR Patch
                │
                ▼
       Frozen Holdout Validation
                │
                ▼
      DreamDEX Testnet Safety Gate
```

核心边界：LLM/Agent 可以解释问题、检索历史实验和提出 `Candidate`，但只有确定性验证流程能够授予 `VALIDATED`。

## 当前功能

### 策略录入

- Visual / Python 两种输入模式；
- BTC、ETH 和不同合约窗口选择；
- 44 个内置指标，覆盖价格、趋势、动量、波动率、成交量和 Event Contract 指标；
- above、below、cross、rising、falling、equals、between 等操作符；
- 方向、stake、连续亏损、冷却期和风险参数；
- 受控公式 DSL 自定义指标，并将其加入当前指标目录；
- Strategy IR JSON 预览。

### Python 策略原型

- 固定 `EventContractStrategy` / `decide()` 接口；
- 只读 `MarketContext` 设计；
- 禁止网络、文件、钱包和直接 SDK 调用的产品约束；
- 静态接口验证演示。

当前不会执行用户代码。真正的 Python 运行服务必须使用一次性非 root 容器、无网络、只读镜像、资源限制和固定 JSON 输入输出。

### 分析与评测

- 回测收益、最大回撤、胜率和 Profit Factor；
- baseline / candidate 资金曲线；
- 7 个评测 Skill 的 PASS、WARN、FAIL 展示；
- 按“需关注 / 全部 / 已通过”筛选结果；
- 每个 Skill 展示结论、证据和方法版本；
- 普通语言 Verdict 和单一下一步操作；
- 硬门失败时保持部署锁定。

### Evidence-based Agent

- 根据 Skill findings 生成候选修改；
- 展示匹配到的成功和失败历史实验；
- 说明历史记忆与当前策略的匹配原因；
- 展示候选策略预期改善和覆盖率代价；
- 在冻结 holdout 上复测 Candidate；
- 保留 baseline、validated 和 rejected 实验分支。

Agent Memory、候选生成和 holdout 结果目前使用固定 Demo 数据，持久化与真实检索尚未实现。

## 项目架构

### 当前仓库

```text
strategylab-mvp/
├── index.html                  # 页面结构与产品 Demo
├── styles.css                 # 视觉系统与响应式布局
├── src/
│   ├── main.ts                # 页面状态、策略编译与交互演示
│   └── types.ts               # Strategy IR、Skill、指标等领域类型
├── docs/
│   ├── SPEC.md                # 产品、工程、Memory 与沙箱规范
│   └── HACKATHON_COMPLIANCE.md # 官方要求与提交前硬门
├── AGENTS.md                  # Codex 跨设备续做约定
├── vite.config.ts             # Vite 配置
├── tsconfig.json              # 严格 TypeScript 配置
├── package.json
└── package-lock.json
```

### 目标工程架构

```text
apps/
└── web/                       # React + TypeScript 用户界面

packages/
├── strategy-ir/               # Schema、Visual 编译器、JSON Patch
├── indicator-registry/        # 内置和自定义指标 DSL
├── backtest/                  # Event Contract 时间序列回放
├── evaluation-skills/         # 版本化确定性评测模块
├── agent-memory/              # 实验记忆、检索和推荐谱系
├── python-runner/             # 隔离的 Python 沙箱任务接口
├── dreamdex-adapter/          # 实时市场、dry-run、交易和 claim
└── shared/                    # 通用类型、Schema 与 fixtures

storage/
└── SQLite                     # 版本、运行、findings、memory、receipt
```

目标数据流：

```text
UI → Strategy IR → Backtest → Skills → Findings
                                      │
Memory Retrieval ─────────────────────┤
                                      ▼
                              Candidate Patch
                                      │
                              Holdout Validation
                                      │
                              DreamDEX Adapter
```

## 本地运行

环境要求：Node.js 20 或更高版本。

```bash
git clone https://github.com/stevia0829/strategylab-event-contracts.git
cd strategylab-event-contracts
npm install
npm run dev
```

打开 <http://127.0.0.1:4173/>。

类型检查和生产构建：

```bash
npm test
npm run build
```

## 推荐 Demo 路径

1. 在 Visual Builder 选择指标和 Event Contract 过滤条件；
2. 创建一个受控公式自定义指标并加入目录；
3. 切换 Python，展示固定策略接口和沙箱边界；
4. 返回 Visual，查看 Strategy IR 并运行 evidence check；
5. 打开失败 Skill，展示证据和评测方法；
6. 查看 Agent 引用的成功/失败实验和候选优化；
7. 在冻结 holdout 上验证 Candidate；
8. 展示指标取舍、版本谱系和 Testnet Deploy 解锁。

## 安全与产品边界

- 数据等级必须标识为 `PROTOCOL`、`RECONSTRUCTED` 或 `SYNTHETIC`；
- 当前示例是 `RECONSTRUCTED`，不代表真实 DreamDEX 历史收益；
- 不在 Web 主进程执行用户 Python；
- 不提交 `.env`、钱包私钥、seed phrase 或 keystore；
- Testnet 和 `DRY_RUN=true` 必须保持默认；
- SDK promise resolved 不等于交易成功，未来必须检查 receipt 和业务事件；
- 所有阈值都是透明的产品护栏，不是盈利保证或金融建议。

详细规范见 [docs/SPEC.md](docs/SPEC.md)，官方赛题符合度见 [docs/HACKATHON_COMPLIANCE.md](docs/HACKATHON_COMPLIANCE.md)。跨设备继续开发前请先阅读 [AGENTS.md](AGENTS.md)。

## 开发进度

| 模块 | 当前状态 | 完成度 | 下一步验收标准 |
|---|---|---:|---|
| Vite + TypeScript 工程 | 已完成初版 | 90% | 拆分模块并增加单元测试 |
| Visual 策略构建器 | 已完成原型 | 75% | 动态增删条件并编译真实 IR |
| 内置指标目录 | 已完成 UI | 70% | 建立 Registry 并实现确定性计算 |
| 自定义指标 DSL | 已完成交互原型 | 40% | AST Parser、warm-up 推导和版本化执行 |
| Python 策略入口 | 已完成编辑与静态验证 | 30% | 一次性容器沙箱和固定 JSON 协议 |
| Strategy IR | 已完成基础类型和预览 | 50% | Zod Schema、持久化和双向恢复 |
| Event Contract 回测 | 模拟结果 | 20% | 使用 point-in-time 数据实现真实回放 |
| Evaluation Skills | 完成展示原型 | 25% | 实现 temporal、risk、concentration 模块与 fixtures |
| 分析结果展示 | 已完成原型 | 75% | 接入真实 Skill 输出和下载报告 |
| Agent 建议 | 固定 Demo | 25% | Finding → Patch → Candidate 可执行闭环 |
| Agent Memory | 完成规范和 UI | 15% | SQLite Schema、结构化检索和 memory links |
| 策略版本谱系 | 完成交互原型 | 30% | 持久化版本、Diff、Rejected 分支 |
| DreamDEX 市场读取 | 未开始 | 0% | 读取真实 marketId、strike、状态和盘口 |
| Testnet dry-run | UI 模拟 | 10% | 接入 `ec-core` 并生成真实订单预览 |
| Testnet 交易验证 | 未开始 | 0% | 完成 Shannon 交易及 receipt/event 验证 |
| 自动化测试 | 类型检查已完成 | 20% | Skill、IR、指标、Adapter 单测和端到端测试 |
| 部署与 Demo 视频 | 未开始 | 0% | 公开 URL、2–3 分钟视频和提交材料 |
