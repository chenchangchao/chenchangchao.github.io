---
title: "Agent Tutorial 03: Structured Context, Routing, and Prompt Logs"
description: "How ch06 organizes system prompts, memory, inputs, tool outputs, and responses into traceable context segments."
pubDate: 2026-06-09
tags: ["AI Agent", "Context Engineering", "Prompt"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch06"
translationKey: "structured-context-engineering"
---

## Background

After an Agent runs for a while, the hard question is not only what the model answered. It is what the model saw at the moment it answered. Chapter 6 splits context into structured segments: system prompt, user input, tool output, model response, cache record, and task id.

## Structure

```text
system prompt
user input
tool output
assistant response
  -> ContextSegment
  -> JSONL log
  -> tail / replay / cache
```

## Key Code

`ContextSegment` gives every piece of context a role, type, task, model, metadata, and timestamp.

```python
@dataclass
class ContextSegment:
    role: str
    content: str
    type: str
    task_id: str = "default"
    model: str = ""
    meta: dict[str, Any] = field(default_factory=dict)
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
```

The final prompt is assembled from system instruction, tool evidence, and the user question, making later review straightforward.

```python
def build_final_prompt(system_prompt: str, tool_output: str, user_input: str) -> str:
    return f"""system: {system_prompt}
tool evidence: {tool_output}
user question: {user_input}

Answer carefully based on the information above."""
```

## Run Locally

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch06/src/6_5_context_log_persistence.py
python3 ch06/src/6_6_prompt_cache_replay.py
```

## Selected Output

```text
=== persistent context log started ===
-> economic predictor tool called
--- latest context log entries ---
{"role": "system", "type": "system_prompt", ...}
```

## Engineering Notes

Context engineering is not about stuffing more text into the window. It is about identity, provenance, and priority. Once context is logged, failures can be reviewed, prompts can be replayed, and tool evidence can be connected to final answers.
