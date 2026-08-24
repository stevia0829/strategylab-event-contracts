# StrategyLab Execution TODO

Last updated: 2026-08-24  
Current branch: `main`  
Current baseline commit when created: `e994a69`

This is the operational task list for continuing StrategyLab across devices and Codex tasks. Product decisions belong in `SPEC.md`; official competition requirements belong in `HACKATHON_COMPLIANCE.md`; repository working rules belong in `AGENTS.md`.

## 1. Resume on a new device

```bash
git clone https://github.com/stevia0829/strategylab-event-contracts.git
cd strategylab-event-contracts
npm install
npm test
npm run build
npm run dev
```

Then:

1. Read `AGENTS.md` completely.
2. Read `docs/SPEC.md`, especially Current implementation status and Decision log.
3. Read `docs/HACKATHON_COMPLIANCE.md` for non-negotiable submission requirements.
4. Run `git status --short` and preserve existing changes.
5. Open <http://127.0.0.1:4173/> and verify the current demo flow.
6. Start the first unchecked P0 task whose dependencies are satisfied.
7. Update this file when a task changes status or new evidence changes priority.

Suggested prompt for a new Codex task:

> Read AGENTS.md, docs/SPEC.md, docs/HACKATHON_COMPLIANCE.md, and docs/TODO.md. Verify the repository and continue the first actionable unchecked P0 item. Update TODO status and verification evidence before committing.

## 2. Status conventions

- `[ ]` Not started.
- `[~]` In progress. Add owner/branch and current blocker below the item.
- `[x]` Complete and verified. Add the commit and verification evidence.
- `[!]` Blocked by an external dependency or user action. State exactly what is needed.

An item is not complete because its UI exists. Completion requires its acceptance criteria and relevant automated checks to pass.

## 3. Current baseline

Already available:

- [x] Vite + strict TypeScript build.
- [x] Visual/Python input-mode UI.
- [x] 44 built-in indicator choices in the prototype.
- [x] Custom indicator creation interaction.
- [x] Strategy IR preview and initial TypeScript interfaces.
- [x] Layered analysis presentation: verdict, findings, evidence, method, action.
- [x] Skill filtering and deterministic demo flow.
- [x] Agent Memory brief and candidate/holdout interaction prototype.
- [x] Experiment lineage and gated deployment interaction.
- [x] Product spec, compliance review, README, and Codex handoff instructions.

Still simulated:

- backtest data and metrics;
- Skill calculations;
- Agent Memory retrieval;
- recommendation generation;
- frozen holdout validation;
- DreamDEX market and deployment actions;
- Python code execution.

## 4. P0 — Hackathon compliance line

Complete these before adding broad product features.

### P0.1 DreamDEX read-only feasibility spike

- [ ] Confirm official Event Contract SDK/package versions and current testnet configuration.
- [ ] Obtain a dedicated Shannon testnet wallet and faucet funds. Never commit the key.
- [ ] Resolve the current Event Contract `VENUE_ID` dynamically or document the verified lookup method.
- [ ] Read at least one live BTC/ETH Event Contract.
- [ ] Capture `marketId`, underlying, strike, `intervalSec`, chain status, expiry, tick, lot, best bid and best ask.
- [ ] Record indexer timestamp and chain timestamp separately.

Acceptance criteria:

- A repeatable read-only command runs without a private key where possible.
- Output uses typed domain objects and contains data provenance.
- Chain status is treated as authoritative.
- A fixture is saved with secrets and unstable identifiers removed.
- README contains exact setup and troubleshooting steps.

Deliverables:

```text
packages/dreamdex-adapter/
  src/market-reader.ts
  src/types.ts
  test/market-reader.test.ts
  fixtures/live-market.sanitized.json
```

### P0.2 Establish the TypeScript workspace boundaries

- [ ] Decide whether to introduce npm workspaces now or keep a single package until P0.4.
- [ ] Move current DOM demo into `apps/web` without changing behavior.
- [ ] Create packages for `strategy-ir`, `indicator-registry`, `evaluation-skills`, and `dreamdex-adapter`.
- [ ] Add shared build, lint, test, and typecheck scripts.
- [ ] Add CI for install, typecheck, tests, and production build.

Acceptance criteria:

- A fresh clone builds with documented commands.
- Domain packages do not import browser/UI modules.
- No secrets or generated `dist` files are committed.
- Existing browser demo path still works.

### P0.3 Strategy IR schema and compiler

- [ ] Define Strategy IR with Zod and exported TypeScript types.
- [ ] Model market universe, features, conditions, action, confidence, risk and execution assumptions.
- [ ] Compile Visual form state into Strategy IR.
- [ ] Restore Visual state from Strategy IR.
- [ ] Add stable serialization and content hashing.
- [ ] Add JSON Patch generation for candidate versions.
- [ ] Return useful validation errors for unsupported conditions.

Acceptance criteria:

