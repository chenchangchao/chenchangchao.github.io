---
title: "Agent Tutorial 01: Local Runtime, Tools, Memory, and Persistence"
description: "A practical walkthrough of the ch02 local Agent runtime: tool registration, rule routing, memory, SQLite, and file execution."
pubDate: 2026-06-09
tags: ["AI Agent", "Python", "Tool Calling"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch02"
translationKey: "agent-runtime-local-tools"
---

## Background

Many Agent tutorials start with a full framework, which makes the first mental model too crowded. Chapter 2 takes the opposite path: a tiny `LocalAgent`, a small `Tool` abstraction, a local `data/` directory, and a few observable routing rules.

The goal is not intelligence yet. The goal is to make tool calls, memory writes, logs, SQLite state, and file execution visible on a local machine.

## Structure

```text
user input
  -> LocalAgent.chat()
  -> append to SimpleMemory
  -> _route() selects a tool
  -> tool.call(params)
  -> append tool result to memory
  -> return text
```

## Key Code

`agent_runtime.py` keeps local state inside the chapter folder so examples do not scatter files across the project root.

```python
CH02_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = CH02_ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def data_path(*parts: str) -> Path:
    path = DATA_DIR.joinpath(*parts)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path
```

Each tool only implements `run()`. The runtime handles parameter parsing and the common call entrypoint.

```python
class BaseTool:
    name: str = ""

    def call(self, params: str | dict | None = None, **kwargs):
        return self.run(parse_params(params))

    def run(self, params: dict) -> str:
        raise NotImplementedError
```

## Run Locally

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch02/src/2_1_agent_startup.py
python3 ch02/src/2_6_agent_sqlite_db.py
python3 ch02/src/2_7_agent_file_exec.py
```

## Selected Output

```text
>> system check: initialization passed, model loaded, tools registered, memory injected, context ready
>> current time: 2026-06-09 17:30:00
```

## Engineering Notes

This chapter turns Agent development back into software engineering: where input enters, where state lives, how tools are routed, and how side effects are constrained. Once those boundaries are clear, replacing the rule router with an LLM or framework becomes much less mysterious.
