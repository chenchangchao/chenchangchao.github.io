---
title: Agent工具调用进化
pubDate: 2026-07-06
tags: [LLM, Agent, 工具调用, MCP, Function Calling,CLI,Skills]
description: 本文根据Chilia的知乎文章整理总结，原文链接https://zhuanlan.zhihu.com/p/2047367078659764417
---

## MCP和tool call有什么区别呢？
MCP（Model Context Protocol，模型上下文协议） 起源于Anthropic发布的文章Introducing the Model Context Protocol。这篇官方文章用了一个非常直观的比喻：

“MCP 就是 AI 应用的 USB-C 接口。正如 USB-C 让不同设备能通过同一种接口连接，MCP 让不同 AI 应用能通过同一种协议连接各种工具和数据。”

Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect electronic devices, MCP provides a standardized way to connect AI applications to external systems.

当 AI 要使用外部工具时，整个过程分为两个阶段：

阶段1: 模型决定要调什么工具、传什么参数（Function Call）
阶段2: 实际去找到工具、执行工具、拿回结果（MCP）
假如用户的问题是："苹果公司现在股价多少？"，那么模型会把这句自然语言翻译成一条结构化的指令：
```text
"调用 `get_current_stock_price` 这个函数，参数是 `company=Apple Inc., format=USD`"
```
但Function Call 有一个核心问题：平台绑定。也就是说每家 AI 厂商输出这条指令的格式都不一样。

比如OpenAI 的格式是这样的：
```json
{
  "tool_calls": [{
    "name": "get_current_stock_price",
    "arguments": "{\"company\": \"Apple Inc.\", \"format\": \"USD\"}"
  }]
}
```

Anthropic 的格式是这样的：
```json
{
  "type": "tool_use",
  "name": "get_current_stock_price",
  "input": {"company": "Apple Inc.", "format": "USD"}
}
```

Gemini 的格式又是这样的：
```json
{
  "functionCall": {
    "name": "get_current_stock_price",
    "args": {"company": "Apple Inc.", "format": "USD"}
  }
}
```

不管前面是 OpenAI、Claude 还是 Gemini 发出的指令，Host 应用（比如Claude Desktop、VS Code）会把各家不同的格式统一转换成 MCP的这个统一标准化格式，然后发给 MCP Server 执行，MCP Server只认 MCP 格式。也就是将数据连接到模型的这个环节更加统一化了。

模型并会不直接生成 MCP 格式，它们只会说自家的"方言"（比如OpenAI 有 OpenAI 的格式，Claude 有 Anthropic的格式），是 Host 应用在中间当翻译官，把各家方言统一翻译成 MCP 格式。这层翻译对我们普通开发者来说完全不可见，不管是写 MCP Server 的人还是用工具的人，都不需要关心它。只有做 Claude Desktop、Cursor 这种 Host 应用的开发团队需要处理翻译逻辑。

下面流程的示例：
```text
用户问题: "北京今天天气怎么样？"
        ↓
模型（Phase 1 - Function Call）:
  "我要调用 maps_weather(city='北京')"
   输出的是每个框架独有的格式，比如Claude会输出：{"type": "tool_use", "name": "maps_weather", "input": {"city": "北京"}}
        ↓
Host 应用（Claude Desktop / Cursor / ChatGPT）:
   把模型特有的格式翻译成 MCP 标准格式：{"jsonrpc": "2.0", "method": "tools/call", \
        "params": {"name": "maps_weather", "arguments": {"city": "北京"}}}
        ↓
MCP Server（Phase 2 - 标准化执行）:
    收到 MCP 格式请求后便调用函数体，其中调用高德天气 API，返回结果
        ↓
Host 应用:
     把结果翻译回模型能理解的格式，传给模型
        ↓
模型:
     "北京今天晴，气温 28°C，适合出行。"
```
 Function Call 是模型的能力，模型能够理解自然语言并决定调什么工具；而MCP 是一个统一的标准，设计了工具怎么被调用、返回结果。

## 基本概念：Host，Client，与MCP Server
- MCP 的架构有三个角色：Host、Client、Server。其实作为普通用户，我们只需要关心 MCP Server，Host 和 Client 都是现成的。但理解它们的关系有助于我们理解整个系统怎么运转。

- Host就是你直接使用的 AI 应用，比如Claude Desktop、VS Code、ChatGPT Desktop。
- MCP Server是提供具体能力的小程序，它包装了某个具体的功能（比如查询高德地图、查询数据库）。现在的社区开源了 2500+ 个 MCP Server，就指的是这些小程序。当然，你也可以自己写一些MCP Server。
- Client是Host 内部的连接组件。Client是Host 内部的一段代码，负责跟对应的Server通信。每连一个 Server，Host就创建一个 Client 对象来维护这个连接。如果你配了 3 个 MCP Server（高德、GitHub、数据库），Host 内部就会有 3 个 Client，分别跟 3 个 Server 一对一通信。但其实你完全不需要关心 Client，它是 Host 自动创建和管理的，你既看不到它，也不需要配置它。

这种架构设计使得AI框架可以在不同场景下灵活调用各种工具和数据源，而开发者只需专注于开发对应的 MCP Server，无需关心 Host 和 Client 的实现细节。

## MCP如何实现？模型怎么知道该调用哪个MCP？
