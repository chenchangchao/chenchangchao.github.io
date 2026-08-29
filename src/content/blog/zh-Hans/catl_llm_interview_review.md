# 宁德时代 AI / LLM 工程面试复盘：考题整理与补课路线

> 复盘时间：2026-07-07  
> 面试方向：采购数智化 / AI 算法工程师 / 企业级 LLM 应用工程  
> 关键词：Agent、Advanced RAG、SFT、DPO、LLM 微调、Coding Agent、SSE、Nginx、多 Agent 编排

---

## 0. 总体判断

这场面试不是普通的“AI 应用开发”面试，也不是只问 RAG、Prompt、Tool Calling 的轻量 Agent 面试。

从面试官的问题看，岗位实际覆盖了更硬核的企业级 LLM 工程能力：

- 大模型基础架构理解；
- 预训练、SFT、DPO、RLHF 等训练 / 后训练方法；
- 单机单卡、单机多卡、多机多卡微调与训练工程；
- 企业级 Agent 架构设计；
- Naive RAG 到 Advanced RAG 的演进；
- Coding Agent / opencode / harness 模式；
- SSE 流式输出、Nginx 代理、中间件稳定性；
- 多 Agent 并行执行、状态监控、异常恢复；
- 长上下文溢出后的 summarization / compression。

这场面试暴露出的不是“完全不会 AI”，而是当前能力更偏 **AI 数据应用 / RAG / Agent 落地**，而面试官追问到了 **LLM 平台工程 / 后训练 / Agent Runtime / Serving 稳定性** 层面。

---

## 1. LLaMA 和 GPT 的区别

### 面试官可能想考察什么

- 是否理解主流大语言模型的基础架构；
- 是否知道 GPT、LLaMA、Qwen 等模型并不是完全不同物种；
- 是否能从架构、开源生态、部署方式、企业选型角度比较。

### 推荐回答

GPT 和 LLaMA 都是基于 Transformer Decoder-only 的自回归语言模型，核心目标都是根据前文预测下一个 token。

区别主要在几个方面：

1. **开放程度不同**  
   GPT 通常指 OpenAI 的闭源商业模型，通过 API 或产品服务使用；LLaMA 是 Meta 开源权重模型，更适合企业私有化部署、本地推理和二次微调。

2. **生态定位不同**  
   GPT 更强调通用能力、工具调用、多模态和产品化 API；LLaMA 更常作为开源基座模型，被企业或开发者用来做 LoRA / QLoRA 微调、私有化部署和推理优化。

3. **工程细节不同**  
   LLaMA 系列常见优化包括 RMSNorm、RoPE 位置编码、SwiGLU 激活函数，部分版本使用 GQA 来降低推理时 KV Cache 压力。

4. **企业选型不同**  
   如果追求效果和快速集成，可以选择 GPT / Claude / DeepSeek API；如果重视数据安全、成本、私有化和可控性，可以选择 LLaMA / Qwen 等开源模型。

### 一句话总结

> GPT 更像成熟的闭源商业模型服务，LLaMA 更像可私有化、可微调、可部署的开源基座模型；企业选型要在效果、成本、数据安全、延迟和可控性之间权衡。

---

## 2. 预训练、继续预训练、SFT、DPO、RLHF 的区别

### 面试官可能想考察什么

- 是否理解大模型训练流程；
- 是否知道 SFT 不是预训练，而是后训练 / 微调阶段；
- 是否能区分知识注入、行为对齐、偏好优化。

### 2.1 大模型训练粗略流程

```text
Pretraining 预训练
  ↓
Continued Pretraining / Domain Adaptive Pretraining 继续预训练 / 领域继续预训练
  ↓
SFT 监督微调
  ↓
Preference Alignment 偏好对齐：RLHF / DPO / PPO 等
  ↓
RAG / Tool Calling / Agent 工程化落地
```

### 2.2 各阶段对比

| 阶段 | 中文 | 目标 | 数据形式 | 解决的问题 |
|---|---|---|---|---|
| Pretraining | 预训练 | 学语言规律和通用知识 | 海量无标注文本 | 会不会说话、懂不懂基础世界知识 |
| Continued Pretraining | 继续预训练 / 领域预训练 | 适配领域语料分布 | 行业文档、制度、合同、技术资料 | 熟悉领域语言、术语、表达方式 |
| SFT | 监督微调 | 学会按指令和格式回答 | instruction-response | 会不会按任务要求输出 |
| RLHF | 人类反馈强化学习 | 符合人类偏好 | 偏好数据 + Reward Model + PPO | 回答是否有用、安全、符合偏好 |
| DPO | 直接偏好优化 | 用偏好对直接优化模型 | prompt + chosen + rejected | 比 RLHF 更轻量地做偏好对齐 |

### 2.3 推荐回答

我理解大模型训练大概分为预训练、继续预训练、SFT 和偏好对齐几个阶段。

