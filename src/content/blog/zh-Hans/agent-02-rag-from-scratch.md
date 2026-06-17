---
title: "Agent 教程 02：从零实现一个轻量 RAG 检索流程"
description: "用 ch05 的哈希向量、文本切片和 Top-K 检索理解 RAG 的核心数据流。"
pubDate: 2026-06-09
tags: ["RAG", "Python", "向量检索"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch05"
translationKey: "rag-from-scratch"
---

## 问题背景

RAG 容易被向量数据库、Embedding 服务和框架 API 包装得很复杂。ch05 先不用 FAISS、Chroma 或外部 Embedding API，而是用哈希向量模拟文本向量化，让检索增强生成的主链路变得透明。

## 流程图

```text
原始文本 -> 清洗 -> 切片 -> 哈希向量 -> 相似度检索 -> Top-K 片段 -> Prompt -> LLM 回答
```

## 关键实现片段

最小检索器只需要三件事：文档、向量化函数、相似度排序。

```python
class SimpleVectorStore:
    def __init__(self, documents: Iterable[str | Document], dim: int = 256):
        self.documents = [
            item if isinstance(item, Document) else Document(page_content=str(item))
            for item in documents
            if str(item).strip()
        ]
        self.embeddings = [hashing_embedding(doc.page_content, dim=dim) for doc in self.documents]

    def similarity_search(self, query: str, k: int = 3):
        query_vec = hashing_embedding(query, dim=self.dim)
        scored = [(doc, cosine_similarity(query_vec, vec)) for doc, vec in zip(self.documents, self.embeddings)]
        scored.sort(key=lambda item: item[1], reverse=True)
        return scored[:k]
```

中文文本的切片也保持轻量，用句号、问号、感叹号等边界切分，并保留少量 overlap。

## 本地运行命令

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch05/src/5_1_simple_vector_search.py
python3 ch05/src/5_3_rag_retrieval_demo.py
python3 ch05/src/5_7_legal_rag_retrieval_qa.py
```

## 精选输出

```text
查询： 什么是向量数据库？
[Top 1 | score=0.447] 向量数据库实现高效相似性匹配
[Top 2 | score=0.316] 嵌入模型用于将文本转化为向量
```

## 工程复盘

真正值得先掌握的是 RAG 的数据流，而不是工具名。只要能解释“为什么这个 chunk 被召回”“Prompt 中给了哪些证据”“模型是否基于证据回答”，后续换成真实 Embedding 和向量数据库就是工程替换。
