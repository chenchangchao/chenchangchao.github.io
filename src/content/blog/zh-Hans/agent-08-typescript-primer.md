---
title: "Agent 教程 07：综合 Agent 系统、轻量 RAG 与质量评估"
description: "用 ch12 串起模型适配、意图解析、工具链、轻量 RAG、MCP/A2A 路由、并发压测和幻觉评估。"
pubDate: 2026-06-09
tags: ["AI Agent", "RAG", "评估"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch12"
translationKey: "integrated-agent-system"
---

## TypeScript Agent 开发基础
掌握 Agent 开发的核心 TypeScript 模式：异步操作、流式响应、类型安全的 schema 以及支撑 Claude Agent SDK 的接口设计。

---
### 为什么 Agent 开发要用 TypeScript？
Agent 开发需要处理异步操作、流式数据和结构化输出。TypeScript 提供了:

>类型安全 - 在编译时捕获错误，而非运行时
Async/Await - 简洁的语法处理 LLM 响应和工具调用
流式支持 - 原生 for await..of 处理 Agent 消息
Schema 验证 - Zod schema 确保结构化输出符合预期
Claude Agent SDK 使用 TypeScript 构建，并在整个 API 中充分利用这些特性。
---

### 模式 1：Async/Await 基础
Agent 操作本质上是异步的 — LLM 调用、工具执行和文件 I/O 都需要时间。TypeScript 的 async/await 为异步操作提供了同步风格的语法。

```ts
// @lesson-illustrative
// async/await 语法的通用示例 —— 这里的 `apiCall` 与 `processResponse`
// 只是占位符函数，并非 SDK 的 `query()`。（真正的 Agent SDK 形态见下面的 Pattern 2。）

// 没有 async/await（回调地狱）
function oldStyle() {
  apiCall(prompt).then((response) => {
    processResponse(response).then((result) => {
      console.log(result);
    });
  });
}

// 使用 async/await（清晰易读）
async function modernStyle() {
  const response = await apiCall(prompt);
  const result = await processResponse(response);
  console.log(result);
}
```

核心规则：

使用 await 的函数必须标记为 async
await 会暂停执行直到 Promise 完成
错误处理使用标准的 try/catch 块

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

async function runAgent() {
  try {
    const response = query({
      prompt: "What is 2+2?",
      options: { model: "sonnet" },
    });

    // 处理流式响应
    for await (const message of response) {
      if (message.type === "result" && message.subtype === "success") {
        console.log(message.result);
      }
    }
  } catch (error) {
    console.error("Agent failed:", error);
  }
}
```

SDK 洞察：Query 返回 AsyncIterable
Claude Agent SDK 的 query() 函数返回的是 AsyncIterable，而非 Promise。这使得流式响应成为可能，无需等待整个输出完成。
### 模式 2：使用 for await..of 处理流式数据

Agent 逐步生成响应。for await..of 循环可以在每条消息到达时进行处理：
```ts
import { query, type SDKAssistantMessage } from "@anthropic-ai/claude-agent-sdk";

function getAssistantText(message: SDKAssistantMessage): string {
  return message.message.content
    .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

const response = query({
  prompt: "List files and calculate their total size",
  options: { allowedTools: ["Bash", "Read"] },
});

// 实时处理每条消息
for await (const message of response) {
  switch (message.type) {
    case "system":
      console.log(`Session: ${message.session_id}`);
      break;
    case "assistant":
      console.log(`Thinking: ${getAssistantText(message)}`);
      break;
    case "tool_use_summary":
      console.log(`Using tool: ${message.summary}`);
      break;
    case "result":
      if (message.subtype === "success") {
        console.log(`Final: ${message.result}`);
      }
      break;
  }
}
```

### 模式 3：使用 Zod Schema 实现结构化输出
Agent 默认生成非结构化文本。Zod schema 可以约束输出以匹配你的数据结构：
```ts
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";

// 定义预期的输出结构
const TaskSchema = z.object({
  title: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  subtasks: z.array(z.string()),
  estimatedHours: z.number().positive(),
});

type Task = z.infer<typeof TaskSchema>;

const response = query({
  prompt: "Break down 'Build a chat app' into subtasks",
  options: {
    outputFormat: {
      type: "json_schema",
      schema: z.toJSONSchema(TaskSchema) as Record<string, unknown>,
    },
  },
});

for await (const message of response) {
  if (
    message.type === "result" &&
    message.subtype === "success" &&
    message.structured_output !== undefined
  ) {
    // 输出保证匹配 TaskSchema
    const task = message.structured_output as Task;
    console.log(`Task: ${task.title}`);
    console.log(`Priority: ${task.priority}`);
    console.log(`Subtasks: ${task.subtasks.length}`);
  }
}
```

Zod Schema 的优势：

验证 - 如果 LLM 输出不匹配 schema，会抛出错误
类型推断 - z.infer<typeof Schema> 生成 TypeScript 类型
文档化 - Schema 同时作为运行时验证器和编译时类型

给你的 Zod schema 添加 .refine() 来强制执行自定义业务规则：
```ts
const BudgetSchema = z
  .object({
    amount: z.number(),
    currency: z.string(),
  })
  .refine((data) => data.amount > 0 && data.amount < 1000000, {
    message: "Budget must be between $0 and $1M",
  });
  ```

### 模式 4：类型注解基础
TypeScript 类型注解通过在编译时捕获类型不匹配来防止 bug：

没有类型时，bug 只能在运行时被发现：
```ts
// @lesson-illustrative
// 未加类型 —— 这段能编译，但只要调用方传入数字或 null，
// `content.substring` 就会在运行时炸掉，TypeScript 帮不上忙。
function summarize(content) {
  return content.substring(0, 100);
}
```

加上参数类型，错误就会被前移到编译期：
```ts
// 加上类型 —— TypeScript 会拒绝任何传入非字符串的调用方。
function summarize(content: string): string {
  return content.substring(0, 100);
}
```
Agent 代码中常见的类型注解：
```ts
import { query, type Options, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";

// 函数参数和返回类型
async function runAgent(prompt: string, tools: string[]): Promise<string> {
  const options: Options = { allowedTools: tools };
  const response = query({ prompt, options });

  let finalContent: string = "";
  for await (const message of response) {
    if (message.type === "result" && message.subtype === "success") {
      finalContent = message.result;
    }
  }

  return finalContent;
}

// 变量类型推断（TypeScript 推断类型）
const config: Options = {
  model: "sonnet",
  maxTurns: 10,
};

// 显式类型注解（当推断需要帮助时）
const messages: SDKMessage[] = [];
```

类型推断 vs 显式类型
TypeScript 在大多数情况下会推断类型。在以下情况需要显式注解：1. 函数参数（无法推断）2. 空数组/对象（有歧义）3. 复杂返回类型（提高清晰度）

### 模式 5：使用接口定义 Agent 数据
接口为 Agent 数据结构定义契约。它们对于工具结果和 Agent 状态特别有用：
```ts
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";

// 工具结果接口
interface FileAnalysis {
  path: string;
  sizeBytes: number;
  lineCount: number;
  language: string;
}

// Agent 状态接口
interface AgentSession {
  sessionId: string;
  turnCount: number;
  toolCallsUsed: string[];
  memorySlots: Map<string, unknown>;
}

// 在 SDK 中使用接口
async function analyzeFile(filePath: string): Promise<FileAnalysis> {
  const response = query({
    prompt: `Analyze ${filePath}`,
    options: {
      allowedTools: ["Read", "Bash"],
      outputFormat: {
        type: "json_schema",
        schema: z.toJSONSchema(
          z.object({
            path: z.string(),
            sizeBytes: z.number(),
            lineCount: z.number(),
            language: z.string(),
          })
        ) as Record<string, unknown>,
      },
    },
  });

  for await (const message of response) {
    if (
      message.type === "result" &&
      message.subtype === "success" &&
      message.structured_output !== undefined
    ) {
      return message.structured_output as FileAnalysis;
    }
  }

  throw new Error("No result received");
}
```
接口 vs 类型：

Interface - 可扩展，更适合对象形状，错误信息更清晰
Type - 联合类型、工具类型、别名

```ts
// Interface（对象首选）
interface AgentConfig {
  model: string;
  maxTurns: number;
}

// Type（联合类型首选）
type MessageType = SDKMessage["type"];

// 扩展接口
interface AdvancedAgentConfig extends AgentConfig {
  temperature: number;
  topP: number;
}
```
```
动手试试 为你的第一个 Agent 添加类型
创建一个带有完整类型注解的简单 Agent：

为 Agent 配置定义一个 interface
 编写一个接收类型化参数的 async function
 使用 for await..of 处理响应流
 为结构化输出添加 Zod schema
 专注于让 TypeScript 在运行前捕获潜在错误！
```


### 综合运用
这是一个结合全部 5 种模式的完整示例：
```ts
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";

// 模式 5：配置接口
interface CodeReviewConfig {
  filePath: string;
  focusAreas: string[];
  maxIssues: number;
}

// 模式 3：输出的 Zod schema
const IssueSchema = z.object({
  severity: z.enum(["low", "medium", "high", "critical"]),
  line: z.number(),
  description: z.string(),
  suggestion: z.string(),
});

const ReviewSchema = z.object({
  summary: z.string(),
  issues: z.array(IssueSchema),
  rating: z.number().min(0).max(10),
});

type CodeReview = z.infer<typeof ReviewSchema>;

// 模式 1 & 4：带类型注解的异步函数
async function reviewCode(config: CodeReviewConfig): Promise<CodeReview> {
  const response = query({
    prompt: `Review ${config.filePath} focusing on: ${config.focusAreas.join(", ")}`,
    options: {
      model: "sonnet",
      allowedTools: ["Read", "Grep"],
      outputFormat: {
        type: "json_schema",
        schema: z.toJSONSchema(ReviewSchema) as Record<string, unknown>,
      },
    },
  });

  // 模式 2：使用 for await..of 处理流式数据
  for await (const message of response) {
    if (message.type === "tool_use_summary") {
      console.log(`Reading: ${message.summary}`);
    }
    if (
      message.type === "result" &&
      message.subtype === "success" &&
      message.structured_output !== undefined
    ) {
      return message.structured_output as CodeReview;
    }
  }

  throw new Error("Review failed");
}

// 使用示例
const review = await reviewCode({
  filePath: "src/agent.ts",
  focusAreas: ["security", "performance"],
  maxIssues: 10,
});

console.log(`Rating: ${review.rating}/10`);
console.log(`Issues found: ${review.issues.length}`);
```

### 延伸阅读
有了这些 TypeScript 基础，你已准备好：

P1 · Agent 基础 - 使用完整类型安全构建你的第一个 Agent 循环
P2 · 工具使用 - 定义类型化的工具 schema 和结果处理器
P3 · 提示词 - 使用 Zod schema 进行结构化提示词工程
P4 · 记忆 - 为会话状态和记忆管理添加类型
Claude Agent SDK 假定你具备 TypeScript 能力 — 这 5 种模式是后续所有内容的基础。
https://agentway.dev/zh/learn/docs/typescript-primer