预训练是用海量通用语料做 next token prediction，让模型学到通用语言能力和世界知识；继续预训练是用领域语料继续训练，比如采购合同、制度、技术规范，让模型适应领域语言分布；SFT 是监督微调，用 instruction-response 数据让模型学会按任务和格式回答；再往后是 RLHF、DPO 这类偏好对齐，让模型答案更符合人类偏好和安全要求。

企业落地时，我会先判断问题是知识更新、领域语言适配，还是输出行为适配：

- 知识经常变化，比如合同、报价、供应商状态，优先用 RAG；
- 领域语言和术语适配，可以考虑继续预训练；
- 固定报告格式、任务流程、工具调用格式，可以考虑 SFT；
- 回答偏好、安全边界、答案质量排序，可以考虑 DPO / RLHF。

### 一句话总结

> 预训练让模型具备基础能力，继续预训练让模型熟悉领域语言，SFT 让模型学会按任务回答，DPO / RLHF 让模型更符合人类偏好。

---

## 3. RAG 和模型微调的区别

### 面试官可能想考察什么

- 是否理解 RAG 和 Fine-tuning 的边界；
- 是否知道什么场景该用 RAG，什么场景该用 SFT；
- 是否能结合企业动态知识做判断。

### 推荐回答

RAG 和模型微调都是增强大模型能力的方法，但解决的问题不同。

RAG 是在推理时从外部知识库检索相关内容，再把证据放进上下文让模型回答。它适合处理频繁变化、需要可追溯的数据，比如合同、报价单、供应商状态、产品文档、评论数据、制度知识库。优点是知识更新快、可引用、可控性强，不需要重新训练模型；缺点是依赖检索质量，如果召回、rerank 或上下文组织不好，答案也会不稳定。

微调是改变模型参数，让模型学会特定任务、风格、格式或领域表达。比如让模型稳定输出采购分析报告格式、学会企业内部术语、学会特定分类标准、学会工具调用格式。优点是输出更稳定、格式遵循更好、特定任务表现更一致；缺点是训练成本更高，知识更新不灵活，如果把频繁变化的信息写进模型参数，维护成本会很高。

### 对比表

| 对比项 | RAG | 微调 / SFT |
|---|---|---|
| 核心目的 | 获取外部知识 | 改变模型行为 |
| 是否改模型参数 | 不改 | 改 |
| 适合数据 | 动态知识、企业文档、合同、报价、评论 | 稳定任务、输出格式、领域话术、分类边界 |
| 更新方式 | 更新知识库 / 向量库 | 重新训练或增量训练 |
| 可追溯性 | 强，可以引用来源 | 弱，模型内部参数不可直接追溯 |
| 成本 | 主要是检索和推理成本 | 有训练成本和评估成本 |
| 主要风险 | 检索不到、召回不准、上下文噪声 | 过拟合、灾难性遗忘、数据质量差 |

### 采购场景回答

采购合同、供应商报价、历史订单这些数据经常变化，我不会用微调让模型“记住”，而是放到 RAG 或数据库里实时检索。

但如果希望模型每次都按照“结论、证据、风险、建议动作”的格式输出采购分析报告，或者希望它更懂公司内部的风险分级标准，这类稳定行为可以用 SFT。

最理想的是二者结合：RAG 提供最新证据，SFT 让模型更稳定地基于证据生成结构化报告。

### 一句话总结

> RAG 是给模型外挂资料库，微调是改变模型的做题习惯；动态知识用 RAG，稳定行为用 SFT。

---

## 4. 单机单卡、多机多卡如何做模型微调 / 训练

### 面试官可能想考察什么

- 是否了解训练工程；
- 是否知道为什么单卡通常用 LoRA / QLoRA；
- 是否知道 DDP、FSDP、DeepSpeed ZeRO 等分布式训练概念。

### 4.1 单机单卡

单机单卡通常不会全量微调大模型，而是使用 LoRA / QLoRA 这种参数高效微调方式。

基本流程：

1. 准备 instruction-response 数据集；
2. 选择基座模型，比如 Qwen / LLaMA / Gemma 小模型；
3. 使用 4-bit 或 8-bit 量化加载基座模型；
4. 冻结大部分基座参数，只训练 LoRA adapter；
5. 通过 gradient accumulation 模拟更大的 batch size；
6. 开启 fp16 / bf16 / gradient checkpointing 降低显存；
7. 训练完成后保存 adapter；
8. 推理时加载 adapter，或者 merge 到基座模型。

### 4.2 单机多卡 / 多机多卡

多卡训练核心是分布式训练。

| 技术 | 作用 |
|---|---|
| DDP | 数据并行，每张卡一份模型，分不同 batch，梯度同步 |
| ZeRO | 切分优化器状态、梯度、参数，降低单卡显存 |
| FSDP | PyTorch 原生全分片数据并行 |
| Tensor Parallel | 把模型层内部矩阵切到多张卡 |
| Pipeline Parallel | 把模型不同层切到不同卡 |
| Gradient Accumulation | 多次小 batch 累积，模拟大 batch |