- Round trip `Visual State → IR → Visual State` preserves semantics.
- Invalid periods, operators, stake and missing risk controls fail validation.
- IR version is explicit.
- Unit tests cover at least one valid, one invalid and one custom-indicator strategy.

### P0.4 Indicator Registry and deterministic calculations

- [ ] Create metadata schema: ID, category, inputs, parameters, output unit, warm-up and supported operators.
- [ ] Register the current built-in indicator catalog.
- [ ] Implement only the demo-critical subset first: Return, SMA, EMA, RSI, ATR/volatility and volume ratio.
- [ ] Implement point-in-time calculation with no future-row access.
- [ ] Add missing/warm-up behavior.
- [ ] Connect Visual options to registry metadata instead of hard-coded HTML.

Acceptance criteria:

- Fixed fixtures produce deterministic output.
- Warm-up rows cannot emit a trade accidentally.
- All calculations use only data available at the simulated timestamp.
- Registry controls parameter UI and operator compatibility.

### P0.5 Event Contract backtest engine

- [ ] Define contract window, quote, decision, fill, settlement and PnL types.
- [ ] Enforce decision-time data visibility.
- [ ] Support UP, DOWN and SKIP.
- [ ] Model price/probability, spread, partial fill, latency and explicit cost assumptions.
- [ ] Apply stake, daily loss, consecutive loss and cooldown rules.
- [ ] Produce trades, equity curve, rejected decisions and data manifest.
- [ ] Separate train/diagnostic/holdout time ranges.

Acceptance criteria:

- A hand-calculated fixture matches engine PnL.
- Settlement is unavailable until its timestamp.
- `RECONSTRUCTED` results are visibly distinct from protocol history.
- The same IR and data snapshot reproduce the same report.

### P0.6 Implement real evaluation Skills

- [ ] Define versioned Skill input/output schema.
- [ ] Implement `temporal-integrity`.
- [ ] Implement `risk-profile`.
- [ ] Implement `profit-concentration`.
- [ ] Implement `market-state` for live/testnet execution.
- [ ] Implement `deployment-readiness` as a non-compensating hard gate.
- [ ] Add `PASS`, `WARN`, `FAIL`, `INVALID`, `NOT_APPLICABLE`, and `INSUFFICIENT_EVIDENCE`.

Acceptance criteria:

- Every Skill has pass/fail/not-applicable fixtures.
- Findings contain affected IDs and evidence rather than prose only.
- Temporal failure invalidates profitability optimization.
- Old reports retain the Skill version used.

### P0.7 Persist experiments and versions

- [ ] Select SQLite library and migration mechanism.
- [ ] Add strategies, versions, snapshots, runs, Skill runs, findings, recommendations and validation runs.
- [ ] Save parent version, structured diff, author and change reason.
- [ ] Save data/engine/Skill versions and execution assumptions.
- [ ] Display persisted version lineage instead of fixed DOM data.

Acceptance criteria:

- Restarting the app preserves experiments.
- Any report links back to exact IR, data snapshot and Skill versions.
- Rejected candidates remain visible.
- Two versions can be compared on the same frozen dataset.

### P0.8 DreamDEX dry-run and verified testnet transaction

- [ ] Build typed order preview from a validated Decision.
- [ ] Quantize price and amount using integer tick/lot arithmetic.
- [ ] Set expiry before market expiry with appropriate headroom.
- [ ] Default to Shannon testnet and `DRY_RUN=true`.
- [ ] Require explicit user action before signing.
- [ ] Submit one dedicated-wallet testnet transaction.
- [ ] Verify receipt status and expected Event logs.
- [ ] Persist replayable execution record.
- [ ] Display finalized/claimable state and claim path.

Acceptance criteria:

- No private key enters frontend state, logs or Git.
- A resolved SDK call is never shown as success without receipt/event evidence.
- Failed/reverted/silent-rejection paths are demonstrated.
- At least one sanitized testnet transaction URL is documented.

## 5. P1 — Award differentiation

### P1.1 Agent Memory store and retrieval

- [ ] Add `market_contexts`, `agent_memories`, and `memory_links` tables.
- [ ] Store validated, rejected, invalid and stale experiment memories.
- [ ] Implement structured retrieval by finding, strategy family, underlying, interval and regime.
- [ ] Score context similarity, evidence quality, validation level and recency.
- [ ] Return both successful and rejected memories.
- [ ] Show memory IDs, match reasons and applicability warnings in Agent Brief.

Acceptance criteria:

- Memory can rank a Candidate but cannot mark it `VALIDATED`.
- Invalid/lookahead-contaminated memories cannot influence suggestions.
- BTC 15m → ETH 5m transfer shows an explicit limitation.
- Every recommendation stores which memories influenced it.

### P1.2 Finding → Patch → Candidate loop

