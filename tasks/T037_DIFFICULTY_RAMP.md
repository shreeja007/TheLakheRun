# T037 — Keep difficulty rising through the run

**Status:** REVIEW — implementation complete; director/device acceptance pending  
**Authorization:** Direct owner instruction on 2026-11-03: "as the game progress I think we need more obstacles and more speed, cause its just running and I dont see any difficulty increase in the game".  
**Dependencies:** T036 (same branch `fix/t036-tuku-movement`, both pending acceptance).

## Problem

Speed reached its 15.2 m/s cap and row spacing its 17.5 m floor at ~392 m (~31 s). The mix of row patterns never changed. After half a minute the run did not get harder.

## Scope

- Keep the first 392 m identical; afterwards keep ramping speed and row frequency until ~1,840 m (~2 min), then hold.
- Shift the row mix toward rows that block more lanes, including a new "squeeze" row: two tall blocks plus one lane cleared by a jump or slide.
- Keep every row passable (never three walled lanes); keep at least a full jump plus reaction time between rows.
- Extend the speed-based camera widening to the new top speed so the speed-up is felt.

## Exclusions

No new obstacle art, mechanics, scoring, jump/slide timing or hitbox changes. Numbers are tuning proposals for the director to test.

## Acceptance criteria

- Speed and spacing for 0–392 m match the original.
- Later rows: more obstacles per row and per minute; squeeze rows appear late only.
- Automated fairness check finds no unpassable row; existing suites still pass.