### 推荐回答

如果是单机单卡，我会优先使用 LoRA / QLoRA，而不是全参数微调。单卡训练时先选择 1.5B-7B 模型，根据显存选择 4-bit 量化加载基座模型，只训练 LoRA adapter。通过 gradient accumulation 模拟更大的 batch size，开启 fp16 / bf16，必要时使用 gradient checkpointing 降低显存。训练完成后保存 adapter，可以推理时加载，也可以 merge 到基座模型。

如果是多机多卡，核心是分布式训练。常见方案包括 DDP、DeepSpeed ZeRO、FSDP。DDP 主要做数据并行，每张卡放一份模型；ZeRO / FSDP 会把参数、梯度、优化器状态切分到多张卡，降低单卡显存压力。训练时需要处理通信、梯度同步、checkpoint、容错和吞吐优化。

### 一句话总结

> 单卡优先 LoRA / QLoRA 跑通小规模验证，多卡通过 DDP / ZeRO / FSDP 做分布式训练，核心是在显存、吞吐、通信和稳定性之间平衡。

---

## 5. 怎么设计一个复杂 Agent

### 面试官可能想考察什么

- 是否知道 Agent 不只是 prompt；
- 是否能设计企业级 Agent 架构；
- 是否理解工具、权限、状态、日志、终止条件。

### 推荐回答

我会把复杂 Agent 设计成几个层次：入口层、任务理解层、规划层、工具层、记忆层、执行控制层、评估监控层。

用户输入进入系统后，先做意图识别和权限校验，判断这是问答、数据查询、代码生成、报表分析，还是流程审批类任务。然后由 Planner 把复杂任务拆成多个步骤，比如“查询数据 → 检索文档 → 调用工具 → 生成中间结论 → 校验 → 输出最终报告”。

工具层要小而确定，比如 SQL 查询工具、知识库检索工具、代码执行工具、文件解析工具、报表生成工具、消息推送工具。每个工具都要有清晰的输入 schema、权限校验、错误码和结构化输出。

复杂 Agent 不能完全自由运行，要有状态管理和终止条件，比如最大迭代次数、最大 token、工具失败次数、重复调用检测、人工确认节点。高风险任务，比如执行 SQL、修改代码、发送邮件、变更采购数据，必须有人审或 sandbox 执行。

最后要有日志、trace、评估和反馈体系，记录每一步的 prompt、工具调用、返回结果、耗时、错误和用户采纳情况，用来优化 Agent。

### 采购场景示例

```text
用户问题：
帮我分析 A 供应商最近一年铜箔报价上涨是否异常，并生成报告。

Agent 流程：
1. 解析任务：供应商=A，物料=铜箔，时间=最近一年
2. 权限校验：用户是否能查看该供应商和物料数据
3. 调用 SQL 工具：查询历史采购价、报价记录、订单量
4. 调用 RAG 工具：检索合同价格调整条款、供应商涨价邮件、市场行情报告
5. 调用分析工具：计算涨幅、均值偏离、异常阈值
6. 调用 LLM：基于证据生成结构化分析
7. 校验：金额、日期、供应商名称必须来自工具结果
8. 输出：结论、证据、风险、建议动作、引用来源
```

### 一句话总结

> 复杂 Agent 的核心不是让模型自由发挥，而是让模型在可控的流程、工具、权限、状态和评估体系里完成复杂任务。

---

## 6. Agent 陷入死循环，应该怎么处理

### 面试官可能想考察什么

- 是否理解 Agent Runtime 风险；
- 是否知道最大迭代次数只是兜底；
- 是否能从状态管理、工具设计、终止条件角度回答。

### 推荐回答

Agent 陷入死循环通常有几类原因：目标不清晰、规划不收敛、工具返回模糊、模型反复调用同一个工具、状态没有记录，或者缺少明确停止条件。

处理上我会分几层。

第一是硬性兜底，比如最大迭代次数、最大执行时间、最大 token、最大工具调用次数、最大成本。

第二是设计明确停止条件，比如已经拿到足够证据、连续工具失败、连续返回相同结果、缺少必要参数需要澄清，或者任务已经进入最终回答阶段。

第三是状态管理，记录每一步调用过什么工具、输入参数是什么、返回了什么结果，避免重复查同一个问题。

第四是工具输出要结构化，有明确成功、失败、空结果、权限不足等状态码，避免模型误解。

第五是复杂流程尽量用状态机或工作流约束，不要完全让模型自由规划。

生产环境还要有日志、trace、告警和人工接管机制，一旦发现循环、异常成本或重复调用，可以中断并回退。

### 技术措施表