- [ ] Map prioritized findings to supported optimization actions.
- [ ] Generate reviewable Strategy IR JSON Patch.
- [ ] Require user review before applying a patch.
- [ ] Create one child version per focused hypothesis.
- [ ] Rerun applicable Skills on frozen holdout.
- [ ] Mark `VALIDATED` or `REJECTED` based on explicit guards.
- [ ] Show improvements and degradations together.

Acceptance criteria:

- Agent prose alone cannot mutate or deploy a strategy.
- A drawdown improvement that collapses coverage can be rejected.
- Demo retains successful and failed branches.

### P1.3 Result-analysis depth

- [ ] Add regime slices: trend, volatility, liquidity, direction and time to expiry.
- [ ] Add counterfactual risk analysis.
- [ ] Add parameter-stability heatmap.
- [ ] Add probability calibration when strategies output probabilities.
- [ ] Export a machine-readable validation report.

### P1.4 Custom indicator DSL

- [ ] Parse formulas into AST; never evaluate text directly.
- [ ] Enforce function/symbol allowlist and lookback/operation limits.
- [ ] Infer warm-up requirements.
- [ ] Version indicator definitions.
- [ ] Run temporal integrity on custom feature traces.
- [ ] Save indicators privately to the user's catalog.

### P1.5 Python strategy sandbox

- [ ] Define source, parameters, context and Decision JSON schemas.
- [ ] Add AST policy scan and import allowlist.
- [ ] Execute in disposable non-root containers.
- [ ] Disable network and host mounts; use read-only image and temporary workspace.
- [ ] Enforce CPU, memory, wall-time and output limits.
- [ ] Remove environment/wallet access.
- [ ] Produce feature lineage and decision trace for Skills.
- [ ] Destroy each container after its run.

Acceptance criteria:

- Escape, network, filesystem and timeout fixtures fail safely.
- The web/API process never directly executes user code.
- Python and Visual strategies enter the same risk, Skill and validation pipeline.
- Keep public upload disabled until all isolation tests pass.

## 6. P2 — Submission and product finish

- [ ] Replace fixed Demo content with the real P0/P1 pipeline.
- [ ] Run usability tests with at least three people unfamiliar with the project.
- [ ] Keep the main workflow within four conceptual user actions.
- [ ] Add accessible keyboard/focus behavior and mobile verification.
- [ ] Publish a public testnet deployment.
- [ ] Add architecture diagram and sanitized transaction evidence to README.
- [ ] Prepare a 2–3 minute demo script and recording.
- [ ] Prepare optional SDK/documentation feedback report.
- [ ] Submit repository, deployed URL and video before the deadline buffer.

## 7. External actions owned by the user

- [ ] Confirm DoraHacks registration and exact account-timezone deadline.
- [ ] Join the official builder communication channel.
- [ ] Create and securely store a dedicated Shannon testnet wallet.
- [ ] Obtain faucet funds; never paste the private key into chat or commit it.
- [ ] Decide where the public demo will be hosted.
- [ ] Record narration or appear in the final demo if desired.

## 8. Known blockers and risks

| Risk | Current state | Mitigation |
|---|---|---|
| Event Contract venue/config can change | Unverified in code | Resolve at runtime and document observed values |
| Historical protocol data availability | Unknown | Start with clearly labeled reconstructed data and preserve provenance |
| Python execution can compromise host | Not implemented | Keep disabled until container isolation tests pass |
| Official Bot Kit already has bots/backtesting | Confirmed | Differentiate through low-code IR, evidence Skills, Memory and validation |
| UI can outpace real implementation | Current risk | Do not mark a module done based on fixed Demo data |
| Testnet action can silently fail | Known protocol risk | Verify receipt and expected Event logs |

## 9. Definition of done for the hackathon MVP

The MVP is ready to submit only when all are true:

- [ ] A public user can open the deployed app.
- [ ] The app reads a real DreamDEX Event Contract.
- [ ] A strategy compiles to versioned IR and produces a reproducible report.
- [ ] At least three real deterministic Skills produce inspectable evidence.
- [ ] One Agent recommendation creates a candidate patch and independent validation result.
- [ ] Deployment is blocked before validation and permitted afterward.
- [ ] A Shannon testnet transaction has verified receipt/event evidence.
- [ ] No secrets are present in Git history, frontend bundles or logs.
- [ ] README setup works from a clean clone.
- [ ] Demo video clearly shows problem, solution, evidence, trade-off and testnet action.

## 10. Work log

Append milestone-level updates only; detailed history remains in Git.

| Date | Change | Commit / evidence |
|---|---|---|
| 2026-08-24 | Static UX and evidence loop prototype | `baa480c` |
| 2026-08-24 | Codex handoff and Agent Memory spec | `f729074` |
| 2026-08-24 | Layered analysis result presentation | `eec89cf` |
| 2026-08-24 | Expanded indicators, Python/custom input and Agent UI | `60bafd5` |
| 2026-08-24 | Initial Vite + TypeScript migration | `ccab9bd` |
| 2026-08-24 | Architecture, features and progress README | `e994a69` |
