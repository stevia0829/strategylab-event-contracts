# StrategyLab Product and Engineering Spec

Status: Draft v0.2  
Last updated: 2026-08-24  
Target: Somnia × DreamDEX Event Contracts Hackathon

## 1. Product definition

StrategyLab is a low-code strategy validation and safe-deployment workspace for binary BTC/ETH Event Contracts. It turns a strategy idea into a reproducible experiment, detects false confidence, proposes evidence-based changes, and only permits a Somnia testnet dry-run after deterministic validation gates pass.

```text
Low-code strategy
  → Strategy IR
  → Event Contract backtest
  → Evaluation Skills
  → Findings
  → Memory-assisted candidate generation
  → Frozen holdout validation
  → DreamDEX testnet dry-run
```

## 2. Target user and core job

Primary user: someone who understands basic trading indicators but cannot safely implement, test, and deploy an Event Contract bot.

Core job:

> Help me determine whether my strategy result is believable, show exactly what is wrong, propose a controlled improvement, and prevent unsafe deployment.

## 3. Hackathon scope

### Required

- Four-action low-code builder;
- versioned Strategy IR;
- DreamDEX Event Contract market integration;
- deterministic backtest or historical replay with explicit data provenance;
- at least three real evaluation Skills;
- baseline and candidate strategy versions;
- frozen holdout validation;
- DreamDEX Shannon testnet dry-run and at least one verified transaction;
- GitHub repository and 2–3 minute demo.

### Explicitly deferred

- arbitrary user Python execution;
- mainnet and real-fund automation;
- unrestricted parameter optimization;
- multi-chain support;
- multi-user collaboration;
- strategy marketplace.

## 4. Low-code interaction

The main path must remain understandable without documentation:

1. **Choose market** — BTC/ETH and an available DreamDEX contract window.
2. **Compose signal** — one signal condition and one optional market filter.
3. **Set risk** — direction, stake, maximum consecutive loss, and cooldown.
4. **Evaluate** — run the strategy and receive a verdict, reasons, evidence, and next action.

The MVP does not use a free-form drag canvas. Strategy IR and methodology are available through expandable technical details.

### Visual indicator catalog

The UI groups indicators instead of showing one unstructured list. Initial catalog:

| Group | Indicators |
|---|---|
| Price and return | close, 1/5/20-period return, gap, candle body percentage |
| Trend | SMA 20/50, EMA 12/26, EMA spread, MACD histogram, ADX, Aroon, Ichimoku distance |
| Momentum | RSI, Stochastic, Stochastic RSI, CCI, ROC, Momentum, Williams %R, MFI |
| Volatility | ATR, ATR percentage, realized volatility, Bollinger %B/width, Donchian and Keltner position |
| Volume and flow | volume ratio, VWAP distance, OBV, CMF, accumulation/distribution |
| Event Contract | implied probability, model-market edge, time to expiry, spread, depth, imbalance, strike distance, oracle divergence/freshness |

Supported operators include below, above, crosses above/below, rising, falling, equals, and between where the value shape permits it. Indicator definitions, units, warm-up requirements, and default periods must come from a registry rather than UI conditionals.

Progressive disclosure:

- default view shows two condition rows;
- `Add condition` adds another row and AND/OR combinator;
- indicator-specific period and source settings open inline only when needed;
- execution and Event Contract filters are visually distinguished from directional signals;
- unsupported combinations fail compilation with a useful explanation.

### Custom indicator registry

Users may create a reusable indicator and add it to the Visual catalog without writing a complete strategy. A custom indicator uses a restricted expression DSL, not JavaScript or Python.

```json
{
  "id": "trend_quality",
  "name": "Trend quality",
  "formula": "(ema(close, 12) - ema(close, 26)) / atr(14)",
  "parameters": {"fast": 12, "slow": 26, "atr_period": 14},
  "output": {"type": "number"},
  "warmup_bars": 26,
  "definition_version": "1.0.0"
}
```

Supported primitives initially include OHLCV fields, arithmetic, `sma`, `ema`, `rsi`, `atr`, `stdev`, `highest`, `lowest`, `return`, `abs`, `min`, and `max`. The compiler must:

1. parse into an AST rather than evaluate source text;
2. reject unknown symbols, recursion, side effects and future offsets;
3. infer the required warm-up window;
4. enforce operation and lookback limits;
5. evaluate bar-by-bar against the simulated clock;
6. store the exact definition and version with each strategy run;
7. rerun `temporal-integrity` like any built-in feature.

Custom indicators can be private to a strategy or saved in the user's indicator catalog. Editing a saved definition creates a new version; historical backtests continue referencing the original version. Sharing and a public indicator marketplace are post-hackathon work.