| 问题 | 处理方式 |
|---|---|
| 重复调用同一工具 | 记录 tool call history，检测相同工具 + 相同参数 |
| 工具一直失败 | 设置 failure count，超过阈值停止 |
| 结果不收敛 | 设置最大迭代次数和任务状态机 |
| 上下文越来越长 | summary memory / context compression |
| 模型乱规划 | Planner 输出结构化计划，Executor 按状态机执行 |
| 高风险操作 | human-in-the-loop 人工确认 |
| 成本失控 | token / time / tool call budget |

### 一句话总结

> 超时和最大迭代次数只是兜底，更重要的是状态管理、停止条件、工具调用历史、错误码、状态机和人工接管。

---

## 7. 多个子 Agent 并行执行：状态监控与优缺点

### 面试官可能想考察什么

- 是否理解 Multi-Agent Orchestration；
- 是否知道并行执行不是简单开多个 LLM；
- 是否能设计状态监控、聚合、失败处理。

### 推荐回答

多个子 Agent 并行执行时，我会设计一个主控 Orchestrator 或 Coordinator。主 Agent 不直接完成所有工作，而是负责拆解任务、分配子任务、维护全局状态、收集子 Agent 结果、做冲突处理和最终汇总。

每个子 Agent 只负责一个明确职责，比如价格分析、合同检索、供应商风险、市场行情、报告生成。子 Agent 的输入输出要结构化，最好包含状态、结果、证据、置信度、错误信息和耗时。

状态监控上，我会维护一个任务状态表或事件流，记录每个子 Agent 的状态，比如 pending、running、success、failed、timeout、cancelled。主控层要能看到每个子任务的进度、耗时、失败原因、重试次数和输出结果。对于失败任务，可以根据重要程度决定重试、降级、跳过或人工介入。

最后，多个子 Agent 的结果不能简单拼接，需要有 Aggregator / Verifier 做汇总和校验，处理冲突结论。

### 状态表设计

```text
task_id
agent_name
status: pending/running/success/failed/timeout/cancelled
input
output
error_message
start_time
end_time
retry_count
confidence
evidence_refs
```

### 事件流设计

```text
TaskCreated
SubAgentStarted
ToolCalled
SubAgentCompleted
SubAgentFailed
AggregatorStarted
FinalAnswerGenerated
```

### 优点

| 优点 | 解释 |
|---|---|
| 提升速度 | 价格、合同、供应商、行情可以同时查 |
| 职责清晰 | 每个 Agent 专注一个任务 |
| 可扩展 | 新增市场行情 Agent、法务 Agent 比较容易 |
| 易监控 | 每个子任务状态独立 |
| 容错灵活 | 某个子 Agent 失败可降级，不一定全局失败 |

### 缺点

| 缺点 | 解释 |
|---|---|
| 架构复杂 | 需要 Orchestrator、状态管理、结果聚合 |
| 成本更高 | 多个 Agent 可能并发调用模型和工具 |
| 结果冲突 | 不同 Agent 可能给出矛盾结论 |
| 上下文重复 | 多个 Agent 可能重复检索同一批资料 |
| 调试困难 | 链路长，需要 trace |
| 一致性问题 | 全局状态和子任务状态要同步 |

### 一句话总结

> 多子 Agent 并行的关键是 Orchestrator、结构化输入输出、状态表、超时重试、降级策略、结果聚合和最终 Verifier。

---

## 8. 从 Naive RAG 到 Advanced RAG

### 面试官可能想考察什么

- 是否理解基础 RAG 的缺陷；
- 是否知道企业级 RAG 的完整链路；
- 是否能讲出 query rewrite、hybrid search、rerank、compression、citation、evaluation。

### 8.1 Naive RAG

Naive RAG 一般是最基础的流程：

```text
Documents
  ↓ chunk
Embedding
  ↓
Vector DB
  ↓
User Query
  ↓
Top-K Retrieval
  ↓
Prompt + Context
  ↓
LLM Answer
```

### 8.2 Naive RAG 的问题

- 文档切分粗糙；
- 只靠向量检索，精确字段容易漏；
- Top-K 排序不稳定；
- 没有 rerank；
- 没有 query rewrite；
- 没有权限控制；
- 上下文容易塞太多；
- 答案缺少引用；
- 缺少评估体系。

### 8.3 Advanced RAG 的升级方向

1. **数据侧增强**  
   文档解析不能简单按固定长度切分，要根据标题、章节、表格、合同条款、物料编码、供应商、日期等结构切分。每个 chunk 要带 metadata。

2. **混合检索 Hybrid Search**  
   不只用向量检索，还要结合 BM25、SQL、metadata filter。

3. **Query Rewrite / Query Decomposition**  
   对模糊问题先改写，复杂问题拆成多个子问题。

4. **Rerank 精排**  
   第一阶段召回关注 recall，rerank 判断哪些片段真正能回答问题。

5. **Context Compression**  
   检索结果太多时，抽取与问题相关的事实、数字、条款和引用来源，减少上下文噪声。

