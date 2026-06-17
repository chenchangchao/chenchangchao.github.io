---
title: "Agent 教程 01：用本地运行时理解工具、记忆与持久化"
description: "从 ch02 的本地教学版 Agent 出发，拆解工具注册、规则路由、记忆、SQLite 与文件执行的最小工程骨架。"
pubDate: 2026-06-09
tags: ["AI Agent", "Python", "工具调用"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch02"
translationKey: "agent-runtime-local-tools"
---

## 问题背景

很多 Agent 教程一开始就接入完整框架，概念会被模型、工具、记忆、回调和配置一起淹没。ch02 的做法是先把运行时压到最小：一个 `LocalAgent`，一组 `Tool`，一个局部 `data/` 目录，以及几条可观察的规则路由。

这个版本不追求智能，而是追求可解释。它让工具调用、记忆写入、日志落盘和安全文件路径都能在本地直接看到。

## 代码结构图

```text
用户输入
  -> LocalAgent.chat()
  -> 写入 SimpleMemory
  -> _route() 匹配工具
  -> tool.call(params)
  -> 工具结果写回记忆
  -> 返回文本结果
```

## 关键实现片段

`agent_runtime.py` 把所有本地状态约束到章节目录下，避免示例污染项目根目录。

```python
CH02_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = CH02_ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def data_path(*parts: str) -> Path:
    path = DATA_DIR.joinpath(*parts)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path
```

工具只需要实现 `run()`，运行时负责参数解析和调用入口。

```python
class BaseTool:
    name: str = ""

    def call(self, params: str | dict | None = None, **kwargs):
        return self.run(parse_params(params))

    def run(self, params: dict) -> str:
        raise NotImplementedError
```

## 本地运行命令

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch02/src/2_1_agent_startup.py
python3 ch02/src/2_6_agent_sqlite_db.py
python3 ch02/src/2_7_agent_file_exec.py
```

## 精选输出

```text
>> 系统检查响应： 系统初始化检查通过：模型加载完成，工具已注册，Memory注入成功，上下文初始化完成
>> 当前时间响应： 当前时间是：2026年06月09日 17:30:00
```

## 工程复盘

这个章节的价值在于把 Agent 拆回软件工程问题：输入如何进入系统，状态在哪里保存，工具如何被路由，副作用如何被限制。等这些边界清楚之后，再换成 LLM 决策或框架调度，系统仍然是可维护的。
