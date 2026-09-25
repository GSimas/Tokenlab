// Catálogo de preços de API por 1 milhão de tokens (USD).
// Coletado manualmente das páginas oficiais de cada provedor — ver PRICING_SOURCES.
// Atualize PRICING_UPDATED_AT sempre que revisar os valores.

import type { Locale } from "./i18n";

export const PRICING_UPDATED_AT = "2026-09-25";

export type PriceKind = "chat" | "embedding";

export type PriceEntry = {
  id: string;
  provider: string;
  name: string;
  /** USD por 1M tokens de entrada. */
  input: number;
  /** USD por 1M tokens de saída. `null` para modelos que não geram saída (embeddings). */
  output: number | null;
  kind: PriceKind;
  /** Ressalva exibida quando o modelo está selecionado. */
  note?: { pt: string; en: string };
};

const VARIES_BY_CONTEXT = {
  pt: "Preço válido para prompts abaixo de 200k tokens; acima disso o provedor cobra o dobro.",
  en: "Price applies below 200k-token prompts; above that the provider charges double.",
};

const OFF_PEAK = {
  pt: "Preço fora de pico (cache miss). Em horário de pico o provedor cobra o dobro.",
  en: "Off-peak price (cache miss). During peak hours the provider charges double.",
};

const PROMO = {
  pt: "Preço promocional por tempo limitado — confirme a vigência na página do provedor.",
  en: "Time-limited promotional price — check the provider page for the end date.",
};

const LEGACY = {
  pt: "Preço legado, disponível apenas para clientes existentes.",
  en: "Legacy pricing, available to existing customers only.",
};

const TIERED = {
  pt: "Preço da faixa de contexto mais curta; prompts maiores caem em faixas mais caras.",
  en: "Price for the shortest context tier; longer prompts fall into pricier tiers.",
};

const SONAR_SUNSET = {
  pt: "A API Sonar é suportada só até 27/09/2026; a Perplexity migra para a Agent API. Há ainda taxa por requisição de busca.",
  en: "The Sonar API is supported only until 2026-09-27; Perplexity is moving to the Agent API. A per-search request fee also applies.",
};

const LONG_CONTEXT_272K = {
  pt: "Preço válido até 272k tokens de entrada; acima disso a entrada custa 2× e a saída 1,5×.",
  en: "Price applies up to 272k input tokens; above that input costs 2× and output 1.5×.",
};

const RETIRED_ANTHROPIC = {
  pt: "Aposentado na API da Anthropic; segue disponível via Amazon Bedrock e Google Cloud.",
  en: "Retired on the Anthropic API; still available via Amazon Bedrock and Google Cloud.",
};

const PREVIEW = {
  pt: "Modelo em preview — preço e disponibilidade podem mudar.",
  en: "Preview model — price and availability may change.",
};

const BEDROCK_REGION = {
  pt: "Preço da região US East (N. Virginia), inferência padrão no Bedrock.",
  en: "US East (N. Virginia) price, standard on-demand inference on Bedrock.",
};

const VERTEX_ONLY = {
  pt: "Preço publicado apenas na Vertex AI. Em descontinuação — o Google recomenda o Gemini Embedding 2.",
  en: "Price published on Vertex AI only. Being deprecated — Google recommends Gemini Embedding 2.",
};

const SEARCH_FEE = {
  pt: "Há cobrança adicional por requisição de busca, não incluída nesta estimativa.",
  en: "There is an extra per-search request fee not included in this estimate.",
};

