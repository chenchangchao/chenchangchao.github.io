---
title: "Agent 教程 03：结构化上下文、路由与 Prompt 日志"
description: "用 ch06 理解 Agent 如何组织 system、memory、input、tool 和 response，并把上下文持久化成可追溯日志。"
pubDate: 2026-06-09
tags: ["AI Agent", "Context Engineering", "Prompt"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch06"
translationKey: "structured-context-engineering"
---

## 问题背景

Agent 运行一段时间后，真正难排查的往往不是单次模型回答，而是“模型当时看到了什么”。ch06 把上下文拆成结构化段：系统提示、用户输入、工具结果、模型回答、缓存记录和任务 ID。

## 结构图

```text
system prompt
user input
tool output
assistant response
  -> ContextSegment
  -> JSONL log
  -> tail / replay / cache
```

## 关键实现片段

`ContextSegment` 给每段上下文加上角色、类型、任务、模型和时间戳。

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

最终 Prompt 明确把系统提示、工具信息和用户问题拼在一起，便于复盘。

```python
def build_final_prompt(system_prompt: str, tool_output: str, user_input: str) -> str:
    return f"""系统提示：{system_prompt}
工具信息：{tool_output}
用户提问：{user_input}

请基于以上信息进行严谨回答。"""
```

## 本地运行命令

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch06/src/6_5_context_log_persistence.py
python3 ch06/src/6_6_prompt_cache_replay.py
```

## 精选输出

```text
=== 持久化上下文日志系统启动 ===
→ 已调用经济预测工具
--- 最新上下文日志（展示最后5条） ---
{"role": "system", "type": "system_prompt", ...}
```

## 工程复盘

上下文工程不是把更多文本塞进窗口，而是让每段文本有身份、有来源、有优先级。日志化之后，Agent 的失败可以被复盘，缓存可以被命中，工具证据也能和最终回答建立关系。
