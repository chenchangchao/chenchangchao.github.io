---
title: "Agent Tutorial 07: Integrated Agent Systems, Lightweight RAG, and Evaluation"
description: "How ch12 connects model adapters, intent parsing, tool chains, lightweight RAG, MCP/A2A routing, load tests, and hallucination checks."
pubDate: 2026-06-09
tags: ["AI Agent", "RAG", "Evaluation"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch12"
translationKey: "integrated-agent-system"
---

## Background

The previous chapters handle tools, RAG, context, multi-agent coordination, protocols, and service boundaries separately. Chapter 12 ties those ideas into a small runnable system and adds tool-call accuracy, concurrency tests, and hallucination/satisfaction checks.

## System Flow

```text
user input
  -> intent parser
  -> tool chain / RAG / MCP context / A2A message
  -> state controller
  -> answer generation
  -> tool accuracy / concurrency / hallucination evaluation
```

## Key Code

The lightweight RAG subsystem builds a local knowledge base and retrieves references with a tiny overlap score.

```python
def retrieve(query: str, knowledge: list[str], k: int = 2) -> list[str]:
    scored = []
    for chunk in knowledge:
        score = sum(1 for char in set(query) if char in chunk)
        scored.append((score, chunk))
    scored.sort(reverse=True, key=lambda item: item[0])
    return [chunk for score, chunk in scored[:k] if score > 0] or knowledge[:k]
```

Tool evaluation uses a fixed test set and computes route accuracy.

```python
TEST_CASES = [
    ToolCase("请查询一下北京的天气", "weather_tool"),
    ToolCase("请帮我计算7乘以8", "multiply_tool"),
]
```

## Run Locally

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch12/src/12_5_lightweight_rag_subsystem.py
python3 ch12/src/12_9_tool_call_accuracy_eval.py
python3 ch12/src/12_10_concurrent_load_test.py
python3 ch12/src/12_11_hallucination_satisfaction_eval.py
```

## Selected Output

```text
total cases: 6
1. pass | input: query Beijing weather
4. pass | input: calculate 7 times 8
tool-call accuracy: 6/6 = 1.00
```

## Engineering Notes

Integrated Agent systems fail when they gain many capabilities but no measurements. Chapter 12 is not trying to make every module production-grade. It makes every capability reachable, stateful, fallback-aware, and observable through small evaluation scripts.
