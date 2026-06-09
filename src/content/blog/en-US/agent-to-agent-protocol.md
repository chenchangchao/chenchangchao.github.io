---
title: "Agent Tutorial 05: A2A Message Protocols and Collaboration"
description: "A walkthrough of ch09 message dispatch, registry, authentication, context passing, pub-sub, and bidding-style task assignment."
pubDate: 2026-06-09
tags: ["A2A", "AI Agent", "Protocol Design"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch09"
translationKey: "agent-to-agent-protocol"
---

## Background

When Agents move from a single program into a collaborative system, messages should become explicit. Who sent the task, who receives it, what intent it carries, which context it belongs to, and how auth is attached all belong at the protocol layer.

## Message Shape

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

## Key Code

The message builder fixes the fields needed for collaboration.

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

The dispatcher does one clear thing: find the target Agent from `to` and hand the message over.

## Run Locally

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch09/src/9_1_a2a_message_dispatch.py
python3 ch09/src/9_5_pubsub_broadcast_agents.py
python3 ch09/src/9_6_competitive_bidding_agents.py
```

## Selected Output

```text
--- dispatch message 1 ---
[agent:executor] received message
-> result: analysis completed for Asia, 2024-Q4, with slower growth and controlled inflation risk
```

## Engineering Notes

A2A is not about passing objects around. It is about auditable collaboration boundaries. Message IDs, context IDs, intents, payloads, and auth fields give debugging, tracing, retries, and authorization a stable place to live.
