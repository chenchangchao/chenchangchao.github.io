---
title: "Agent 教程 06：把 Agent 能力服务化并加固"
description: "从 ch11 的 OpenAI-compatible API、限流、异步队列、缓存和容错示例，看 Agent 服务进入工程环境前要补齐什么。"
pubDate: 2026-06-09
tags: ["FastAPI", "AI Agent", "服务化"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch11"
translationKey: "agent-service-hardening"
---

## 问题背景

一个脚本能跑通，不代表它能作为服务被别人调用。服务化需要接口契约、限流、错误处理、异步任务、缓存和降级。ch11 用 FastAPI 把 Agent 能力包装成 OpenAI-compatible API，并逐步加入工程保护。

## 服务流程

```text
HTTP request
  -> FastAPI endpoint
  -> rate limit
  -> chat_from_messages()
  -> OpenAI-compatible response
  -> client
```

## 关键实现片段

限流器用每个客户端一个时间窗口队列，超过阈值直接返回 429。

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

接口保持 OpenAI-compatible 响应形状，方便被现有客户端复用。

## 本地运行命令

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch11/src/11_1_openai_compatible_fastapi.py
python3 ch11/src/11_2_secure_rate_limited_api.py
python3 ch11/src/11_5_resilient_agent_fallback.py
```

## 精选输出

```text
LLM后端：cloud:utils.chat_text
服务地址：http://127.0.0.1:8012/v1/chat/completions
```

## 工程复盘

Agent 服务的难点往往在模型外面：请求涌入时如何保护服务，模型失败时如何兜底，长任务如何排队，重复问题如何缓存。把这些能力单独拆出来，比一开始做“大而全”的 Agent 更容易稳定。