### Python strategy input

Python is a second input mode for advanced users, not a different evaluation engine. A Python strategy receives a read-only `MarketContext` and may return only a standard `Decision`; the result then enters the same risk, backtest, Skill and version pipeline as Visual Strategy IR.

```python
class Strategy(EventContractStrategy):
    parameters = {"rsi_period": 14, "threshold": 38}

    def decide(self, ctx: MarketContext) -> Decision:
        if ctx.rsi(self.parameters["rsi_period"]) < self.parameters["threshold"]:
            return Decision.up(confidence=0.64)
        return Decision.skip()
```

Allowed context capabilities:

- historical bars available at the simulated timestamp;
- registered indicators and rolling windows;
- current Event Contract metadata and point-in-time order-book snapshot;
- strategy state scoped to the current run;
- deterministic clock and seeded random helper if explicitly enabled.

Forbidden capabilities:

- network, filesystem, subprocesses and dynamic package installation;
- environment variables, wallets, signing and direct SDK calls;
- system clock, unrestricted randomness, reflection and arbitrary imports;
- access to future bars, settlement values or hidden holdout data.

Validation pipeline:

```text
source upload/editor
  → file/type/size checks
  → AST policy scan and import allowlist
  → disposable non-root container
  → no network + read-only image + temporary workspace
  → CPU/memory/time/output limits
  → fixed JSON input/output schema
  → temporal-integrity trace
  → backtest and all applicable Skills
  → destroy container
```

AST checks provide early feedback but never replace runtime isolation. The web/API process must never call `exec` on user code. Hackathon delivery may enable only repository-owned examples until container isolation tests pass; the UI must label that boundary honestly.

## 5. Strategy IR

Minimum representation:

```json
{
  "schema_version": "1.0",
  "strategy_id": "rsi-reversal",
  "universe": {
    "underlying": "BTC",
    "interval_sec": 900
  },
  "features": [
    {"id": "rsi14", "type": "RSI", "period": 14},
    {"id": "vol20", "type": "VOLATILITY", "period": 20}
  ],
  "decision": {
    "when": {"all": [
      {"left": "rsi14", "op": "<", "right": 38},
      {"left": "vol20", "op": "<", "right": 0.038}
    ]},
    "action": "UP"
  },
  "risk": {
    "stake_usdso": 10,
    "max_consecutive_losses": 4,
    "cooldown_windows": 2
  }
}
```

Every version also stores its parent, structured diff, change reason, author, data snapshot, engine version, Skill versions, assumptions, random seed, metrics, and validation state.

## 6. Evaluation Skill contract

Each Skill is versioned and deterministic when its method permits it.

```json
{
  "skill_id": "profit-concentration",
  "skill_version": "1.0.0",
  "status": "FAIL",
  "severity": "HIGH",
  "confidence": 0.91,
  "finding": "Top 3 trades contribute 68% of profit",
  "evidence": {"trade_ids": [8, 31, 54], "profit_share": 0.68},
  "methodology": "Top-N contribution and leave-best-out",
  "next_actions": ["REQUIRE_HOLDOUT", "EXPAND_SAMPLE"]
}
```

Allowed statuses: `PASS`, `WARN`, `FAIL`, `INSUFFICIENT_EVIDENCE`, `NOT_APPLICABLE`, `INVALID`.

### Skill execution order

1. Data integrity: `temporal-integrity`;
2. venue realism: `market-state`, `execution-realism`, `expiry-awareness`;
3. evidence quality: `minimum-sample`, `profit-concentration`;
4. robustness and risk: `risk-profile`, `parameter-stability`, later `regime-slicing`;
5. deployment: `deployment-readiness`.

If data integrity is `FAIL` or `INVALID`, profitability and optimization results are invalidated. Do not generate parameter patches until the data issue is fixed.

### Hackathon Skills

P0 implementation:

- `temporal-integrity`;
- `risk-profile`;
- `profit-concentration`;
- `market-state`;
- `deployment-readiness`.

P1 additions:

- `probability-edge`;
- `expiry-awareness`;
- `quote-liquidity`;
- `parameter-stability`;
- `regime-slicing`;
- `counterfactual-risk`.

## 7. Analysis result presentation

Results use progressive disclosure:

### Layer 1 — Verdict

- one plain-language conclusion;
- final state: `INVALID`, `NEEDS_WORK`, `SANDBOX_ONLY`, or `TESTNET_READY`;
- the single next best action;
- no misleading compensating score for failed hard gates.

### Layer 2 — Reasons

- maximum three prioritized findings;
- each shows severity, affected samples, financial/risk effect, and confidence;
- show `INSUFFICIENT_EVIDENCE` rather than false precision.

