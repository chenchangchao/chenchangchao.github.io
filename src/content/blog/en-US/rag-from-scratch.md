---
title: "Agent Tutorial 02: Building a Lightweight RAG Pipeline from Scratch"
description: "A transparent RAG walkthrough using hashing embeddings, chunking, and Top-K retrieval from ch05."
pubDate: 2026-06-09
tags: ["RAG", "Python", "Vector Search"]
sourceRepo: "chenchangchao/dev_agents"
sourcePath: "projects/agent-getstarted-python/ch05"
translationKey: "rag-from-scratch"
---

## Background

RAG can look bigger than it is when vector databases, embedding APIs, and orchestration frameworks arrive too early. Chapter 5 starts with no FAISS, no Chroma, and no external embedding service. It uses hashing embeddings so the retrieval flow is easy to inspect.

## Flow

```text
raw text -> cleaning -> chunking -> hashing embeddings -> similarity search -> Top-K chunks -> prompt -> LLM answer
```

## Key Code

The minimal retriever needs documents, an embedding function, and similarity sorting.

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

Chinese chunking stays lightweight too: split by sentence boundaries and keep a small overlap.

## Run Locally

```bash
cd /Users/dustchen/workdir/dev_agents/projects/agent-getstarted-python
python3 ch05/src/5_1_simple_vector_search.py
python3 ch05/src/5_3_rag_retrieval_demo.py
python3 ch05/src/5_7_legal_rag_retrieval_qa.py
```

## Selected Output

```text
query: What is a vector database?
[Top 1 | score=0.447] vector databases support efficient similarity matching
[Top 2 | score=0.316] embedding models turn text into vectors
```

## Engineering Notes

The important part is the data flow, not the tool name. If you can explain why a chunk was retrieved, what evidence reached the prompt, and whether the answer used that evidence, replacing the toy embedding with a production vector stack becomes a controlled engineering change.
