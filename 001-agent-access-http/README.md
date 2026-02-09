# 001 · agent-access-http

> prove that an agent can access documentation via a single, stable HTTP contract.

---

## goal

understand what it *actually* means for an agent to access my app and get useful info without scraping the web every time.

---

## what i'm building

a tiny HTTP surface that lets an agent:

1. check if the service is alive
2. see what docsets exist
3. search inside a docset and get back clean chunks

- query them with a natural-language search
- receive clean, structured, citation-ready context

no ui, no auth, no crawling
just the **agent -> http -> structured context** loop

---

## why i’m doing this

i keep seeing “agent-native” and “llm-ready” thrown around, but it’s vague.

so i wanted to answer a very concrete question:

> if i were an agent, how would i talk to docforge?

what urls would i hit  
what shape of data would i need  
what’s the minimum contract that actually works

---

## what this experiment proves

- agents do not need web scraping
- agents need **stable contracts**, not pages
- documentation can be exposed as a **low-token, high-signal interface**

this is the foundational primitive for docforge.

---

## mental model

agents don’t want websites.
they want:
- stable urls
- predictable json
- small chunks
- citations
- some idea of token cost

so instead of thinking “frontend”, i’m thinking **agent gateway**.

---

## architecture (high level)

agent
-> HTTP request
-> docforge agent gateway (Next.js route handlers)
-> structured JSON response

fake doc data is used to isolate the agent-access problem.

---

## endpoints (from an agent’s pov)

### health check

agents need a cheap way to know if something is up.

`GET /api/health`

returns something boring and reliable.

---

### docset discovery

agents shouldn’t guess what docs exist.

`GET /api/docsets`

returns a list of docsets with ids + versions.

this already feels like an important primitive.

---

### search

this is the real test

`GET /api/docsets/:id/search?q=...`

the response needs to:
- be small
- be scannable
- include a source url
- not dump an entire page

if this part feels good, everything else builds on top.

---

## agent contract

i'm forcing myself to write the contract down early:

`/schema/agent-api.json`

not cuz i need openapi right now,
but cuz i want to be explicit about what agents can rely on

---

## demo

theres a tiny script in `/demo` that pretends to be an agent

it:
- lists docsets
- runs a query
- prints the top result + citation

if this feels clean, the experiment worked

--

## open questions

- how small would chunks really be?
- do agents prefer fewer chunks or more?
- should i return raw text or summaries?
- where does token cost actually show up?

i'll answer these as i build

---

## notes to self

- resist adding ui
- resist adding crawling
- isolate the agent access problem