### Layer 3 — Evidence and methodology

- affected market/trade IDs;
- chart or regime slice;
- Skill and methodology version;
- assumptions and data provenance;
- downloadable machine-readable report.

Recommendations appear after findings. Each recommendation contains a Strategy IR JSON Patch, expected benefit, expected trade-off, related memory, and validation status.

## 8. Agent Memory

### Purpose

Memory prevents the Coach from starting from zero and repeating rejected experiments. It records which changes were attempted, under which market conditions, why they succeeded or failed, and how strong the evidence was.

Memory is advisory. A retrieved success may rank a Candidate higher, but cannot mark the current Candidate `VALIDATED`.

### Memory types

| Type | Content | Main use |
|---|---|---|
| Experiment Memory | version diff, findings, outcome, validation | avoid repeated experiments |
| Market Regime Memory | volatility/trend/liquidity/expiry context | determine applicability |
| Decision Memory | why a suggestion was proposed or rejected | explain Agent reasoning |
| Safety Memory | leakage, risk breach, execution/receipt failure | prevent repeated hazards |

### Memory record

```json
{
  "memory_id": "mem_01J...",
  "memory_type": "experiment",
  "strategy_family": "rsi_reversal",
  "market_context": {
    "underlying": "BTC",
    "interval_sec": 900,
    "regime": "high_volatility",
    "data_tier": "RECONSTRUCTED"
  },
  "trigger": {
    "skill_id": "risk-profile",
    "finding_code": "CONSECUTIVE_LOSS_REGIME"
  },
  "change": {
    "type": "ADD_FILTER",
    "strategy_ir_patch": [
      {"op": "add", "path": "/decision/when/all/-", "value": {"left": "vol20", "op": "<", "right": 0.029}}
    ]
  },
  "outcome": {
    "max_drawdown_before": 0.284,
    "max_drawdown_after": 0.171,
    "expected_value_before": 0.18,
    "expected_value_after": 0.24,
    "coverage_delta": -0.18
  },
  "validation": {
    "status": "VALIDATED",
    "dataset_id": "holdout-2026-07",
    "engine_version": "0.1.0",
    "skills": {"risk-profile": "1.0.0"}
  },
  "created_at": "2026-08-24T00:00:00Z"
}
```

### Retrieval

MVP retrieval is deterministic and structured:

1. filter by finding code, strategy family, underlying, interval, regime, and validation state;
2. rank by context similarity, evidence quality, validation level, and recency;
3. retrieve both successful and rejected experiments;
4. show why each memory matched;
5. create a new Candidate and rerun current validation.

Suggested ranking:

```text
memory_score = context_similarity × evidence_quality × validation_weight × recency_weight
```

Do not use embeddings as the only retrieval method. SQLite structured queries are sufficient for the hackathon; semantic retrieval can be added later for free-text reasons.

### Memory lifecycle and contamination controls

- Separate `Candidate`, `Validated`, `Rejected`, `Invalid`, and `Stale` memories.
- Never delete rejected experiments merely to improve the narrative.
- Bind every memory to data snapshot, engine version, Skill version, and execution assumptions.
- A lookahead-contaminated experiment becomes `Invalid` and cannot influence suggestions.
- Do not transfer BTC 15m evidence directly to ETH 5m without an applicability warning.
- Revalidate old memories after material market or methodology changes; mark stale rather than deleting.
- Do not store wallet secrets, raw environment variables, personal financial data, or hidden chain credentials.

### Suggested storage

SQLite tables:

```text
strategies
strategy_versions
data_snapshots
backtest_runs
skill_runs
findings
recommendations
validation_runs
market_contexts
agent_memories
memory_links
execution_records
```

`memory_links` connects a recommendation to the memories used, their scores, and the reason for retrieval. This creates an auditable Agent trace without storing hidden chain-of-thought.

### Agent presence in the product

The Agent must be visible as an actor with bounded authority, not a decorative chat box:

- **During creation:** translate a natural-language idea into editable Visual IR, explain missing risk controls, and retrieve relevant strategy templates;
- **After evaluation:** summarize the top findings in plain language and show which Skills produced them;
- **During improvement:** show the successful and rejected memories used, why they matched, and generate reviewable Strategy IR patches;
- **During validation:** run candidates, compare trade-offs, and retain rejected branches;
- **Before deployment:** explain hard-gate status, but never override a failed deterministic gate.

Each Agent message that changes strategy state must link to an artifact:

```text
finding IDs
retrieved memory IDs and match reasons
candidate version ID
Strategy IR patch
validation run ID
final accepted/rejected status
```

