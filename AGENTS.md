# StrategyLab Agent Instructions

This file is the persistent handoff for Codex and other coding agents working in this repository. Read this file and `docs/SPEC.md` before changing code.

## Mission

Build a hackathon-ready, low-code validation and safe-deployment product for DreamDEX Event Contracts. StrategyLab helps a user express a strategy, tests whether its apparent edge is trustworthy, proposes evidence-linked changes, independently validates candidates, and only then enables a Somnia testnet dry-run.

The product is not a price-prediction model, a generic backtester, or a wrapper around an existing DreamDEX bot.

## Current state

- The repository contains a dependency-free interactive frontend prototype.
- `index.html`, `styles.css`, and `app.js` implement the current demo.
- The existing backtest numbers and DreamDEX deployment are deterministic simulations.
- No wallet is connected and no transaction is broadcast.
- `docs/HACKATHON_COMPLIANCE.md` records official requirements and current gaps.
- `docs/SPEC.md` is the product and engineering source of truth.

Do not describe the current frontend as a completed testnet prototype.

## Product principles

1. Keep the low-code path simple: choose market, compose conditions, set risk, run evaluation.
2. Compile visual strategies to a versioned Strategy IR.
3. Deterministic Skills produce findings and evidence; an LLM may explain or propose a Candidate but cannot mark it `VALIDATED`.
4. A candidate must run on a frozen holdout using the same applicable Skills.
5. Hard-gate failures cannot be offset by a high aggregate score.
6. Show improvement and trade-offs together.
7. Historical Agent Memory may rank suggestions, but never replaces current independent validation.
8. Testnet and `DRY_RUN=true` are the defaults. Never add real keys or mainnet defaults.

## UX rules

- Lead with a plain-language verdict, then reasons, evidence, and next action.
- Hide advanced inputs and methodology behind progressive disclosure.
- Avoid a free-form node canvas in the hackathon MVP.
- Show at most three recommendations at once.
- Every recommendation must reference the finding, evidence, proposed Strategy IR patch, expected trade-off, and validation state.
- Preserve rejected experiments in the version history.

## Technical direction

Target architecture:

```text
web app
  -> strategy compiler / Strategy IR
  -> event-contract backtest engine
  -> versioned evaluation Skills
  -> findings + experiment store
  -> memory retrieval + recommendation planner
  -> frozen holdout validator
  -> DreamDEX Event Contract testnet adapter
```

Preferred implementation language for the production MVP is TypeScript. Integrate Event Contracts through the official `ec-core` / Markets SDK path, not the DreamDEX Spot Pool API.

## Required verification

For frontend-only changes:

```bash
npm test
```

Also exercise this path in a browser:

1. Run evidence check.
2. Inspect failed Skill evidence.
3. Test candidate on frozen holdout.
4. Confirm deployment remains locked before validation and unlocks after validation.
5. Check browser console errors.

For future DreamDEX integration, add automated tests for integer tick/lot quantization, expiry, chain-status gating, receipt failure, event verification, market rollover, and claim state.

## Safety constraints

- Never commit `.env`, private keys, seed phrases, keystores, wallet exports, or test credentials.
- Never enable mainnet execution as a default or fallback.
- A resolved SDK promise is not proof of transaction success; verify receipt status and expected events.
- Key market state by `marketId`, not a reusable pool address.
- Use integer tick/lot arithmetic and explicit expiry.
- Treat reconstructed data as `RECONSTRUCTED`, never as protocol trading history.

## Resume checklist for a new Codex task

1. Read `AGENTS.md`, `docs/SPEC.md`, and `docs/HACKATHON_COMPLIANCE.md`.
2. Run `git status --short` and preserve unrelated user changes.
3. Run `npm test` and open the local demo.
4. Check the “Current implementation status” section in `docs/SPEC.md`.
5. Work on the first incomplete P0 item unless the user sets another priority.
6. Update the status and decision log when a milestone or architecture choice changes.

