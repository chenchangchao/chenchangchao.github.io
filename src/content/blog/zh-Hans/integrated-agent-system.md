---
title: "Agent 教程 07：综合 Agent 系统、轻量 RAG 与质量评估"
description: "用 ch12 串起模型适配、意图解析、工具链、轻量 RAG、MCP/A2A 路由、并发压测和幻觉评估。"
pubDate: 2026-06-09
tags: ["AI Agent", "RAG", "评估"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch12"
translationKey: "integrated-agent-system"
---

## 问题背景

前面章节分别处理工具、RAG、上下文、多 Agent、协议和服务化。ch12 的目标是把这些能力串成一个可工程化运行的小体系，并加入工具调用正确率、并发压测和幻觉满意度评估。

## 系统图

```text
用户输入
  -> 意图解析
  -> 工具链 / RAG / MCP Context / A2A Message
  -> 状态控制
  -> 结果生成
  -> 工具正确率 / 并发 / 幻觉评估
```

## 关键实现片段

轻量 RAG 子系统先从本地知识文件构建知识库，再用字符重合度做最小召回。

```python
def retrieve(query: str, knowledge: list[str], k: int = 2) -> list[str]:
    scored = []
    for chunk in knowledge:
        score = sum(1 for char in set(query) if char in chunk)
        scored.append((score, chunk))
    scored.sort(reverse=True, key=lambda item: item[0])
    return [chunk for score, chunk in scored[:k] if score > 0] or knowledge[:k]
```

工具评估用固定测试集计算路由正确率。

```python
TEST_CASES = [
    ToolCase("请查询一下北京的天气", "weather_tool"),
    ToolCase("请帮我计算7乘以8", "multiply_tool"),
]
```

## 本地运行命令

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch12/src/12_5_lightweight_rag_subsystem.py
python3 ch12/src/12_9_tool_call_accuracy_eval.py
python3 ch12/src/12_10_concurrent_load_test.py
python3 ch12/src/12_11_hallucination_satisfaction_eval.py
```

## 精选输出

```text
总用例数：6
1. 通过 | 输入：请查询一下北京的天气
4. 通过 | 输入：请帮我计算7乘以8
工具调用正确率：6/6 = 1.00
```

## 工程复盘

综合 Agent 系统最容易失控的地方是“能力很多，但没有度量”。ch12 的重点不是把所有模块做成生产级，而是让每个能力都有入口、有状态、有降级，并且能用小测试集观察质量。
