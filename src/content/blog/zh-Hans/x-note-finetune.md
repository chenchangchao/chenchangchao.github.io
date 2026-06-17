---
title: "大模型微调经验"
description: "来自X博主cjzafir分享，不需要购买昂贵的算力资源"
pubDate: 2026-06-05
tags: ["大模型微调", "微调经验", "X博主"]
---

If you love fine-tuning open-source models (like me), then listen.

> Start with 1B, 2B, 4B, and 8B models. (Don't start with a 27B model or bigger at first.)

> Use WebGPU providers. I use Google Colab Pro for any model smaller than 9B. A single A100 80GB costs around $0.60/hr, which is cheap. Enough for small models.

> Don’t buy GPUs unless you fine-tune 7 to 10 models. You'll understand the nitty-gritty in the process.

> Use Codex 5.5 × DeepSeek v4 Pro to create datasets. Codex to plan, DeepSeek v4 Pro to generate rows.

> Use Unsloth's instruct models as a base from Hugging Face. Yes, there are others too, but Unsloth also provides fast fine-tuning notebooks.

> Use Unsloth's fine-tuning notebooks as a reference. Paste them into Codex, and Codex will write a custom notebook with the configs you need.

> Spend 1 day learning about:
- SFT (supervised fine-tuning)
- RL training (GRPO, DPO, PPO, etc.)
- LoRA / QLoRA training
- Quantization and types
- Local inference engines (llama.cpp)
- KV cache and prompt cache

> Just get started. Claude, Codex, and ChatGPT can design a step-by-step plan for how you can fine-tune your first AI model.

Future tech is moving toward small 5B to 15B ELMs (Expert Language Models) rather than general 1T LLMs.

So fine-tuning is an important skill that anyone can acquire today.

Tune models, test them, use them. Then fine-tune for companies and make a career out of it. (Companies pay $50k+ to fine-tune models on their data so they can get personalized AI models.)

Shoot your questions below. I'll be sharing in-depth raw findings about this topic in the coming days.