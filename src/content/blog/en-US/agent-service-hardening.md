---
title: "Agent Tutorial 06: Serving and Hardening Agent Capabilities"
description: "What ch11 adds before an Agent becomes a service: OpenAI-compatible APIs, rate limiting, queues, caching, and fallback behavior."
pubDate: 2026-06-09
tags: ["FastAPI", "AI Agent", "Backend"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch11"
translationKey: "agent-service-hardening"
---

## Background

A script that runs once is not yet a service. Service boundaries need an API contract, rate limiting, error handling, async jobs, caching, and fallback behavior. Chapter 11 wraps Agent capabilities in a FastAPI service with an OpenAI-compatible response shape.

## Service Flow

```text
HTTP request
  -> FastAPI endpoint
  -> rate limit
  -> chat_from_messages()
  -> OpenAI-compatible response
  -> client
```

## Key Code

The rate limiter keeps a per-client queue of timestamps and returns 429 when the window is full.

```python
REQUEST_LOG: dict[str, deque[float]] = defaultdict(deque)
MAX_REQUESTS_PER_MINUTE = 10

def check_rate_limit(client_id: str) -> bool:
    now = time.time()
    window = REQUEST_LOG[client_id]
    while window and now - window[0] > 60:
        window.popleft()
    if len(window) >= MAX_REQUESTS_PER_MINUTE:
        return False
    window.append(now)
    return True
```

The endpoint keeps the OpenAI-compatible response shape so existing clients can reuse it.

## Run Locally

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch11/src/11_1_openai_compatible_fastapi.py
python3 ch11/src/11_2_secure_rate_limited_api.py
python3 ch11/src/11_5_resilient_agent_fallback.py
```

## Selected Output

```text
backend: cloud:utils.chat_text
service: http://127.0.0.1:8012/v1/chat/completions
```

## Engineering Notes

The hard parts of Agent services often sit outside the model: how to protect the server during bursts, how to recover when the model fails, how to queue long jobs, and how to cache repeated questions. Splitting these concerns out makes the system much easier to stabilize.
