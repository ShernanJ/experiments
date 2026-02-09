# personal notes

this is my informal personal notes so if u really wanna see how i talk to myself while i think lol


## phase 1

spin up the agent gateway, a clean http interface agents call and a health endpoint to verify the gateway is alive before doing anything else


---

## phase 2

fake doc storage and dumb search so we isolate agent access

at some point we wanna implement crawling and storing but rn we just wanna test the contract without building any cralwers yet so this is what this is for

created fake data at `data\react-19.json`


then add a tiny loader and search helper `lib\docsets.ts`

it reads the JSON docset and searches it with a simple scoring method
to give endpoints real behaviour (search -> ranked chunks ) without a db

agents never call docsets.ts directly

```
agent → /api/docsets → listDocsets()
agent → /api/docsets/:id/search → searchDocset()
```