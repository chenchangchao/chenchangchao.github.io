---
title: "Agent Tutorial 04: Multi-Agent Coordination, Scheduling, and Concurrency"
description: "What ch08 teaches about role separation, shared state, task scheduling, and parallel execution in multi-agent systems."
pubDate: 2026-06-09
tags: ["Multi-Agent", "Python", "Concurrency"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch08"
translationKey: "multi-agent-coordination"
---

## Background

A multi-agent system is not just several model calls running together. The hard parts are responsibility boundaries, shared state, task dependencies, parallel execution, and final synthesis. Chapter 8 isolates these concerns in small runnable scripts.

## Flow

```text
task input
  -> ControlAgent
  -> PolicyAgent / SentimentAgent / TrendAgent
  -> parallel execution
  -> locked result writes
  -> synthesis prompt
  -> final brief
```

## Key Code

When parallel workers write into shared state, the write needs a lock.

```python
class ParallelExecutor:
    def __init__(self):
        self.results: dict[str, str] = {}
        self.lock = threading.Lock()

    def run_agent(self, agent: Tool, name: str) -> None:
        result = agent.call("")
        with self.lock:
            self.results[name] = result
```

The synthesis step turns agent outputs into a clear writing task.

```python
def build_prompt(results: dict[str, str]) -> str:
    prompt = "Write a 2024 Q1 China economic brief from the information below:\n"
    for title, content in results.items():
        prompt += f"\n[{title}]: {content}"
    return prompt
```

## Run Locally

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch08/src/8_1_role_based_multi_agent.py
python3 ch08/src/8_5_parallel_subagent_executor.py
python3 ch08/src/8_7_thread_safe_shared_log.py
```

## Selected Output

```text
-> starting policy analysis
-> starting market sentiment
-> starting trend forecast
-> policy analysis completed
-> market sentiment completed
-> trend forecast completed
```

## Engineering Notes

The core of multi-agent work is organization, not model count. A maintainable system knows who analyzes, who schedules, who writes shared state, and who produces the final answer. Concurrency helps, but boundaries are what keep the system understandable.