export const PRICING: PriceEntry[] = [
  // ---------------------------------------------------------------- OpenAI
  { id: "openai/gpt-6-astra", provider: "OpenAI", name: "gpt-6-astra", input: 10, output: 50, kind: "chat", note: LONG_CONTEXT_272K },
  { id: "openai/gpt-6-sol", provider: "OpenAI", name: "gpt-6-sol", input: 2, output: 10, kind: "chat", note: LONG_CONTEXT_272K },
  { id: "openai/gpt-6-luna", provider: "OpenAI", name: "gpt-6-luna", input: 0.1, output: 0.5, kind: "chat", note: LONG_CONTEXT_272K },
  { id: "openai/gpt-5.6-sol", provider: "OpenAI", name: "gpt-5.6-sol", input: 4, output: 20, kind: "chat", note: PROMO },
  { id: "openai/gpt-5.6-terra", provider: "OpenAI", name: "gpt-5.6-terra", input: 2, output: 12, kind: "chat" },
  { id: "openai/gpt-5.6-luna", provider: "OpenAI", name: "gpt-5.6-luna", input: 0.2, output: 1.2, kind: "chat" },
  { id: "openai/gpt-5.6-cyber", provider: "OpenAI", name: "gpt-5.6-cyber", input: 12.5, output: 75, kind: "chat" },
  { id: "openai/gpt-5.5", provider: "OpenAI", name: "gpt-5.5", input: 5, output: 30, kind: "chat", note: LONG_CONTEXT_272K },
  { id: "openai/gpt-5.5-pro", provider: "OpenAI", name: "gpt-5.5-pro", input: 30, output: 180, kind: "chat" },
  { id: "openai/gpt-5.5-cyber", provider: "OpenAI", name: "gpt-5.5-cyber", input: 12.5, output: 75, kind: "chat" },
  { id: "openai/gpt-5.4", provider: "OpenAI", name: "gpt-5.4", input: 2.5, output: 15, kind: "chat" },
  { id: "openai/gpt-5.4-mini", provider: "OpenAI", name: "gpt-5.4-mini", input: 0.75, output: 4.5, kind: "chat" },
  { id: "openai/gpt-5.4-nano", provider: "OpenAI", name: "gpt-5.4-nano", input: 0.2, output: 1.25, kind: "chat" },
  { id: "openai/gpt-5.4-pro", provider: "OpenAI", name: "gpt-5.4-pro", input: 30, output: 180, kind: "chat" },
  { id: "openai/gpt-5.3-codex", provider: "OpenAI", name: "gpt-5.3-codex", input: 1.75, output: 14, kind: "chat" },
  { id: "openai/gpt-5.2", provider: "OpenAI", name: "gpt-5.2", input: 1.75, output: 14, kind: "chat" },
  { id: "openai/gpt-5.2-pro", provider: "OpenAI", name: "gpt-5.2-pro", input: 21, output: 168, kind: "chat" },
  { id: "openai/gpt-5.1", provider: "OpenAI", name: "gpt-5.1", input: 1.25, output: 10, kind: "chat" },
  { id: "openai/gpt-5", provider: "OpenAI", name: "gpt-5", input: 1.25, output: 10, kind: "chat" },
  { id: "openai/gpt-5-mini", provider: "OpenAI", name: "gpt-5-mini", input: 0.25, output: 2, kind: "chat" },
  { id: "openai/gpt-5-nano", provider: "OpenAI", name: "gpt-5-nano", input: 0.05, output: 0.4, kind: "chat" },
  { id: "openai/gpt-5-pro", provider: "OpenAI", name: "gpt-5-pro", input: 15, output: 120, kind: "chat" },
  { id: "openai/gpt-4.1", provider: "OpenAI", name: "gpt-4.1", input: 2, output: 8, kind: "chat" },
  { id: "openai/gpt-4.1-mini", provider: "OpenAI", name: "gpt-4.1-mini", input: 0.4, output: 1.6, kind: "chat" },
  { id: "openai/gpt-4.1-nano", provider: "OpenAI", name: "gpt-4.1-nano", input: 0.1, output: 0.4, kind: "chat" },
  { id: "openai/gpt-4o", provider: "OpenAI", name: "gpt-4o", input: 2.5, output: 10, kind: "chat" },
  { id: "openai/gpt-4o-mini", provider: "OpenAI", name: "gpt-4o-mini", input: 0.15, output: 0.6, kind: "chat" },
  { id: "openai/o3", provider: "OpenAI", name: "o3", input: 2, output: 8, kind: "chat" },
  { id: "openai/o3-pro", provider: "OpenAI", name: "o3-pro", input: 20, output: 80, kind: "chat" },
  { id: "openai/o4-mini", provider: "OpenAI", name: "o4-mini", input: 1.1, output: 4.4, kind: "chat" },
  { id: "openai/o1", provider: "OpenAI", name: "o1", input: 15, output: 60, kind: "chat" },
  { id: "openai/gpt-3.5-turbo", provider: "OpenAI", name: "gpt-3.5-turbo", input: 0.5, output: 1.5, kind: "chat" },
  { id: "openai/text-embedding-3-small", provider: "OpenAI", name: "text-embedding-3-small", input: 0.02, output: null, kind: "embedding" },
  { id: "openai/text-embedding-3-large", provider: "OpenAI", name: "text-embedding-3-large", input: 0.13, output: null, kind: "embedding" },
  { id: "openai/text-embedding-ada-002", provider: "OpenAI", name: "text-embedding-ada-002", input: 0.1, output: null, kind: "embedding" },

  // ------------------------------------------------------------- Anthropic
  { id: "anthropic/claude-fable-5-1", provider: "Anthropic", name: "Claude Fable 5.1", input: 10, output: 50, kind: "chat" },
  { id: "anthropic/claude-fable-5", provider: "Anthropic", name: "Claude Fable 5", input: 10, output: 50, kind: "chat" },
  { id: "anthropic/claude-opus-5-5", provider: "Anthropic", name: "Claude Opus 5.5", input: 4, output: 20, kind: "chat" },
  { id: "anthropic/claude-opus-5", provider: "Anthropic", name: "Claude Opus 5", input: 5, output: 25, kind: "chat" },
  { id: "anthropic/claude-opus-4-8", provider: "Anthropic", name: "Claude Opus 4.8", input: 5, output: 25, kind: "chat" },
  { id: "anthropic/claude-opus-4-7", provider: "Anthropic", name: "Claude Opus 4.7", input: 5, output: 25, kind: "chat" },
  { id: "anthropic/claude-opus-4-6", provider: "Anthropic", name: "Claude Opus 4.6", input: 5, output: 25, kind: "chat" },
  { id: "anthropic/claude-opus-4-5", provider: "Anthropic", name: "Claude Opus 4.5", input: 5, output: 25, kind: "chat" },
  { id: "anthropic/claude-opus-4-1", provider: "Anthropic", name: "Claude Opus 4.1", input: 15, output: 75, kind: "chat", note: RETIRED_ANTHROPIC },
  { id: "anthropic/claude-sonnet-5", provider: "Anthropic", name: "Claude Sonnet 5", input: 2, output: 10, kind: "chat" },
  { id: "anthropic/claude-sonnet-4-6", provider: "Anthropic", name: "Claude Sonnet 4.6", input: 3, output: 15, kind: "chat" },
  { id: "anthropic/claude-sonnet-4-5", provider: "Anthropic", name: "Claude Sonnet 4.5", input: 3, output: 15, kind: "chat" },
  { id: "anthropic/claude-haiku-4-5", provider: "Anthropic", name: "Claude Haiku 4.5", input: 1, output: 5, kind: "chat" },
  { id: "anthropic/claude-haiku-3-5", provider: "Anthropic", name: "Claude Haiku 3.5", input: 0.8, output: 4, kind: "chat", note: RETIRED_ANTHROPIC },

  // ---------------------------------------------------------------- Google
  { id: "google/gemini-3.8-flash", provider: "Google", name: "Gemini 3.8 Flash", input: 0.75, output: 3.75, kind: "chat", note: PROMO },
  { id: "google/gemini-3.7-flash", provider: "Google", name: "Gemini 3.7 Flash", input: 0.75, output: 3.75, kind: "chat", note: PROMO },
  { id: "google/gemini-3.6-flash", provider: "Google", name: "Gemini 3.6 Flash", input: 0.75, output: 3.75, kind: "chat", note: PROMO },
  { id: "google/gemini-3.5-flash", provider: "Google", name: "Gemini 3.5 Flash", input: 1.5, output: 9, kind: "chat" },
  { id: "google/gemini-3.5-flash-lite", provider: "Google", name: "Gemini 3.5 Flash-Lite", input: 0.3, output: 2.5, kind: "chat" },
  { id: "google/gemini-3-flash-preview", provider: "Google", name: "Gemini 3 Flash Preview", input: 0.5, output: 3, kind: "chat", note: PREVIEW },
  { id: "google/gemini-3.1-pro", provider: "Google", name: "Gemini 3.1 Pro Preview", input: 2, output: 12, kind: "chat", note: VARIES_BY_CONTEXT },
  { id: "google/gemini-3.1-flash-lite", provider: "Google", name: "Gemini 3.1 Flash-Lite", input: 0.25, output: 1.5, kind: "chat" },
  { id: "google/gemini-omni-1.1-flash", provider: "Google", name: "Gemini Omni 1.1 Flash", input: 1.5, output: 9, kind: "chat" },
  { id: "google/gemini-2.5-pro", provider: "Google", name: "Gemini 2.5 Pro", input: 1.25, output: 10, kind: "chat", note: VARIES_BY_CONTEXT },
  { id: "google/gemini-2.5-flash", provider: "Google", name: "Gemini 2.5 Flash", input: 0.3, output: 2.5, kind: "chat" },
  { id: "google/gemini-2.5-flash-lite", provider: "Google", name: "Gemini 2.5 Flash-Lite", input: 0.1, output: 0.4, kind: "chat" },
  { id: "google/gemini-embedding-2", provider: "Google", name: "Gemini Embedding 2", input: 0.2, output: null, kind: "embedding" },
  { id: "google/gemini-embedding-001", provider: "Google", name: "Gemini Embedding", input: 0.15, output: null, kind: "embedding", note: VERTEX_ONLY },

  // ------------------------------------------------------------------- xAI
  { id: "xai/grok-4.7", provider: "xAI", name: "grok-4.7", input: 2, output: 6, kind: "chat", note: VARIES_BY_CONTEXT },
  { id: "xai/grok-4.6", provider: "xAI", name: "grok-4.6", input: 2, output: 6, kind: "chat", note: VARIES_BY_CONTEXT },
  { id: "xai/grok-4.5", provider: "xAI", name: "grok-4.5", input: 2, output: 6, kind: "chat", note: VARIES_BY_CONTEXT },
  { id: "xai/grok-4.3", provider: "xAI", name: "grok-4.3", input: 1.25, output: 2.5, kind: "chat", note: VARIES_BY_CONTEXT },
  { id: "xai/grok-4.20-reasoning", provider: "xAI", name: "grok-4.20 (reasoning)", input: 1.25, output: 2.5, kind: "chat", note: VARIES_BY_CONTEXT },
  { id: "xai/grok-4.20-non-reasoning", provider: "xAI", name: "grok-4.20 (non-reasoning)", input: 1.25, output: 2.5, kind: "chat", note: VARIES_BY_CONTEXT },
  { id: "xai/grok-4.20-multi-agent", provider: "xAI", name: "grok-4.20 (multi-agent)", input: 1.25, output: 2.5, kind: "chat", note: VARIES_BY_CONTEXT },
  { id: "xai/grok-build-0.1", provider: "xAI", name: "grok-build-0.1", input: 1, output: 2, kind: "chat", note: VARIES_BY_CONTEXT },

  // --------------------------------------------------------------- Mistral
  { id: "mistral/medium-3.5", provider: "Mistral", name: "Mistral Medium 3.5", input: 1.5, output: 7.5, kind: "chat" },
  { id: "mistral/large-3", provider: "Mistral", name: "Mistral Large 3", input: 0.5, output: 1.5, kind: "chat" },
  { id: "mistral/small-4", provider: "Mistral", name: "Mistral Small 4", input: 0.15, output: 0.6, kind: "chat" },
  { id: "mistral/ministral-3-14b", provider: "Mistral", name: "Ministral 3 (14B)", input: 0.2, output: 0.2, kind: "chat" },
  { id: "mistral/ministral-3-8b", provider: "Mistral", name: "Ministral 3 (8B)", input: 0.15, output: 0.15, kind: "chat" },
  { id: "mistral/ministral-3-3b", provider: "Mistral", name: "Ministral 3 (3B)", input: 0.1, output: 0.1, kind: "chat" },
  { id: "mistral/codestral", provider: "Mistral", name: "Codestral", input: 0.3, output: 0.9, kind: "chat" },
  { id: "mistral/voxtral-small-text", provider: "Mistral", name: "Voxtral Small (texto)", input: 0.1, output: 0.4, kind: "chat" },
  { id: "mistral/mistral-embed", provider: "Mistral", name: "Mistral Embed", input: 0.1, output: null, kind: "embedding" },
  { id: "mistral/codestral-embed", provider: "Mistral", name: "Codestral Embed", input: 0.15, output: null, kind: "embedding" },

  // -------------------------------------------------------------- DeepSeek
  { id: "deepseek/v4-pro", provider: "DeepSeek", name: "deepseek-v4-pro", input: 0.66, output: 1.98, kind: "chat", note: OFF_PEAK },
  { id: "deepseek/flash", provider: "DeepSeek", name: "deepseek-flash (V4.1)", input: 0.15, output: 0.6, kind: "chat", note: OFF_PEAK },

  // -------------------------------------------------------- Alibaba (Qwen)
  { id: "alibaba/qwen3.8-max", provider: "Alibaba", name: "Qwen3.8 Max", input: 2, output: 6, kind: "chat" },
  { id: "alibaba/qwen3.7-max", provider: "Alibaba", name: "Qwen3.7 Max", input: 2.5, output: 7.5, kind: "chat" },
  { id: "alibaba/qwen3.6-plus", provider: "Alibaba", name: "Qwen3.6 Plus", input: 0.5, output: 3, kind: "chat", note: TIERED },
  { id: "alibaba/qwen3.5-plus", provider: "Alibaba", name: "Qwen3.5 Plus", input: 0.4, output: 2.4, kind: "chat", note: TIERED },
  { id: "alibaba/qwen3.8-flash", provider: "Alibaba", name: "Qwen3.8 Flash", input: 0.15, output: 0.47, kind: "chat" },
  { id: "alibaba/qwen3.5-flash", provider: "Alibaba", name: "Qwen3.5 Flash", input: 0.1, output: 0.4, kind: "chat" },
  { id: "alibaba/qwen3-coder-plus", provider: "Alibaba", name: "Qwen3 Coder Plus", input: 1, output: 5, kind: "chat", note: TIERED },
  { id: "alibaba/text-embedding-v4", provider: "Alibaba", name: "text-embedding-v4", input: 0.07, output: null, kind: "embedding" },

  // -------------------------------------------------------- Moonshot (Kimi)
  { id: "moonshot/kimi-k3", provider: "Moonshot", name: "Kimi K3", input: 3, output: 15, kind: "chat" },
  { id: "moonshot/kimi-k2.7-code", provider: "Moonshot", name: "Kimi K2.7 Code", input: 0.95, output: 4, kind: "chat" },
  { id: "moonshot/kimi-k2.6", provider: "Moonshot", name: "Kimi K2.6", input: 0.95, output: 4, kind: "chat" },

  // ------------------------------------------------------------ Z.ai (GLM)
  { id: "zai/glm-5.3", provider: "Z.ai", name: "GLM-5.3", input: 1.4, output: 4.4, kind: "chat" },
  { id: "zai/glm-5.3-flashx", provider: "Z.ai", name: "GLM-5.3-FlashX", input: 0.37, output: 1.25, kind: "chat" },
  { id: "zai/glm-5.3-flash", provider: "Z.ai", name: "GLM-5.3-Flash", input: 0.15, output: 0.5, kind: "chat" },
  { id: "zai/glm-5.2", provider: "Z.ai", name: "GLM-5.2", input: 1.4, output: 4.4, kind: "chat" },
  { id: "zai/glm-5.1", provider: "Z.ai", name: "GLM-5.1", input: 1.4, output: 4.4, kind: "chat" },
  { id: "zai/glm-5", provider: "Z.ai", name: "GLM-5", input: 1, output: 3.2, kind: "chat" },
  { id: "zai/glm-4.7", provider: "Z.ai", name: "GLM-4.7", input: 0.6, output: 2.2, kind: "chat" },
  { id: "zai/glm-4.7-flashx", provider: "Z.ai", name: "GLM-4.7-FlashX", input: 0.07, output: 0.4, kind: "chat" },
  { id: "zai/glm-4.6", provider: "Z.ai", name: "GLM-4.6", input: 0.6, output: 2.2, kind: "chat" },
  { id: "zai/glm-4.5-x", provider: "Z.ai", name: "GLM-4.5-X", input: 2.2, output: 8.9, kind: "chat" },
  { id: "zai/glm-4.5", provider: "Z.ai", name: "GLM-4.5", input: 0.6, output: 2.2, kind: "chat" },
  { id: "zai/glm-4.5-air", provider: "Z.ai", name: "GLM-4.5-Air", input: 0.2, output: 1.1, kind: "chat" },

  // ---------------------------------------------------------------- Amazon
  { id: "amazon/nova-premier", provider: "Amazon", name: "Nova Premier", input: 2.5, output: 12.5, kind: "chat", note: BEDROCK_REGION },
  { id: "amazon/nova-2-pro", provider: "Amazon", name: "Nova 2 Pro (Preview)", input: 1.375, output: 11, kind: "chat", note: PREVIEW },
  { id: "amazon/nova-2-lite", provider: "Amazon", name: "Nova 2 Lite", input: 0.33, output: 2.75, kind: "chat", note: BEDROCK_REGION },
  { id: "amazon/nova-2-omni", provider: "Amazon", name: "Nova 2 Omni (Preview)", input: 0.3, output: 2.8, kind: "chat", note: PREVIEW },
  { id: "amazon/nova-pro", provider: "Amazon", name: "Nova Pro", input: 0.8, output: 3.2, kind: "chat" },
  { id: "amazon/nova-lite", provider: "Amazon", name: "Nova Lite", input: 0.06, output: 0.24, kind: "chat" },
  { id: "amazon/nova-micro", provider: "Amazon", name: "Nova Micro", input: 0.035, output: 0.14, kind: "chat" },
  { id: "amazon/titan-embed-text-v2", provider: "Amazon", name: "Titan Text Embeddings V2", input: 0.02, output: null, kind: "embedding", note: BEDROCK_REGION },
  { id: "amazon/nova-2-multimodal-embeddings", provider: "Amazon", name: "Nova Multimodal Embeddings", input: 0.135, output: null, kind: "embedding", note: BEDROCK_REGION },

  // -------------------------------------------------------------- Voyage AI
  { id: "voyage/voyage-4-large", provider: "Voyage AI", name: "voyage-4-large", input: 0.12, output: null, kind: "embedding" },
  { id: "voyage/voyage-4", provider: "Voyage AI", name: "voyage-4", input: 0.06, output: null, kind: "embedding" },
  { id: "voyage/voyage-4-lite", provider: "Voyage AI", name: "voyage-4-lite", input: 0.02, output: null, kind: "embedding" },
  { id: "voyage/voyage-code-4", provider: "Voyage AI", name: "voyage-code-4", input: 0.12, output: null, kind: "embedding" },
  { id: "voyage/voyage-context-4", provider: "Voyage AI", name: "voyage-context-4", input: 0.12, output: null, kind: "embedding" },
  { id: "voyage/voyage-finance-2", provider: "Voyage AI", name: "voyage-finance-2", input: 0.12, output: null, kind: "embedding" },
  { id: "voyage/voyage-law-2", provider: "Voyage AI", name: "voyage-law-2", input: 0.12, output: null, kind: "embedding" },

  // ---------------------------------------------------------------- Jina AI
  { id: "jina/jina-embeddings-v5-text-small", provider: "Jina AI", name: "jina-embeddings-v5-text-small", input: 0.05, output: null, kind: "embedding" },
  { id: "jina/jina-embeddings-v5-text-nano", provider: "Jina AI", name: "jina-embeddings-v5-text-nano", input: 0.02, output: null, kind: "embedding" },
  { id: "jina/jina-embeddings-v4", provider: "Jina AI", name: "jina-embeddings-v4", input: 0.05, output: null, kind: "embedding" },
  { id: "jina/jina-embeddings-v3", provider: "Jina AI", name: "jina-embeddings-v3", input: 0.05, output: null, kind: "embedding" },
  { id: "jina/jina-code-embeddings-1.5b", provider: "Jina AI", name: "jina-code-embeddings-1.5b", input: 0.05, output: null, kind: "embedding" },

  // -------------------------------------------------------------------- IBM
  { id: "ibm/granite-embedding-278m", provider: "IBM", name: "Granite Embedding 278M (multilingual)", input: 0.1, output: null, kind: "embedding" },

  // ----------------------------------------------------------------- Groq
  { id: "groq/gpt-oss-120b", provider: "Groq", name: "GPT-OSS 120B", input: 0.15, output: 0.6, kind: "chat" },
  { id: "groq/gpt-oss-20b", provider: "Groq", name: "GPT-OSS 20B", input: 0.075, output: 0.3, kind: "chat" },
  { id: "groq/qwen-3.8-27b", provider: "Groq", name: "Qwen 3.8-27B", input: 0.8, output: 4, kind: "chat", note: PREVIEW },

  // ---------------------------------------------------------------- Cohere
  { id: "cohere/command-r-current", provider: "Cohere", name: "Command R", input: 0.15, output: 0.6, kind: "chat" },
  { id: "cohere/command-r7b", provider: "Cohere", name: "Command R7B", input: 0.0375, output: 0.15, kind: "chat" },
  { id: "cohere/command", provider: "Cohere", name: "Command", input: 1, output: 2, kind: "chat", note: LEGACY },
  { id: "cohere/command-r-plus", provider: "Cohere", name: "Command R+ 08-2024", input: 2.5, output: 10, kind: "chat", note: LEGACY },
  { id: "cohere/command-r", provider: "Cohere", name: "Command R 03-2024", input: 0.5, output: 1.5, kind: "chat", note: LEGACY },
  { id: "cohere/command-light", provider: "Cohere", name: "Command-light", input: 0.3, output: 0.6, kind: "chat", note: LEGACY },
  { id: "cohere/aya-expanse", provider: "Cohere", name: "Aya Expanse (8B / 32B)", input: 0.5, output: 1.5, kind: "chat" },
  { id: "cohere/embed-v4", provider: "Cohere", name: "Embed 4 (embed-v4.0)", input: 0.12, output: null, kind: "embedding" },

  // ----------------------------------------------------------- Perplexity
  { id: "perplexity/sonar-pro", provider: "Perplexity", name: "Sonar Pro", input: 3, output: 15, kind: "chat", note: SONAR_SUNSET },
  { id: "perplexity/sonar-reasoning-pro", provider: "Perplexity", name: "Sonar Reasoning Pro", input: 2, output: 8, kind: "chat", note: SONAR_SUNSET },
  { id: "perplexity/sonar-deep-research", provider: "Perplexity", name: "Sonar Deep Research", input: 2, output: 8, kind: "chat", note: SONAR_SUNSET },
  { id: "perplexity/sonar", provider: "Perplexity", name: "Sonar", input: 1, output: 1, kind: "chat", note: SONAR_SUNSET },
  { id: "perplexity/agent-sonar", provider: "Perplexity", name: "Sonar (Agent API)", input: 0.25, output: 2.5, kind: "chat", note: SEARCH_FEE },
  { id: "perplexity/pplx-embed-v1-4b", provider: "Perplexity", name: "pplx-embed-v1-4b", input: 0.03, output: null, kind: "embedding" },
  { id: "perplexity/pplx-embed-v1-0.6b", provider: "Perplexity", name: "pplx-embed-v1-0.6b", input: 0.004, output: null, kind: "embedding" },
  { id: "perplexity/pplx-embed-context-v1-4b", provider: "Perplexity", name: "pplx-embed-context-v1-4b", input: 0.05, output: null, kind: "embedding" },
  { id: "perplexity/pplx-embed-context-v1-0.6b", provider: "Perplexity", name: "pplx-embed-context-v1-0.6b", input: 0.008, output: null, kind: "embedding" },

  // ------------------------------------------------------------------ Meta
  { id: "meta/muse-spark-1.3", provider: "Meta", name: "Muse Spark 1.3", input: 1.25, output: 4.25, kind: "chat" },
];

