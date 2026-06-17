---
title: "Agent 教程 05：A2A 消息协议与 Agent 协作"
description: "用 ch09 的消息调度、注册认证、上下文传递和发布订阅示例，理解 Agent-to-Agent 协议设计。"
pubDate: 2026-06-09
tags: ["A2A", "AI Agent", "协议设计"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch09"
translationKey: "agent-to-agent-protocol"
---

## 问题背景

当 Agent 从单体程序走向协作系统，最先需要标准化的是消息。谁发起、谁接收、任务是什么、上下文属于哪次会话、认证信息如何附带，这些都应该进入协议层。

## 消息结构

```json
{
  "id": "msg-...",
  "timestamp": "2026-06-09T08:00:00Z",
  "from": "agent:planner",
  "to": "agent:executor",
  "type": "command",
  "intent": "run_task",
  "context_id": "ctx-...",
  "payload": {
    "task": "analyze_financial_trends"
  },
  "auth": {
    "token": "demo-token-123456",
    "signature": "demo-signature-sha256"
  }
}
```

## 关键实现片段

消息构造函数把协作所需的字段固定下来。

```python
def build_a2a_message(sender, receiver, msg_type, intent, context_id, payload):
    return {
        "id": f"msg-{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}-{random.randint(100, 999)}",
        "timestamp": datetime.now(UTC).isoformat(),
        "from": sender,
        "to": receiver,
        "type": msg_type,
        "intent": intent,
        "context_id": context_id,
        "payload": payload,
        "auth": {"token": "demo-token-123456", "signature": "demo-signature-sha256"},
    }
```

调度器只做一件事：根据 `to` 找到目标 Agent，并把消息交给它处理。

## 本地运行命令

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch09/src/9_1_a2a_message_dispatch.py
python3 ch09/src/9_5_pubsub_broadcast_agents.py
python3 ch09/src/9_6_competitive_bidding_agents.py
```

## 精选输出

```text
--- 调度执行消息 1 ---
[agent:executor] 接收到消息:
→ 执行结果：分析完成：Asia地区2024-Q4期间经济增长放缓，通胀风险可控。
```

## 工程复盘

A2A 的关键不是把对象传来传去，而是让跨 Agent 的协作具备可审计边界。消息 ID、上下文 ID、意图、payload 和 auth 字段会让调试、追踪、重试和权限控制都有落点。
