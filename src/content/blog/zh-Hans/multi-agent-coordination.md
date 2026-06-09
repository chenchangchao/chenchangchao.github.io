---
title: "Agent 教程 04：多 Agent 协作、调度与并发控制"
description: "从 ch08 的角色拆分、共享状态、任务调度和并行执行示例中，整理多 Agent 系统的工程边界。"
pubDate: 2026-06-09
tags: ["Multi-Agent", "Python", "并发"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch08"
translationKey: "multi-agent-coordination"
---

## 问题背景

多 Agent 系统不是“多开几个模型”这么简单。真正的难点在于职责边界、共享状态、任务依赖、并发执行和最终汇总。ch08 用一组小脚本把这些概念拆开演示。

## 流程图

```text
任务输入
  -> ControlAgent
  -> PolicyAgent / SentimentAgent / TrendAgent
  -> 并行执行
  -> 加锁写入结果
  -> 汇总 Prompt
  -> 最终简报
```

## 关键实现片段

并行执行时，结果写入共享字典，需要用锁保护。

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

汇总阶段不是把所有输出直接展示，而是转成一个明确的写作任务。

```python
def build_prompt(results: dict[str, str]) -> str:
    prompt = "请根据以下信息撰写2024年一季度中国经济简报：\n"
    for title, content in results.items():
        prompt += f"\n【{title}】：{content}"
    return prompt
```

## 本地运行命令

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch08/src/8_1_role_based_multi_agent.py
python3 ch08/src/8_5_parallel_subagent_executor.py
python3 ch08/src/8_7_thread_safe_shared_log.py
```

## 精选输出

```text
→ 启动政策分析
→ 启动市场情绪
→ 启动趋势预测
→ 政策分析完成
→ 市场情绪完成
→ 趋势预测完成
```

## 工程复盘

多 Agent 的核心是组织能力，而不是模型数量。一个稳定系统需要知道谁负责分析、谁负责调度、谁能写共享状态、谁负责最终回答。并发只是手段，清晰的边界才是长期维护的基础。
