# Build Your First AI Agent — no code required 🤖

A **zero-code AI agent studio** that runs 100% in your browser. No API key. No backend. No build step.

**🔗 Live demo:** https://qasimjethwa.github.io/first-ai-agent/

## What it is

Most "build an AI agent" tutorials start with Python, pip installs and an API key. This starts with a name, an avatar and a sentence — and ends with a working agent that perceives, plans, uses tools and remembers. Every reply visualises the real agent loop so you learn how agents work by watching one work.

## Features

- **🛠 Agent builder** — name, avatar, 6 role presets (research helper, study coach, support agent, planner, quiz master…), personality sliders (warmth / formality / playfulness), custom instructions, and a knowledge base your agent actually answers from
- **🧰 10 real working tools** (toggleable per agent): calculator, unit converter, extractive summariser, quiz generator, flashcard maker, word explainer, task planner, study-schedule maker, note organiser, pros/cons decider — all client-side, all genuinely functional
- **⚡ Live agent brain** — every reply animates the loop: *understand → plan → choose tool → run tool → answer*, with a tool trace for the curious
- **🧠 Memory** — conversation memory plus long-term facts ("remember that…"), persisted in localStorage, with a memory panel to inspect and delete
- **🎯 Missions mode** — 5 guided challenges that teach agent concepts by doing
- **📦 Template gallery** — 6 one-click starter agents, each with a sample knowledge pack
- **⤴ Share/export** — export/import agents as JSON, shareable links with the config encoded in the URL, agent card summary
- **🧠 "How real AI agents work"** — perceive / plan / act / remember, each mapped to what you just did in the studio

## How it works (the honest version)

There is no LLM here — that is the point. The "brain" is a real intent-matching + planning + tool-dispatch loop running entirely in your browser. Swap the rule-based brain for an LLM API call and add web tools, and this is the architecture inside production AI agents. The studio teaches the architecture, not the API.

## Run it

Open `docs/index.html` — or visit the live demo above. Everything is static; any static host works.

## Stack

Vanilla JavaScript + HTML + CSS. Zero dependencies, zero build.

---

Built in a day as part of a daily shipping series. Video + details in the repo.