6. **Answer Grounding / Citation**  
   最终答案必须基于证据生成，带引用来源。

7. **Permission Control**  
   企业场景必须按用户权限过滤文档、供应商、合同、报价单等数据。

8. **Evaluation**  
   评估 Recall@K、MRR、引用准确率、答案准确率、幻觉率、响应时间、用户采纳率。

### 推荐回答

Naive RAG 是简单向量召回加 LLM 生成；Advanced RAG 会在文档解析、metadata、混合检索、query rewrite、query decomposition、rerank、context compression、引用溯源、权限控制和评估体系上增强。企业级 RAG 的关键不是把文档塞进向量库，而是让模型找到正确证据、控制访问范围、压缩上下文，并输出可追溯答案。

### 一句话总结

> Naive RAG 是“搜出来塞给模型”，Advanced RAG 是“解析好、检索准、排得对、压缩稳、有引用、可评估、可控权”。

---

## 9. 上下文溢出：Summarization / Compression 怎么做

### 面试官可能想考察什么

- 是否知道不能简单截断；
- 是否理解长上下文管理；
- 是否能区分检索上下文压缩、多轮记忆压缩、超长文档摘要。

### 推荐回答

如果出现上下文溢出，我不会简单截断，因为截断可能丢掉关键证据。我会做分层处理。

第一，检索阶段先控制候选规模，比如混合检索后 rerank，只保留最相关的 Top K。

第二，对 Top K 做 context compression，抽取和用户问题直接相关的句子、数字、条款和引用来源，去掉无关背景。

第三，多轮对话场景下，用 summary memory 把历史对话压缩成结构化状态，比如当前任务、已知事实、待解决问题、用户偏好，而不是每轮都塞完整历史。

第四，超长文档可以用 map-reduce 或 refine summarization，先分段总结，再合并成全局摘要。

第五，对于采购合同、报价单这类高风险内容，我更倾向于 extractive compression，也就是抽取原文证据，而不是让模型自由改写，避免摘要产生幻觉。

### 结构化 Summary Memory 示例

```json
{
  "task": "分析A供应商铜箔报价上涨是否异常",
  "known_facts": [
    "2026 Q2 报价较过去12个月均值上涨18%",
    "合同第8.2条规定价格调整需双方书面确认"
  ],
  "open_questions": [
    "是否存在供应商涨价说明邮件",
    "同类供应商是否同步涨价"
  ],
  "user_preferences": [
    "输出结构化报告",
    "需要引用证据"
  ]
}
```

### 一句话总结

> 上下文溢出不能简单截断，要通过 rerank 控候选、context compression 抽证据、summary memory 管对话、map-reduce / refine 处理长文档，高风险场景优先抽取式摘要。

---

## 10. opencode 服务与 Harness 模式

### 面试官可能想考察什么

- 是否理解 AI Coding Agent 不是简单调模型；
- 是否知道模型外面需要执行环境、工具、沙箱、测试、日志；
- 是否能设计面向一线业务运营人员的 AI Coding 服务。

### 10.1 Harness 是什么

Harness 在 coding agent 语境里，通常指包在模型外面的运行框架 / 执行外壳 / 测试与工具环境。

可以理解为：

> Harness 是把 LLM 变成可执行 Agent 的那层工程系统。

它通常负责：

- 给模型提供任务上下文；
- 管理代码仓库 / 文件系统；
- 暴露工具，比如读文件、改文件、执行命令、跑测试；
- 控制 Agent 的执行循环；
- 收集 stdout / stderr / 测试结果；
- 做错误恢复、重试、终止条件；
- 记录 trace、日志、token、成本；
- 做权限、沙箱、审计。

### 推荐回答

我理解 harness 模式就是在 LLM 外面加一层可控的执行框架，把模型的自然语言能力转化为对代码仓库、命令行、测试环境和工具系统的可控操作。模型不直接随意执行，而是通过 harness 暴露的工具来读文件、改代码、运行测试、查看错误、继续修复。

这个 harness 需要负责状态管理、工具权限、沙箱隔离、执行日志、错误重试、最大迭代次数、测试验证和人工接管。尤其是在企业场景里，一线业务运营人员可能只描述需求，比如“帮我生成一个报表脚本”或者“帮我修改一个数据处理逻辑”，harness 要把这个需求转成安全的 Agent 执行流程，而不是让模型直接操作生产系统。

### opencode 服务架构

```text
用户入口 Web / 飞书 / 内部平台
  ↓
权限认证与任务解析
  ↓
Agent Harness
  ├─ 模型调用
  ├─ 工具编排
  ├─ 文件系统访问
  ├─ 代码执行沙箱
  ├─ 测试运行
  ├─ 错误反馈
  └─ Trace / 日志
  ↓
人工确认 / 审计
  ↓
结果交付
```

### 一句话总结

> Harness = 模型外面的执行与控制外壳，负责让 Coding Agent 安全、可控、可测试、可追踪地操作真实环境。

