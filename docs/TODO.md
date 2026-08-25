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
- [x] Four-stage Define → Evaluate → Improve → Testnet navigation prototype.
- [x] Co-located Agent proposal, Candidate validation and clearly labeled comparison chart.
- [x] Product spec, compliance review, README, and Codex handoff instructions.

Still simulated:

- backtest data and metrics;
- Skill calculations;
- Agent Memory retrieval;
- recommendation generation;
- frozen holdout validation;
- DreamDEX market and deployment actions;
- Python code execution.

## 4. Competition alignment gate

Official competition position:

> Build a useful, innovative, or engaging experience that demonstrates meaningful use of DreamDEX Event Contracts and its APIs/SDKs.

StrategyLab must be submitted as an **Event Contract strategy validation and safe-deployment application**, not as a generic stock/crypto backtester, an AI price predictor, or a wrapper around the official example bots.

### Required evidence mapping

| Official requirement / criterion | StrategyLab submission claim | Evidence required before submission | Gate |
|---|---|---|---|
| Working prototype on testnet | A validated strategy can create and execute a Shannon testnet Event Contract order | Public app URL, testnet transaction URL, receipt and decoded Event | HARD |
| DreamDEX Event Contracts integration | Reads live binary BTC/ETH markets and submits through the official Event Contract SDK path | Code paths, live market ID, SDK version, screen recording | HARD |
| Meaningful API/SDK use | Market discovery, status, quotes, order preview, execution and settlement/claim status | Adapter tests, sanitized logs, transaction replay | HARD |
| Innovation — 20% | Deterministic Skills + Agent Memory + Candidate patch + frozen validation | One complete finding-to-validated/rejected experiment | SCORE |
| Technical implementation — 25% | Point-in-time IR/backtest, versioned Skills, execution verification | Tests, architecture, reproducible report, testnet evidence | SCORE |
| UX and design — 20% | Four-action low-code workflow with plain-language verdict | A new user completes the demo without developer explanation | SCORE |
| Business/ecosystem impact — 20% | Helps non-programmers safely create DreamDEX trading activity | Clear target user, adoption path, testnet-to-product roadmap | SCORE |
| Presentation/demo — 15% | A failed baseline becomes a validated candidate and executes on testnet | 2–3 minute edited video with readable evidence | HARD/SCORE |
| GitHub repository | Reproducible public source | Clean clone, setup commands, license, no secrets | HARD |

### Non-negotiable positioning rules

- [ ] Every market, order and deployment screen says **DreamDEX Event Contract**, not only BTC/ETH trading.
- [ ] Use binary UP/DOWN probability, strike, interval and expiry semantics; do not present ordinary long/short spot positions.
- [ ] Use the Event Contract SDK/`ec-core` path, not DreamDEX Spot Pool APIs.
- [ ] Show at least one real live market and one verified Shannon transaction.
- [ ] Clearly label `PROTOCOL`, `RECONSTRUCTED` and `SYNTHETIC` data.
- [ ] Do not claim reconstructed backtest PnL is historical DreamDEX execution.
- [ ] Do not claim the Agent predicts markets or guarantees profit.
- [ ] Do not submit a UI-only prototype or a modified official sample bot.
- [ ] Keep the differentiator visible: the Agent remembers experiments, but deterministic Skills and holdout validation control deployment.

### Pre-submission compliance review

Run this review after feature freeze:

- [ ] Open the public deployment in a logged-out browser.
- [ ] Read a currently live DreamDEX Event Contract.
- [ ] Create or load a strategy and inspect its Strategy IR.
- [ ] Produce a report from traceable data.
- [ ] Open at least three real Skill evidence records.
- [ ] Generate one Candidate linked to findings and memory IDs.
- [ ] Validate the Candidate on a frozen holdout.
- [ ] Confirm an unvalidated version cannot deploy.
- [ ] Execute the validated version on Shannon testnet.
- [ ] Open its explorer transaction and verify receipt/Event evidence.
- [ ] Confirm GitHub setup works from a fresh directory.
- [ ] Scan Git history and frontend bundle for secrets.
- [ ] Confirm the video and submission text never overstate simulated functionality.

If any HARD gate is unchecked, the project is not submission-ready.

## 5. P0 — Hackathon compliance line

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

## 6. P1 — Award differentiation

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

## 7. P2 — Submission and product finish