export const PRICING_SOURCES: { provider: string; url: string }[] = [
  { provider: "OpenAI", url: "https://developers.openai.com/api/docs/pricing" },
  { provider: "Anthropic", url: "https://platform.claude.com/docs/en/about-claude/pricing" },
  { provider: "Google", url: "https://ai.google.dev/gemini-api/docs/pricing" },
  { provider: "xAI", url: "https://docs.x.ai/docs/models" },
  { provider: "Mistral", url: "https://mistral.ai/pricing/api" },
  { provider: "DeepSeek", url: "https://api-docs.deepseek.com/quick_start/pricing" },
  { provider: "Moonshot", url: "https://platform.kimi.ai/docs/pricing/chat" },
  { provider: "Z.ai", url: "https://docs.z.ai/guides/overview/pricing" },
  { provider: "Amazon", url: "https://aws.amazon.com/bedrock/pricing/" },
  { provider: "Groq", url: "https://console.groq.com/docs/models" },
  { provider: "Cohere", url: "https://cohere.com/pricing" },
  { provider: "Voyage AI", url: "https://docs.voyageai.com/docs/pricing" },
  { provider: "Jina AI", url: "https://jina.ai/embeddings/" },
  { provider: "IBM", url: "https://www.ibm.com/products/watsonx-ai/pricing" },
  { provider: "Perplexity", url: "https://docs.perplexity.ai/getting-started/pricing" },
  { provider: "Alibaba", url: "https://www.alibabacloud.com/help/en/model-studio/model-pricing" },
  { provider: "Meta", url: "https://dev.meta.ai/docs/pricing-rate-limits" },
];

export const PROVIDERS = Array.from(new Set(PRICING.map((entry) => entry.provider)));

// Custos de token são frequentemente da ordem de centavos de centavo, então a
// precisão decimal cresce conforme o valor encolhe.
export function formatMoney(value: number, currency: "USD" | "BRL", locale: Locale) {
  const magnitude = Math.abs(value);
  const digits = magnitude === 0 ? 2 : magnitude < 0.01 ? 6 : magnitude < 1 ? 4 : 2;
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(value);
}

export function formatUnitPrice(value: number | null, locale: Locale) {
  if (value === null) return "—";
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 3,
  }).format(value);
}

/** Preço por 1M tokens na direção pedida, ou `null` quando o modelo não cobra por ela. */
export function unitPrice(entry: PriceEntry, direction: "input" | "output") {
  return direction === "input" ? entry.input : entry.output;
}

/** Custo em USD de `tokens` tokens na direção pedida. */
export function estimateCost(entry: PriceEntry, tokens: number, direction: "input" | "output") {
  const price = unitPrice(entry, direction);
  return price === null ? null : (tokens * price) / 1_000_000;
}