The primary UI pattern is an `Agent Brief` embedded in the workflow. Free-form chat is optional and secondary; it must not hide evidence, patches, or validation state inside conversation history.

## 9. DreamDEX adapter requirements

- Use Event Contract `ec-core` / Markets SDK rather than Spot Pool APIs.
- Read `marketId`, `strike`, `intervalSec`, chain status, expiry, tick, lot, and order book.
- Treat chain state as authoritative and indexer state as approximate.
- Use integer tick/lot arithmetic; do not submit floating-point prices.
- Set explicit expiry before market expiry.
- Verify receipt status and expected events after writes.
- Key state by `marketId`; pools can be reused.
- Support claimable/finalized state and settlement claim.
- Default to Shannon testnet and `DRY_RUN=true`.

## 10. Acceptance scenarios

### Scenario A — invalid data

Temporal integrity detects future data. The run becomes `INVALID`; optimization and deployment remain unavailable; the UI recommends repairing data lineage.

### Scenario B — memory-assisted improvement

A baseline has excessive high-volatility losses. The Agent retrieves related successful and rejected experiments, explains the match, generates a volatility-filter JSON Patch, and creates a Candidate. Only current frozen-holdout validation can mark it `VALIDATED`.

### Scenario C — trade-off rejection

A candidate reduces drawdown but collapses coverage below the evidence guardrail. It is retained as `REJECTED` and cannot deploy.

### Scenario D — testnet execution

A validated candidate creates a dry-run preview, submits through a dedicated Shannon testnet wallet only after explicit user action, verifies receipt and Event logs, and stores a replayable execution record.

## 11. Current implementation status

| Component | Status |
|---|---|
| Static low-code UI | Done, prototype |
| Expanded visual indicator catalog | Done, UI prototype |
| Python fixed-interface editor | Done, UI/static-validation prototype |
| Strategy IR preview | Done, prototype |
| Simulated metrics and Skills | Done, placeholder logic |
| Candidate holdout interaction | Done, deterministic demo |
| Result progressive disclosure | Done, prototype |
| TypeScript application framework | Not started |
| Persistent version/experiment store | Not started |
| Agent Memory store and retrieval | Not started |
| Isolated Python execution service | Not started |
| Real deterministic Skill modules | Not started |
| DreamDEX live market adapter | Not started |
| Testnet execution and verification | Not started |
| Public deployment and demo video | Not started |

## 12. Implementation order

1. Improve result presentation: verdict → reasons → evidence → action.
2. Move to a TypeScript app structure with shared schemas.
3. Implement Strategy IR compiler and SQLite experiment schema.
4. Implement the five P0 Skills with fixtures.
5. Implement structured Agent Memory retrieval and recommendation lineage.
6. Integrate DreamDEX live market read and dry-run.
7. Complete and verify one Shannon testnet transaction.
8. Freeze the demo, publish, record, and submit.

## 13. Decision log

- 2026-08-24: Use a form-based low-code builder instead of a free-form node canvas.
- 2026-08-24: Treat official Bot Kit backtesting and bot templates as infrastructure, not project differentiation.
- 2026-08-24: Make deterministic Skills and independent validation the trust boundary.
- 2026-08-24: Add structured Agent Memory while forbidding memory from self-validating a strategy.
- 2026-08-24: Keep testnet and dry-run as the only hackathon deployment targets.

## 14. Open-source component shortlist

Use these after migrating the prototype to React/TypeScript. Do not add a library unless the corresponding feature is implemented.

| Need | Recommended component | License | Decision |
|---|---|---|---|
| Low-code condition rows | `react-querybuilder` | MIT | Adopt; customize fields/operators and compile its tree to Strategy IR |
| Analysis charts | `recharts` | MIT | Adopt for equity, drawdown, regime and calibration charts |
| Large evidence tables | `@tanstack/react-table` | MIT | Adopt when real trade/Skill evidence is available |
| Strategy IR Diff/Patch | `jsondiffpatch` | MIT | Adopt for structured version comparison and reversible patches |
| Version lineage graph | `@xyflow/react` | MIT | Optional P1; use only for experiment lineage, never the primary low-code form |
| Guided demo tour | `react-joyride` | MIT | Optional near submission freeze; keep the flow usable without it |

Apache ECharts is a strong alternative if parameter heatmaps and linked interactions become central. Do not ship both Recharts and ECharts in the hackathon bundle.

Component constraints:

- Map query-builder rules into our own Strategy IR; never let a UI library become the domain model.
- Keep all Skill calculations outside chart components.
- JSON Patch application must create a child strategy version and remain reviewable before execution.
- Preserve the existing visual language instead of adopting a component library theme wholesale.
- Record library version and license in the repository before submission.
