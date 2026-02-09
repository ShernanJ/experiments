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


in postman i was testing it out got this:

GET - `http://localhost:3000/api/docsets`

response:
```
{
    "docsets": [
        {
            "id": "react-19",
            "name": "React",
            "version": "19",
            "updatedAt": "2026-02-08T00:00:00Z"
        }
    ]
}
```

GET - `http://localhost:3000/api/docsets/react-19/search?q=useEffect%20cleanup%20strict%20mode`

response:
```
{
    "docsetId": "react-19",
    "version": "19",
    "query": "useEffect cleanup strict mode",
    "results": [
        {
            "chunkId": "c_0003",
            "title": "Strict Mode — Effects",
            "url": "https://react.dev/reference/react/StrictMode",
            "score": 0.6,
            "content": "In development, Strict Mode may run some Effects twice to help you find bugs related to missing cleanup.",
            "tokensApprox": 26
        },
        {
            "chunkId": "c_0001",
            "title": "useEffect — Cleanup",
            "url": "https://react.dev/reference/react/useEffect",
            "score": 0.4,
            "content": "If your Effect returns a function, React will run it to clean up after the component unmounts and before re-running the Effect when dependencies change.",
            "tokensApprox": 38
        },
        {
            "chunkId": "c_0002",
            "title": "useEffect — Dependencies",
            "url": "https://react.dev/reference/react/useEffect",
            "score": 0.2,
            "content": "The dependency array tells React when to re-run the Effect. If you omit it, the Effect runs after every render.",
            "tokensApprox": 28
        }
    ]
}
```


---


## phase 3 - agent demo script (prove the whole loop)

1. pings `/api/health`
2. lists `/api/docsets`
3. searches `/api/docsets/react-19/search?q=...`
4. prints top chunk and citation url

essentially the integration test for the contract