---

## 11. SSE 流式输出报错，如何通过 Nginx 或中间件解决

### 面试官可能想考察什么

- 是否有 LLM 服务工程经验；
- 是否知道 SSE 是长连接流式输出；
- 是否知道 Nginx buffering、timeout、gzip、中间件流式透传等问题。

### 常见问题

- Nginx 默认 buffering 导致前端不能实时收到 token；
- 中间层把响应整体 await 完再返回，破坏流式输出；
- proxy_read_timeout 太短，大模型生成中途断开；
- gzip / cache 影响流式传输；
- 连接断开后没有 error event 或心跳；
- 上游模型服务异常，中间层没有正确透传错误。

### 推荐回答

SSE 是长连接流式输出，最常见的问题是被 Nginx 或中间层缓冲、超时、断开，导致前端收不到实时 token，或者输出到一半中断。

我会从几层排查：

第一，服务端响应头要正确，比如 `Content-Type: text/event-stream`，`Cache-Control: no-cache`，`Connection: keep-alive`，并且及时 flush。

第二，Nginx 要关闭 buffering，比如设置 `proxy_buffering off`、`X-Accel-Buffering no`，否则 Nginx 可能等缓冲满了才返回，流式效果就没了。

第三，要调大超时时间，比如 `proxy_read_timeout`，因为大模型生成可能持续很久。

第四，中间件要支持流式透传，不能把响应一次性 await 完再返回。Node / Python 服务都要用 stream 的方式逐块转发。

第五，要处理断线重连、心跳包和错误事件，比如定期发送 ping，模型端报错时返回 `event: error`，而不是让连接静默断掉。

### Nginx 配置示例

```nginx
location /api/chat/stream {
    proxy_pass http://backend;
    proxy_http_version 1.1;

    proxy_set_header Connection "";
    proxy_set_header Host $host;

    proxy_buffering off;
    proxy_cache off;
    gzip off;

    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;

    add_header X-Accel-Buffering no;
}
```

### 一句话总结

> SSE 稳定性的关键是正确响应头、关闭 Nginx buffering、延长 timeout、中间件流式透传、心跳保活和错误事件显式返回。

---

## 12. 今天面试考题总表

| 题目 | 背后考点 | 当前需要补强 |
|---|---|---|
| LLaMA 和 GPT 区别 | 模型架构与生态选型 | Decoder-only、RoPE、RMSNorm、GQA、KV Cache |
| SFT、预训练、其他训练方式区别 | 大模型训练流程 | Pretraining、CPT、SFT、DPO、RLHF |
| 单机单卡 / 多机多卡怎么训练 | 训练工程 | LoRA、QLoRA、DDP、FSDP、DeepSpeed ZeRO |
| RAG 和微调区别 | 技术选型 | 动态知识 vs 稳定行为 |
| 复杂 Agent 怎么设计 | 企业 Agent 架构 | Router、Planner、Tool、Memory、Verifier、Monitor |
| Agent 死循环怎么处理 | Agent Runtime | 终止条件、状态机、工具历史、人工接管 |
| 多子 Agent 并行 | Multi-Agent Orchestration | Orchestrator、状态表、降级、结果聚合 |
| Naive RAG 到 Advanced RAG | 企业 RAG 工程化 | Hybrid Search、Rerank、Compression、Citation、Eval |
| 上下文溢出如何压缩 | 长上下文管理 | Summary Memory、Context Compression、Map-Reduce |
| opencode harness 模式 | Coding Agent 基础设施 | 沙箱、测试、工具、trace、权限 |
| SSE 输出报错 | LLM Serving 稳定性 | Nginx buffering、timeout、stream 透传、心跳 |

---

# 补课进阶路线

## 总目标

把自己从“AI 数据应用 / RAG / Agent 项目经验”升级成：

> 懂模型基础、能跑 SFT / DPO 实验、能设计企业级 Agent / Advanced RAG、能处理 LLM 服务流式输出和运行时稳定性的 AI 应用工程师。

---

## 第一阶段：LLM 基础与模型训练概念（3-5 天）

### 目标

能讲清楚 LLaMA / GPT / Qwen 的基础架构，理解预训练、SFT、DPO、RLHF 的区别。

### 学习重点

- Transformer Decoder-only；
- next token prediction；
- Tokenizer；
- Attention；
- RoPE；
- RMSNorm；
- SwiGLU；
- GQA / MQA；
- KV Cache；
- Pretraining / CPT / SFT / DPO / RLHF。

### 输出成果

写一篇博客：

> 《从 GPT 到 LLaMA：大模型训练流程与 SFT / DPO / RAG 的边界》

---

## 第二阶段：Colab / Kaggle 跑通 SFT（1 周）

### 目标

用小模型跑通一次 LoRA / QLoRA SFT。

### 推荐模型