- [ ] Replace fixed Demo content with the real P0/P1 pipeline.
- [ ] Run usability tests with at least three people unfamiliar with the project.
- [ ] Keep the main workflow within four conceptual user actions.
- [ ] Add accessible keyboard/focus behavior and mobile verification.
- [ ] Publish a public testnet deployment.
- [ ] Add architecture diagram and sanitized transaction evidence to README.
- [ ] Prepare a 2–3 minute demo script and recording.
- [ ] Prepare optional SDK/documentation feedback report.
- [ ] Submit repository, deployed URL and video before the deadline buffer.

### P2.1 Demo video production plan

Target length: **2:30**, never longer than 3:00. Record at 1440p or 1080p, 30 fps, with browser zoom adjusted so evidence remains readable on a laptop screen. Use English UI and preferably English narration/subtitles for global judges; a Chinese working script is acceptable during rehearsal.

#### Core story

> A strategy can look profitable and still be unsafe. StrategyLab finds why, uses verified experiment memory to propose a focused change, proves the change on unseen data, and only then permits a DreamDEX Event Contract testnet action.

#### Shot-by-shot script

| Time | Screen/action | Narration goal | Required evidence |
|---:|---|---|---|
| 0:00–0:12 | Title plus live DreamDEX BTC/ETH Event Contract | State the user problem in one sentence | DreamDEX name, live market, UP/DOWN, strike, expiry |
| 0:12–0:28 | Visual Builder; choose RSI, volatility filter and risk | Show that a non-programmer can express a strategy quickly | Four-action workflow and Event Contract-specific fields |
| 0:28–0:38 | Briefly switch to Python and back | Establish an advanced path without distracting from the main demo | Fixed `decide()` API and sandbox label only |
| 0:38–0:50 | Open Strategy IR and run evaluation | Show reproducibility and a deterministic pipeline | IR version, data tier, engine/Skill versions |
| 0:50–1:15 | Result verdict and failed Skills | Create the demo tension: profitable headline, unsafe evidence | Drawdown, profit concentration, affected trade/market IDs |
| 1:15–1:35 | Agent Brief and retrieved memories | Show the unique Agent capability and bounded authority | 3 validated + 1 rejected memory, match reasons, applicability warning |
| 1:35–1:52 | Candidate JSON Patch / version branch | Show exactly what the Agent changes and the expected trade-off | Finding IDs, patch, coverage cost, Candidate status |
| 1:52–2:10 | Frozen holdout validation | Prove the recommendation rather than trusting prose | before/after metrics, unchanged holdout ID, VALIDATED/REJECTED rule |
| 2:10–2:28 | Deployment gate and DreamDEX testnet execution | Close the required on-chain loop | locked-before/unlocked-after, order preview, explicit confirm |
| 2:28–2:40 | Explorer/receipt/Event and replay record | Prove business success, not just a resolved SDK call | tx hash, success receipt, decoded expected Event, market ID |
| 2:40–2:52 | Architecture or version lineage | Establish technical depth without reading code | IR → Skills → Memory → validation → adapter flow |
| 2:52–3:00 | Closing product vision and links | State ecosystem value and give judges next action | GitHub, public demo URL, testnet-only disclaimer |

If the edit must be closer to two minutes, remove the Python shot and shorten architecture; never remove the real DreamDEX transaction evidence.

#### Exact demo data to prepare

- [ ] One live or captured DreamDEX Event Contract with stable readable metadata.
- [ ] One baseline strategy whose headline result is positive but fails risk/concentration checks.
- [ ] At least three affected trade/market IDs for evidence drill-down.
- [ ] Three relevant validated memories and one rejected memory.
- [ ] One focused volatility/risk Candidate expressed as a Strategy IR JSON Patch.
- [ ] One frozen holdout where the Candidate passes with a visible trade-off.
- [ ] One rejected Candidate if time permits, to prove the Agent preserves failures.
- [ ] One sanitized Shannon transaction with explorer URL, receipt and decoded Event.
- [ ] One fallback prerecorded transaction replay in case the live testnet/indexer is unstable.

#### Recording checklist

