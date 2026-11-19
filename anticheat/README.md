# Leaderboard anti-cheat — staging prototype

This branch is isolated from main. No changes to `index.html`, artwork, audio, controls, game rules, deployment, or live scores.

## Run tests
`node --test anticheat/replay-prototype.test.mjs`

## Scope
- Seeded deterministic PRNG
- Strict input tick/direction validation
- Bounded replay prototype and deterministic checksum
- Test cases for repeatability and malformed input
- Explicit **no score verification**: `verifiedScore: null`, `eligibleForLeaderboard: false`

## Not implemented / not verified
- Parity with existing game physics, drops, scoring, collision and powerups
- Secure server sessions, device registration, rate limiting, database, authentication
- Supabase replay validator, leaderboard, admin dashboard, iPhone test
- No claim that checksum is cryptographic or proves fair human play

## Required before live use
1. Extract current approved gameplay into shared deterministic simulation; compare all rules and obtain approval for deviations.
2. Server issues single-use authenticated sessions with seed and strict time/size limits.
3. Server independently computes score/lives/game-over from replay (never trusts submitted score).
4. Secure player/device binding, rate limits, anomaly review, and prize identity verification.
5. Automated adversarial tests and iPhone 11 regression checks.