- Qwen2.5-0.5B / 1.5B；
- Qwen2.5-3B；
- Gemma 2B；
- Llama 3.2 3B。

### 推荐工具

- HuggingFace Transformers；
- PEFT；
- TRL；
- bitsandbytes；
- Unsloth；
- datasets。

### 实战项目

做一个 **Procurement SFT Mini Lab**。

用 200-500 条采购分析样本微调一个小模型，让它学会按照固定格式输出：

```md
## 结论
...

## 关键证据
...

## 风险点
...

## 建议动作
...
```

### 需要观察

- SFT 前后格式遵循是否提升；
- 是否更稳定使用业务术语；
- 是否更适合生成结构化报告；
- 是否存在过拟合；
- loss 曲线如何变化。

### 输出成果

写一篇博客：

> 《用 Colab 对 Qwen 做一次采购场景 QLoRA SFT：从数据集到 LoRA Adapter》

---

## 第三阶段：DPO 偏好优化实验（3-5 天）

### 目标

理解 chosen / rejected 数据，跑通一次 DPO。

### 数据样例

```json
{
  "prompt": "请分析这个供应商报价是否异常。",
  "chosen": "报价较历史均值上涨18%，超过10%阈值，建议标记为异常，并结合原材料价格和合同条款进一步核查。",
  "rejected": "这个报价看起来还行，可以接受。"
}
```

### 学习重点

- SFT 是模仿标准答案；
- DPO 是让模型偏好 chosen 而不是 rejected；
- DPO 比 RLHF 工程流程更轻；
- DPO 适合优化回答风格、偏好和安全边界。

### 输出成果

写一篇博客：

> 《SFT 之后为什么还需要 DPO：用采购分析样本做一次偏好优化实验》

---

## 第四阶段：Advanced RAG 实战升级（1 周）

### 目标

把现有 VOC / 采购 RAG 从 Naive RAG 升级到 Advanced RAG。

### 实现模块

- 文档结构化切分；
- metadata filter；
- BM25 + Vector Hybrid Search；
- Rerank；
- Context Compression；
- Citation；
- RAG Eval。

### 技术建议

- PostgreSQL + pgvector；
- BM25 可以用 PostgreSQL full text search 或 Tantivy / Elasticsearch；
- Rerank 可先用开源 reranker 或 LLM rerank；
- Context Compression 可先做 extractive compression。

### 输出成果

升级你的 VOC Dashboard：

> 从“相似评论召回”升级为“Hybrid Search + Rerank + Issue Evidence Compression”。

写一篇博客：

> 《从 Naive RAG 到 Advanced RAG：以 VOC 评论洞察系统为例》

---

## 第五阶段：复杂 Agent Runtime 实战（1 周）

### 目标

实现一个带状态管理、工具调用、trace、终止条件的复杂 Agent Demo。

### 项目建议

做一个 **Procurement Risk Agent**：

输入：

> 帮我分析 A 供应商最近一年铜箔报价上涨是否异常。

Agent 流程：

1. Router 判断任务类型；
2. Planner 拆成价格、合同、供应商、行情几个子任务；
3. Tool 调用 SQL / RAG / 计算工具；
4. Memory 保存中间状态；
5. Verifier 校验金额、日期、合同引用；
6. Final Answer 生成结构化报告；
7. Trace 记录每一步。

### 必须实现的工程机制

- 最大迭代次数；
- 最大工具调用次数；
- 重复工具调用检测；
- 工具失败计数；
- 状态表；
- trace 日志；
- 人工确认节点。

### 输出成果

GitHub 项目：

> `procurement-risk-agent`

README 中展示：

- 架构图；
- 工具 schema；
- 状态表设计；
- trace 样例；
- 死循环保护策略。

---

## 第六阶段：Multi-Agent 并行与状态监控（3-5 天）

### 目标

在复杂 Agent 基础上，增加多个子 Agent 并行执行。

### 子 Agent 设计

- PriceAgent：价格趋势与异常计算；
- ContractAgent：合同条款检索；
- SupplierAgent：供应商画像与履约风险；
- MarketAgent：行情资料检索；
- ReportAgent：最终报告生成；
- VerifierAgent：事实和证据校验。

### 状态监控

实现任务状态表：

```text
task_id
agent_name
status
input
output
error_message
start_time
end_time
retry_count
confidence
evidence_refs
```

### 输出成果

写一篇博客：

> 《多 Agent 并行执行如何做状态监控、失败降级和结果聚合》

---

## 第七阶段：SSE / Nginx / LLM Serving 工程补课（3-5 天）

### 目标

补齐 LLM 服务流式输出工程经验。

### 实战任务

用 Node.js / Fastify 或 Python / FastAPI 实现一个流式聊天接口：

- 后端调用模型 API；
- 使用 SSE 流式输出；
- Nginx 反向代理；
- 关闭 proxy buffering；
- 设置 timeout；
- 加心跳 ping；
- 模型异常时返回 event: error；
- 前端 EventSource 接收。