- [ ] Freeze code and demo fixtures before recording.
- [ ] Clear unrelated browser tabs, bookmarks, notifications and personal information.
- [ ] Use a dedicated test wallet with no real assets.
- [ ] Never show a private key, seed phrase, `.env`, wallet export or sensitive RPC credential.
- [ ] Preload pages and verify the faucet, RPC, indexer and explorer are responsive.
- [ ] Record a clean silent screen take first, then narration separately when possible.
- [ ] Keep the cursor deliberate and avoid scrolling while speaking about evidence.
- [ ] Add zoom/callouts only for small transaction and Skill evidence fields.
- [ ] Add subtitles and keep background music absent or very low.
- [ ] Display `Testnet only`, data provenance and “not financial advice” unobtrusively.
- [ ] Export H.264 MP4 and verify audio/video on another device.
- [ ] Upload as unlisted/public and test the link while logged out.

#### Narration draft

Use this as a concise base, then rewrite around the final working UI:

> Event Contract strategies often look convincing in a backtest but fail because of leakage, concentrated luck, or unrealistic execution. StrategyLab lets anyone define a DreamDEX strategy visually, or through a sandboxed Python interface. The strategy compiles to a versioned IR and runs through deterministic evaluation Skills. This baseline is profitable, but deployment is blocked: drawdown exceeds its guardrail and most profit comes from three windows. Our Agent retrieves both successful and rejected experiments from similar market regimes and proposes one reviewable patch. It cannot approve its own advice. We rerun the candidate on a frozen holdout, show both the improvement and reduced coverage, and only the validated version unlocks DreamDEX testnet execution. The transaction is then verified through its receipt and expected Event, producing a replayable audit record. StrategyLab turns AI trading advice into evidence before execution.

#### Video acceptance criteria

- A judge understands the problem within 15 seconds.
- DreamDEX Event Contracts appear in the first screen and final transaction.
- The video shows a real product interaction, not slides only.
- The unique Agent Memory + deterministic validation boundary is understandable without reading the repository.
- At least one failed check, one candidate patch and one independent validation result are readable.
- Testnet receipt/Event evidence is readable and linked in the description.
- The video is between 2:00 and 3:00 with no dead loading time.
- All claims match the committed code and public deployment.

#### Submission description assets

- [ ] One-sentence pitch.
- [ ] 100–150 word problem/solution summary.
- [ ] Architecture image.
- [ ] Public app URL.
- [ ] GitHub repository URL and tested setup instructions.
- [ ] Video URL.
- [ ] Shannon transaction/explorer URL.
- [ ] SDK/API list and versions used.
- [ ] Data provenance and known limitations.
- [ ] Optional DreamDEX SDK/documentation feedback.

## 8. External actions owned by the user

- [ ] Confirm DoraHacks registration and exact account-timezone deadline.
- [ ] Join the official builder communication channel.
- [ ] Create and securely store a dedicated Shannon testnet wallet.
- [ ] Obtain faucet funds; never paste the private key into chat or commit it.
- [ ] Decide where the public demo will be hosted.
- [ ] Record narration or appear in the final demo if desired.

## 9. Known blockers and risks

| Risk | Current state | Mitigation |
|---|---|---|
| Event Contract venue/config can change | Unverified in code | Resolve at runtime and document observed values |
| Historical protocol data availability | Unknown | Start with clearly labeled reconstructed data and preserve provenance |
| Python execution can compromise host | Not implemented | Keep disabled until container isolation tests pass |
| Official Bot Kit already has bots/backtesting | Confirmed | Differentiate through low-code IR, evidence Skills, Memory and validation |
| UI can outpace real implementation | Current risk | Do not mark a module done based on fixed Demo data |
| Testnet action can silently fail | Known protocol risk | Verify receipt and expected Event logs |

## 10. Definition of done for the hackathon MVP

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

## 11. Work log

Append milestone-level updates only; detailed history remains in Git.

| Date | Change | Commit / evidence |
|---|---|---|
| 2026-08-24 | Static UX and evidence loop prototype | `baa480c` |
| 2026-08-24 | Codex handoff and Agent Memory spec | `f729074` |
| 2026-08-24 | Layered analysis result presentation | `eec89cf` |
| 2026-08-24 | Expanded indicators, Python/custom input and Agent UI | `60bafd5` |
| 2026-08-24 | Initial Vite + TypeScript migration | `ccab9bd` |
| 2026-08-24 | Architecture, features and progress README | `e994a69` |
| 2026-08-25 | Four-stage workflow and Candidate validation UX | pending commit |
