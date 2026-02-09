# experiments

a set of small, focused projects exploring systems, infrastructure, browser tooling, data modeling, and agent-native interfaces.

each folder is a self-contained build answering one technical question end-to-end.

---

## what lives here

every experiment:

* proves a single capability (scraping, realtime events, browser interception, agent apis, etc.)
* defines a clear contract (events, schema, api, or interface)
* includes a demo and reproducible setup
* documents real engineering learnings

---

## structure

each folder contains:

```
README.md     → goal, demo, architecture, learnings
src/          → minimal implementation
demo/         → gifs or screenshots
schema|api/   → interface or data contract
```

reading the README alone should explain:

* the problem
* the approach
* failures and fixes
* tradeoffs and next steps

---

## why this exists

to break down complex systems into small, testable builds and understand them deeply.

many experiments feed into larger projects over time.

current themes include:

* browser infrastructure
* agent-first apis
* realtime data pipelines
* scraping and document normalization
* structured knowledge systems

---

## learnings over volume

every experiment ends with:

* what broke and why
* what worked
* performance notes
* design tradeoffs

focus is on insight, not lines of code.

---

## compounding

each project builds on the last.
patterns get reused.
systems get sharper.