### 输出成果

GitHub 项目：

> `llm-sse-nginx-demo`

README 中展示：

- SSE 后端代码；
- Nginx 配置；
- 常见报错；
- 如何排查 buffering / timeout / 中间件非流式透传。

---

## 第八阶段：Coding Agent Harness Mini Demo（1 周）

### 目标

理解 opencode / harness 模式，做一个最小 Coding Agent。

### 功能设计

用户输入：

> 帮我写一个 SQL 查询脚本，并生成 CSV 报表。

Harness 执行：

1. 创建任务；
2. 模型生成计划；
3. 读取 schema 文件；
4. 生成 SQL；
5. dry-run / explain；
6. 沙箱执行；
7. 捕获 stdout / stderr；
8. 如果报错，把错误反馈给模型修复；
9. 成功后输出文件；
10. 全链路 trace。

### 关键机制

- 文件系统沙箱；
- 命令执行白名单；
- 最大执行次数；
- 测试结果反馈；
- 人工确认；
- 审计日志。

### 输出成果

GitHub 项目：

> `mini-coding-agent-harness`

博客：

> 《什么是 Coding Agent Harness：从 opencode 面试题到一个最小可运行 Demo》

---

# 三个月进阶计划

## 第 1 个月：补模型训练与 RAG

- LLaMA / GPT / Qwen 架构基础；
- SFT / LoRA / QLoRA；
- DPO；
- Naive RAG → Advanced RAG；
- 完成 2 篇博客 + 1 个 SFT Notebook。

## 第 2 个月：补 Agent Runtime 与 Multi-Agent

- 复杂 Agent 架构；
- 状态机；
- 死循环保护；
- 多子 Agent 并行；
- trace / monitor / eval；
- 完成 `procurement-risk-agent` 项目。

## 第 3 个月：补 LLM Serving 与 Coding Agent

- SSE / Nginx；
- 流式输出；
- 错误恢复；
- Coding Agent Harness；
- 沙箱执行；
- 完成 `llm-sse-nginx-demo` 和 `mini-coding-agent-harness`。

---

# 简历可新增项目描述

## 项目：企业采购智能分析 Agent

基于 PostgreSQL / pgvector / LLM API 构建采购风险分析 Agent，支持供应商报价异常分析、合同条款检索、供应商履约风险总结和结构化报告生成。系统采用 Router + Planner + Tool Executor + Verifier 架构，集成 SQL 查询、Advanced RAG、Hybrid Search、Rerank、Context Compression 和 Citation。设计任务状态表记录子 Agent 执行状态、工具调用、错误信息和证据引用，并通过最大迭代次数、重复调用检测、失败重试和人工确认机制避免 Agent 死循环。

## 项目：Qwen 采购场景 SFT / DPO Mini Lab

使用 Colab / Kaggle GPU 平台基于 Qwen 小模型完成 LoRA / QLoRA SFT 实验，构造采购分析 instruction-response 数据集，使模型稳定输出“结论、证据、风险、建议动作”的结构化报告格式；进一步构造 chosen / rejected 偏好样本，尝试 DPO 优化回答偏好。对比基座模型与微调模型在格式遵循、业务术语、回答稳定性方面的表现。

## 项目：LLM SSE 流式服务与 Nginx 代理 Demo

基于 Node.js / Fastify 或 Python / FastAPI 实现 LLM 流式聊天接口，使用 SSE 向前端逐 token 输出；通过 Nginx 反向代理配置 `proxy_buffering off`、`proxy_read_timeout`、`X-Accel-Buffering no` 等参数解决流式输出被缓冲和超时中断问题；实现心跳保活、错误事件返回和前端断线处理。

---

# 最后复盘

这场面试虽然主观感受很痛苦，但价值很高。它把下一阶段要补的能力边界全部暴露出来了：

```text
企业级 LLM 工程能力
  ├─ 模型基础：LLaMA / GPT / Qwen / Transformer
  ├─ 后训练：SFT / LoRA / QLoRA / DPO / RLHF
  ├─ RAG：Hybrid Search / Rerank / Compression / Citation / Eval
  ├─ Agent：Router / Planner / Tool / Memory / Verifier / Monitor
  ├─ Multi-Agent：Orchestrator / 状态表 / 并行 / 降级 / 聚合
  ├─ Runtime：死循环保护 / trace / 日志 / 人工接管
  ├─ Serving：SSE / Nginx / timeout / buffering / error event
  └─ Coding Agent：Harness / 沙箱 / 测试 / 文件系统 / 审计
```

这不是一次失败的面试，而是一次非常清晰的技术路线扫描。

接下来最重要的不是自责，而是把这套路线拆成几个小项目，用 Colab / Kaggle / 本地 Node.js / PostgreSQL 一步步补起来。三个月后，这些今天答不上来的问题，就会变成你简历和博客里的核心亮点。
