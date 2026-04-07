# AssemblyAI Models — Authoritative Reference

> **Source:** assemblyai.com/docs, internal Slack support signal (customer success, support, GTM channels)
> **Last updated:** 2026-04-02
> **Purpose:** Canonical model reference for LLM-assisted support and content. Covers feature support, language support, API identifiers, benchmarks, and use-case recommendations derived from real customer patterns.

---

## Terminology: Do Not Use

| ❌ Do Not Use | ✅ Use Instead | Why |
|---|---|---|
| LeMUR | LLM Gateway | LeMUR was deprecated March 31, 2026; LLM Gateway is the current name |
| Audio Intelligence | Speech Understanding | Audio Intelligence is the deprecated category name; Speech Understanding is current |

---

## Key Facts (Read First)

- There are two major categories: **pre-recorded (async)** and **streaming (real-time)**. Different model families cover each.
- **Universal-3 Pro** is the recommended default for pre-recorded audio. **Universal-3 Pro Streaming** is the recommended default for real-time voice AI.
- **Model selection is the single highest-leverage decision** a customer makes. Wrong model = support tickets, silent failures, or loss in a competitive eval.
- The correct API parameter is `speech_models` (plural). `speech_model` (singular) is deprecated.
- Universal-3 Pro has a **6-language limit**. Customers outside EN/ES/DE/FR/IT/PT must use Universal-2 (async) or Whisper-Streaming (streaming).
- SLAM-1 is a deprecated model — customers on it for medical should migrate to Universal-3 Pro + Medical Mode.
- `prompt` and `keyterms_prompt` are **mutually exclusive on async (pre-recorded) Universal-3 Pro** — cannot be used in the same request. **On streaming (u3-rt-pro), both can be used together** — keyterms are automatically appended to your custom prompt.

---

## Deprecated / Legacy Model Identifiers

| Legacy value | Status | Replaced by |
|---|---|---|
| `best` | Deprecated | `universal-3-pro` |
| `nano` | Deprecated | `universal-2` |
| `slam-1` | Deprecated | `universal-3-pro` (+ Medical Mode for medical use cases) |
| `speech_model` (singular) | Deprecated parameter | `speech_models` (plural) |
| Old streaming WebSocket URL (`wss://api.assemblyai.com/v2/realtime/ws`) | **Inactive — do not use** | `wss://streaming.assemblyai.com/v3/ws` |

> **Streaming URL warning:** The old v2 streaming endpoint (`wss://api.assemblyai.com/v2/realtime/ws`) is no longer active. Connections to this URL will fail. Some customers have attempted to test against it and found it unresponsive — always use the current v3 endpoint: `wss://streaming.assemblyai.com/v3/ws`.

SLAM-1's documentation now redirects to Universal-3 Pro. Active customer migration underway (Craft Health Technologies, Sully AI, DaVita, and others).

---

## Pre-Recorded (Async) Models

### Universal-3 Pro

**API value:** `universal-3-pro`
**Price:** $0.21/hr
**Best for:** Highest-accuracy transcription, voice agent post-processing, meeting transcription, medical documentation, contact center QA

Universal-3 Pro is AssemblyAI's most accurate ASR model. It uses an LLM-based decoder and outperforms all market ASR models on entity accuracy (credit card numbers, phone numbers, email addresses, addresses, medication names, proper nouns, rare words). Hallucination rate is 30% lower than Whisper.

**Benchmarks:**

| Dataset | Universal-3 Pro WER | Universal-2 WER |
|---|---|---|
| CommonVoice | 4.87% | 6.48% |
| Earnings21 | 8.80% | 9.37% |
| LibriSpeech Clean | 1.52% | 1.68% |
| LibriSpeech Other | 2.69% | 3.00% |
| Meanwhile | 4.22% | 4.41% |
| TedLium | 6.77% | 7.30% |
| FLEURS multilingual avg | 4.58% | 7.42% |
| **English mean WER** | **5.6% (median 4.9%)** | **6.1% (median 6.5%)** |

*Methodology: 250+ hours, 80,000+ audio files, 26 datasets.*

**Supported languages:** English (US/UK/AU), Spanish (Castilian/MX/AR/CO/CL/Caribbean/Spanglish), French (Metropolitan/Canadian/Belgian), Portuguese (Brazilian/European), German, Italian. Regional dialects auto-recognized from base language code.

**Feature support:**

| Feature | Supported | Notes |
|---|---|---|
| General Prompting | ✅ | Up to 1,500 words of natural language instruction |
| Keyterms Prompting | ✅ | Up to 1,000 terms (max 6 words each); add-on +$0.05/hr |
| ⚠️ Prompt + Keyterms together (async) | ❌ | **Mutually exclusive on async** — cannot use both in one pre-recorded request |
| Temperature control | ✅ | 0.0–1.0 (default 0.0); low non-zero values yield ~5% relative improvement |
| Medical Mode | ✅ | +$0.15/hr; add `"domain": "medical-v1"`; EN, ES, DE, FR |
| Speaker Diarization (standard) | ✅ | +$0.02/hr |
| Speaker Diarization (experimental) | ✅ | +$0.065/hr — better for high speaker count or difficult audio |
| Speaker Identification | ✅ | |
| Entity Detection | ✅ | 50+ entity types |
| Sentiment Analysis | ✅ | |
| Topic Detection (IAB) | ✅ | |
| Key Phrases / Auto Highlights | ✅ | English only |
| Content Safety / Moderation | ✅ | |
| Translation | ✅ | 100+ target languages; pre-recorded only |
| Custom Formatting | ✅ | |
| PII Redaction (text) | ✅ | |
| PII Redaction (audio) | ✅ | |
| Profanity Filtering | ✅ | |
| Custom Spelling | ✅ | |
| Code Switching | ✅ | Across all 6 supported languages |
| Automatic Language Detection | ✅ | 130+ detectable languages; requires 15+ seconds of audio |
| Multichannel | ✅ | Billed per channel |
| Audio Event Tagging | ✅ | Over 100 different audio tags, including `[laughter]`, `[music]`, `[applause]`, `[beep]`, `[silence]`, and more |
| Disfluencies (`disfluencies` param) | ❌ | Use prompting instead (e.g., "tag filler words like um and uh") |
| `remove_audio_tags` | ✅ | Set to `"all"` to strip all `[...]` tags (audio event + speaker tags) from output post-inference. Opt-in, not enabled by default. |
| Auto Chapters | ❌ | **Causes silent 500 error on U3 Pro.** Use LLM Gateway instead. |
| Summarization | ❌ | **Same failure behavior as auto_chapters.** Use LLM Gateway instead. |
| Word Boost (`word_boost`) | ❌ | **Silently falls back to Universal-2** if set alongside U3 Pro. Use keyterms prompting instead. |

**Critical gotchas:**
- `auto_chapters` and `summarization` do not return helpful errors on U3 Pro — the job silently hangs and eventually returns a generic 500. This is a top support issue.
- `word_boost` with `speech_models: ["universal-3-pro"]` silently routes to Universal-2. Customers think they're on U3 Pro but are not. Use keyterms prompting instead.
- Using the word "speaker" in a prompt can inject inline speaker attribution labels (`[Speaker:NAME]`) into the transcript text. Use `speaker_labels: true` for diarization instead.
- Silent model routing: if a customer specifies U3 Pro but submits audio in an unsupported language, the API may silently fall back to Universal-2 without error. Use `speech_models: ["universal-3-pro", "universal-2"]` to make this routing explicit.

---

### Universal-2

**API value:** `universal-2`
**Price:** $0.15/hr
**Best for:** 99-language coverage, legacy integrations, features not yet available on U3 Pro (auto_chapters, summarization, disfluencies)

Universal-2 is the go-to model when U3 Pro's 6-language limit doesn't apply, or when the integration requires features not yet ported to U3 Pro. Described internally as "highly accurate, fastest performing model with support across 99 languages."

**Supported languages:** 99+ (full list at assemblyai.com/docs)

**Language accuracy tiers:**

| Tier | Approx. WER | Example languages |
|---|---|---|
| High (≤10%) | — | English, Spanish, French, German, Indonesian, Italian, Japanese, Dutch, Polish, Portuguese, Russian, Swedish, Turkish, Ukrainian, Catalan |
| Good (10–25%) | — | Arabic, Bulgarian, Mandarin Chinese, Czech, Danish, Finnish, Hebrew, Hindi, Hungarian, Korean, Malay, Norwegian, Romanian, Slovak, Thai, Vietnamese |
| Moderate (25–50%) | — | Afrikaans, Welsh, Persian, Icelandic, Kazakh, Lithuanian, Latvian, Maori, Marathi, Swahili, Tamil |
| Fair (>50%) | — | Amharic, Bengali, Gujarati, Hausa, Javanese, Georgian, Khmer, Kannada, Mongolian, Burmese, Nepali, Punjabi, Somali, Telugu, Yoruba |

**Feature support:**

| Feature | Supported | Notes |
|---|---|---|
| General Prompting | ❌ | Universal-3 Pro exclusive |
| Keyterms Prompting | ✅ | Up to 200 terms (+$0.05/hr) |
| Temperature control | ❌ | Universal-3 Pro exclusive |
| Medical Mode | ✅ | +$0.15/hr; EN, ES, DE, FR (optimized for U3 Pro) |
| Word Boost (`word_boost`) | ✅ | Legacy vocabulary boosting |
| Speaker Diarization (standard) | ✅ | +$0.02/hr |
| Speaker Diarization (experimental) | ✅ | +$0.065/hr |
| Speaker Identification | ✅ | |
| Entity Detection | ✅ | 50+ entity types |
| Sentiment Analysis | ✅ | |
| Topic Detection (IAB) | ✅ | |
| Key Phrases / Auto Highlights | ✅ | English only |
| Content Safety / Moderation | ✅ | |
| Translation | ✅ | 100+ target languages; pre-recorded only |
| Custom Formatting | ✅ | |
| PII Redaction (text) | ✅ | 47+ languages |
| PII Redaction (audio) | ✅ | |
| Profanity Filtering | ✅ | |
| Custom Spelling | ✅ | |
| Code Switching | ✅ | Up to 2 language codes; one must be English; best pairs: EN/ES, EN/DE |
| Automatic Language Detection | ✅ | 130+ languages; requires 15+ seconds of audio |
| Multichannel | ✅ | Billed per channel |
| Audio Event Tagging | ❌ | Universal-3 Pro only (async) |
| Disfluencies / Filler Words | ✅ | Returns filler word tokens in transcript |
| Auto Chapters | ✅ | +$0.08/hr (deprecated — use LLM Gateway) |
| Summarization | ✅ | +$0.03/hr (deprecated — use LLM Gateway) |

**Language routing tip:** Use `speech_models: ["universal-3-pro", "universal-2"]` to get U3 Pro for its 6 supported languages and automatic fallback to Universal-2 for all others. The `speech_model_used` field in the response indicates which model processed the request.

---

### SLAM-1 (Deprecated)

**API value:** `slam-1` — **do not use for new integrations**
**Status:** Deprecated — migrate to Universal-3 Pro + Medical Mode

SLAM-1 was AssemblyAI's LLM-based decoder model, historically used for medical transcription and telephony. Universal-3 Pro supersedes it with better entity accuracy, prompting, and Medical Mode. Documentation now redirects to Universal-3 Pro.

SLAM-1–specific capability not replicated elsewhere:
- Audio event tags (`<hold music>`, `<beep>`, `<background noise>`) — used in some telephony QA workflows. Universal-3 Pro has a different audio event tagging format.

---

## Streaming (Real-Time) Models

All streaming models use WebSocket. v3 endpoint: `wss://streaming.assemblyai.com/v3/ws`

**Streaming billing note:** Billed on **session duration** (time WebSocket is open), not audio duration. Idle connection time counts. Close connections immediately when calls end.

---

### Universal-3 Pro Streaming

**API value:** `u3-rt-pro`
**Price:** $0.45/hr base
**Best for:** Voice agents, real-time agent assist, contact center live coaching, any real-time application requiring highest accuracy on EN/ES/DE/FR/IT/PT

This is the flagship streaming model and the definitive recommendation for all voice AI / voice agent use cases. Per internal GTM directive: *"If you see any voice agent prospects evaluating us and using universal-streaming, we will lose. We need to make sure every voice agent customer is only evaluating us on universal-3-pro."* (Dylan Fox, Head of Sales)

**Supported languages:** English, Spanish, French, German, Italian, Portuguese — native code switching across all 6

**Latency:** P50 ~150ms post-VAD, P90 ~240ms post-VAD; P50 time-to-complete-transcript ~250ms

**Feature support:**

| Feature | Supported | Notes |
|---|---|---|
| Keyterms Prompting | ✅ | Included at no extra cost; up to 100 terms; updatable mid-stream |
| General Prompting | ✅ (beta) | +$0.05/hr |
| Medical Mode | ✅ | +$0.15/hr; EN, ES, DE, FR |
| Speaker Diarization | ✅ | +$0.12/hr |
| Entity Recognition | ✅ | Credit cards, phone numbers, emails, addresses, names |
| Audio Event Tagging | ✅ | Non-speech detection |
| Disfluency / verbatim control | ✅ | Via prompting |
| Mid-stream config updates | ✅ | UpdateConfiguration messages (prompt, keyterms, silence params) |
| End-of-turn detection | ✅ | Punctuation-based (replaces deprecated confidence threshold) |

**Turn detection parameters:**
- `min_turn_silence`: default 100ms (triggers end-of-turn punctuation check)
- `max_turn_silence`: default 1000ms (forces turn end regardless)
- `vad_threshold`: default 0.3

**Why it wins voice agent evals:**
- Best entity accuracy: credit card numbers, phone numbers, email addresses, physical addresses, proper nouns
- Short utterance handling ("yes," "no," "mmhmm") — the #1 pain point for voice agent customers
- Optimized word emission timing for low-latency turn detection
- Native code switching across 6 languages in a single stream
- Keyterms included for domain-specific vocabulary

**Known friction points:**
- `language_code` parameter is **silently ignored** — language is auto-handled; do not rely on it
- `end_of_turn_confidence_threshold` is **deprecated** — migrating from Universal-Streaming requires rewriting turn detection logic (punctuation-based, not confidence-based)
- Low `min_turn_silence` values can split entities (e.g., phone numbers interrupted mid-sequence)
- Hallucinations on very short (3–10s), low-entropy utterances — flagged by Decagon and HotelPlanner during alpha
- Latency is slightly higher than Universal-Streaming English at P75/P90/P95 — the trade-off for significantly better accuracy
- German–English code switching had reported issues during early access (Retell)
- Phone number formatting: spoken digits may be reformatted ("993-541-1436" instead of spoken-word form) — flagged by Concentrix

**Customer examples:** Decagon, Lorikeet, Bland AI, Phonely, Simple AI, Vapi, Synthflow, Grotto, Zowie, Retell, LiveKit integrations

---

### Universal-Streaming English

**API value:** `universal-streaming-english`
**Price:** $0.15/hr
**Best for:** English-only real-time applications where lowest latency is the priority; legacy integrations from before U3 Pro Streaming launched

**Supported languages:** English only

| Feature | Supported | Notes |
|---|---|---|
| Keyterms Prompting | ✅ | Up to 100 terms |
| General Prompting | ❌ | |
| Medical Mode | ✅ | English only |
| Speaker Diarization | ✅ | +$0.12/hr |

**Note:** This was the default streaming model for voice agents before Universal-3 Pro Streaming launched. New voice agent customers should be on U3 Pro Streaming. Customers on this model should be proactively migrated.

---

### Universal-Streaming Multilingual

**API value:** `universal-streaming-multilingual`
**Price:** $0.15/hr
**Best for:** Real-time multilingual applications covering the 6-language set where U3 Pro Streaming is not available or not needed; broader compatibility use cases

**Supported languages:** English, Spanish, German, French, Portuguese, Italian — code switching per turn (not intra-utterance like u3-rt-pro)

| Feature | Supported | Notes |
|---|---|---|
| Keyterms Prompting | ✅ | Up to 100 terms (added Dec 2025) |
| General Prompting | ❌ | |
| Medical Mode | ✅ | EN, ES, DE, FR |
| Speaker Diarization | ✅ | +$0.12/hr |
| Automatic Language Detection | ✅ | Returns `language_code` and `language_confidence` per utterance |
| Built-in formatting | ✅ | Punctuation + capitalization included by default |

**Customer examples:** Sierra (enterprise voice AI, deployed via self-hosted AWS VPC for EN/ES/FR/DE/IT/PT)

---

### Whisper-Streaming

**API value (v3):** `whisper-rt`  
**API value (v2/pricing):** `whisper-streaming`
**Price:** $0.30/hr
**Best for:** Real-time applications requiring languages outside the 6-language set; interim solution while AssemblyAI builds native streaming models for additional languages

**Supported languages:** 99+ (automatic language detection is mandatory — `language` parameter not supported)

| Feature | Supported | Notes |
|---|---|---|
| Keyterms Prompting | ❌ | Not available |
| General Prompting | ❌ | |
| Medical Mode | ❌ | |
| Speaker Diarization | ✅ | +$0.12/hr |
| Automatic Language Detection | ✅ | Built-in and mandatory; returns `language_code` and `language_confidence` |
| Audio Event Tagging | ✅ | `[Silence]`, `[Music]` |
| Formatted output | ⚠️ | **Unformatted by default** — must add `format_turns=true` for punctuation/capitalization |

**Note:** Positioned as the 99-language streaming fallback. Per Ryan Seams (internal): *"In evals where customers want language support that we are training the model for but we don't yet have our own native streaming model for that language — the API interface is complete and your team can start dev work today."* Example: customer asking about Polish streaming → directed to Whisper-Streaming as interim.

**Gotcha:** Default output has no punctuation or capitalization. For voice agent pipelines feeding LLMs, formatting is unnecessary overhead — but for human-readable output, always set `format_turns=true`.

---

## Full Compatibility Matrix

### Pre-Recorded (Async)

| Feature | Universal-3 Pro | Universal-2 | SLAM-1 (deprecated) |
|---|---|---|---|
| Languages | EN, ES, FR, DE, IT, PT (6) | 99+ | EN (primary) |
| Price | $0.21/hr | $0.15/hr | — |
| General Prompting | ✅ (1,500 words) | ❌ | ❌ |
| Keyterms Prompting | ✅ (1,000 terms) | ✅ (200 terms) | ❌ |
| Temperature control | ✅ | ❌ | ❌ |
| Medical Mode | ✅ (+$0.15/hr) | ✅ (+$0.15/hr) | ❌ |
| Word Boost | ❌ (silent fallback to U2) | ✅ | ✅ |
| Speaker Diarization (std) | ✅ (+$0.02/hr) | ✅ (+$0.02/hr) | ✅ |
| Speaker Diarization (exp) | ✅ (+$0.065/hr) | ✅ (+$0.065/hr) | — |
| Speaker Identification | ✅ | ✅ | ✅ |
| Entity Detection | ✅ (50+ types) | ✅ (50+ types) | ✅ |
| Sentiment Analysis | ✅ | ✅ | ✅ |
| Topic Detection (IAB) | ✅ | ✅ | ✅ |
| Key Phrases | ✅ (EN only) | ✅ (EN only) | ✅ |
| Content Moderation | ✅ | ✅ | ✅ |
| Translation | ✅ (100+ langs) | ✅ (100+ langs) | ✅ |
| Custom Formatting | ✅ | ✅ | ✅ |
| PII Redaction (text) | ✅ | ✅ (47+ langs) | ✅ |
| PII Redaction (audio) | ✅ | ✅ | ✅ |
| Profanity Filtering | ✅ | ✅ | ✅ |
| Custom Spelling | ✅ | ✅ | — |
| Code Switching | ✅ (6 langs) | ✅ (99 langs, 2 at a time, one must be EN) | — |
| Auto Language Detection | ✅ (130+) | ✅ (130+) | — |
| Multichannel | ✅ | ✅ | — |
| Audio Event Tagging | ✅ (100+ tags) | ❌ | ✅ (different format) |
| Disfluencies (`disfluencies` param) | ❌ (use prompting) | ✅ | ✅ |
| Auto Chapters | ❌ (500 error!) | ✅ (+$0.08/hr, deprecated) | — |
| Summarization | ❌ (500 error!) | ✅ (+$0.03/hr, deprecated) | — |

### Streaming

| Feature | U3 Pro Streaming | Universal-Streaming EN | Universal-Streaming ML | Whisper-Streaming |
|---|---|---|---|---|
| API value | `u3-rt-pro` | `universal-streaming-english` | `universal-streaming-multilingual` | `whisper-rt` / `whisper-streaming` |
| Languages | EN, ES, FR, DE, IT, PT | EN only | EN, ES, DE, FR, PT, IT | 99+ |
| Price | $0.45/hr | $0.15/hr | $0.15/hr | $0.30/hr |
| Keyterms | ✅ Included (100 terms) | ✅ (+$0.04/hr, 100 terms) | ✅ (100 terms) | ❌ |
| General Prompting | ✅ Beta (+$0.05/hr) | ❌ | ❌ | ❌ |
| Medical Mode | ✅ (+$0.15/hr) | ✅ (EN only) | ✅ (+$0.15/hr) | ❌ |
| Speaker Diarization | ✅ (+$0.12/hr) | ✅ (+$0.12/hr) | ✅ (+$0.12/hr) | ✅ (+$0.12/hr) |
| Auto Language Detection | ✅ (built-in) | ❌ | ✅ (built-in) | ✅ (mandatory) |
| Audio Event Tagging | ✅ (100+ tags) | ❌ | ❌ | ✅ ([Silence], [Music]) |
| Formatted output | ✅ | ✅ | ✅ (default) | ⚠️ Opt-in via `format_turns=true` |
| Mid-stream config updates | ✅ | ❌ | ❌ | ❌ |

---

## Speaker Diarization — Speaker Limits

Available on all pre-recorded models and U3 Pro Streaming. Speaker count limits vary by audio duration:

| Audio duration | Max speakers |
|---|---|
| 0–2 minutes | No limit |
| 2–10 minutes | 10 speakers |
| 10+ minutes | 30 speakers |

Override with `speaker_options` → `min_speakers_expected` and `max_speakers_expected`.

**Warning:** Setting `max_speakers_expected` too high reduces accuracy. US and EU regions only.

---

## Use-Case Recommendations

Derived from customer support conversations, AE/CSM Slack threads, and GTM guidance. This is what AssemblyAI customers actually use in production.

### Voice Agents / Real-Time AI Assistants

**Recommended: Universal-3 Pro Streaming (`u3-rt-pro`)**

The definitive choice for any voice agent, AI phone agent, or conversational AI product. Best entity accuracy, short utterance handling, and native code switching. Keyterms included.

- Language coverage: EN, ES, DE, FR, IT, PT
- Outside those 6 languages → Whisper-Streaming (interim)
- Customer examples: Decagon, Bland AI, Phonely, Vapi, Synthflow, Lorikeet

**Common mistake:** Customers default to Universal-Streaming because it's cheaper or was the prior default. Results in losing competitive evals against Deepgram.

---

### Contact Centers / Call Centers

**Real-time (agent assist, live coaching):** Universal-3 Pro Streaming
**Post-call QA / conversation intelligence:** Universal-3 Pro (async)
**99-language or legacy requirements:** Universal-2 (async)

Many contact center customers use a **hybrid approach**: streaming for live agent assist + async for post-call analysis with deeper features (diarization, entity detection, sentiment, PII). Medical/clinical contact centers should layer in Medical Mode.

- Customer examples: Concentrix, CloudCall, Global Telesourcing, Calabrio, AmplifAI
- Note: It is not obvious on the website that AssemblyAI handles low-quality 8kHz telephony audio well. Proactively address in contact center evals.

---

### Meeting Transcription / Conversation Intelligence (CI)

**Recommended: Universal-3 Pro (async)**

Default for all post-call and meeting recording use cases. Highest accuracy + diarization + prompting for custom output formatting.

- Use `speaker_labels: true` for speaker attribution — not prompt instructions
- Do NOT use `auto_chapters` or `summarization` — use LLM Gateway for those (these features still work on Universal-2 but are deprecated)
- Customer examples: Granola, TLDV, Descript, Fireflies, Dovetail, Metaview, Glyphic, Fyxer, Bluedot, Atlassian, RecallAI

---

### Medical / Healthcare / Ambient Listening

**Recommended: Universal-3 Pro (async) + Medical Mode (`"domain": "medical-v1"`)**

Medical Mode reduces Missed Entity Rate on drug names, conditions, procedures, and clinical terminology by ~20%. Available on Universal-3 Pro and Universal-2 (optimized for U3 Pro).

- **Enable:** add `"domain": "medical-v1"` to your existing API config — no model switch required
- **Language support:** EN, ES, DE, FR
- **U3 Pro + Medical Mode combined price:** $0.21 + $0.15 = **$0.36/hr**
- **Streaming:** Medical Mode also available on U3 Pro Streaming, Universal-Streaming EN, Universal-Streaming ML
- Migrating from SLAM-1? U3 Pro replaces it with better accuracy + prompting support
- Customer examples: DaVita, Sully AI, Heidi Health, Magentus Healthcare, Deepscribe, Knowtex, Chapter (Medicare), NMDP

---

### Multilingual / Global Applications

**Async:**
- Primary 6 languages (EN/ES/DE/FR/IT/PT): **Universal-3 Pro**
- All other languages: **Universal-2**
- Mixed: `speech_models: ["universal-3-pro", "universal-2"]` — routes to U3 Pro for its 6 languages, falls back to U2 for everything else

**Streaming:**
- Primary 6 languages, voice agents: **Universal-3 Pro Streaming**
- Primary 6 languages, broader compat: **Universal-Streaming Multilingual**
- 99+ languages: **Whisper-Streaming** (set `format_turns=true` if output needs to be human-readable)

**Known friction:** Customers are often confused that the new streaming model doesn't support 99 languages. Proactively address in onboarding.

---

### Podcasts / Media / Broadcast

**Recommended: Universal-3 Pro (async)**

High-quality studio audio with proper nouns, brand names, technical vocabulary — the profile that U3 Pro's entity accuracy is optimized for. Use keyterms prompting for show-specific vocabulary.

For non-English archives or 99-language requirements: **Universal-2**.

---

### Compliance / Regulated Industries (PII, Content Moderation)

All pre-recorded models support PII redaction (audio and text), content moderation, and profanity filtering. Choose model based on accuracy and language needs first, then layer guardrails.

- HIPAA BAA: available, sign in minutes without a sales call
- EU data residency: `api.eu.assemblyai.com` — same price as US; data stays in EU

---

## Model Selection Decision Tree

```
What kind of audio?
│
├── Real-time (streaming)
│   ├── Language in EN/ES/DE/FR/IT/PT?
│   │   └── YES → Universal-3 Pro Streaming (u3-rt-pro)   ← voice agents, agent assist
│   └── Language outside those 6?
│       └── YES → Whisper-Streaming (whisper-rt)           ← 99-language fallback
│
└── Pre-recorded (async)
    ├── Language in EN/ES/DE/FR/IT/PT?
    │   └── YES → Universal-3 Pro (default)
    │           ├── Need medical accuracy?          → + Medical Mode add-on
    │           ├── Need auto_chapters/summarization? → Use LLM Gateway
    │           └── Need filler word detection?     → Use prompting
    │
    └── Language outside those 6?
        └── YES → Universal-2
                └── Need auto_chapters or summarization? → Universal-2 (native, but deprecated)
```

---

## Common Mistakes & How to Fix Them

| Mistake | What Happens | Fix |
|---|---|---|
| `speech_model` (singular) | Deprecated param — may cause errors or be silently ignored | Use `speech_models` (plural) |
| `auto_chapters` + Universal-3 Pro | Job hangs → silent 500 error | Use Universal-2 or LLM Gateway |
| `summarization` + Universal-3 Pro | Same as above | Use Universal-2 or LLM Gateway |
| `word_boost` + Universal-3 Pro | Silent fallback to Universal-2 | Use keyterms prompting instead |
| `disfluencies` param + Universal-3 Pro | Feature not supported, silently ignored | Use prompting; or switch to Universal-2 |
| `prompt` + `keyterms_prompt` together (async) | One silently ignored or error | Mutually exclusive on async — use one or the other. On streaming (u3-rt-pro), both are supported together. |
| "speaker" in a U3 Pro prompt | Inline speaker labels injected into transcript text | Use `speaker_labels: true` for diarization |
| `language_code` set on u3-rt-pro streaming | Silently ignored — language is auto-handled | Remove the parameter; rely on auto-detection |
| Leaving WebSocket open (streaming) | Billed for full session duration including idle time | Close connection immediately when call ends |
| Voice agent on Universal-Streaming | Loses accuracy evals vs. Deepgram / competitors | Migrate to Universal-3 Pro Streaming |
| Whisper-Streaming without `format_turns=true` | No punctuation or capitalization in output | Add `format_turns=true` for human-readable output |
| `max_speakers_expected` set too high (diarization) | Reduces speaker attribution accuracy | Set to actual expected max, or omit |
| Language detection on <15 seconds of audio | Detection may fail or return low confidence | Ensure 15+ seconds of spoken audio before relying on detection |

---

## Frequently Asked Questions

**Which model should I use for a voice agent?**
Universal-3 Pro Streaming (`u3-rt-pro`). It is the only streaming model with the entity accuracy, short utterance handling, and turn detection quality needed to win voice agent evals.

**What streaming model handles 99 languages?**
Whisper-Streaming (`whisper-rt` on v3). Supports 99+ languages. No keyterms. Add `format_turns=true` for readable output. For the primary 6 languages, Universal-3 Pro Streaming is always preferred.

**Can I use auto_chapters with Universal-3 Pro?**
No. It silently causes stuck jobs and 500 errors. Use Universal-2 if you need auto_chapters natively (though it's deprecated), or use LLM Gateway to generate chapters from a U3 Pro transcript.

**Can I use prompt and keyterms_prompt together?**
**Pre-recorded (async):** No — they are mutually exclusive. Use one or the other in a single request.
**Streaming (u3-rt-pro):** Yes — both can be used together. The keyterms are automatically appended to your custom prompt.

**Can I mix models with automatic language detection (ALD)?**
Yes. Use `speech_models: ["universal-3-pro", "universal-2"]` with ALD. The API routes to U3 Pro for its 6 languages and falls back to U2 for all others. The `speech_model_used` field in the response tells you which model was used.

**How do I enable Medical Mode?**
Add `"domain": "medical-v1"` to your existing API config. No model switch required. Supported on Universal-3 Pro (async + streaming), Universal-2 (async), Universal-Streaming EN, and Universal-Streaming ML. Supports EN, ES, DE, FR.

**I was on SLAM-1 for medical. What should I migrate to?**
Universal-3 Pro + Medical Mode. U3 Pro delivers better entity accuracy than SLAM-1 on medical terminology, with the added benefit of prompting support.

**What is the difference between Universal-Streaming and Universal-3 Pro Streaming?**
Universal-Streaming was the prior-generation model. Universal-3 Pro Streaming delivers significantly higher entity accuracy, better short utterance handling, native prompting (beta), keyterms included, and superior turn detection. All new voice agent customers should use U3 Pro Streaming. Turn detection is also architecturally different (punctuation-based vs. confidence-based), so migration requires code changes.

**Why is the new streaming model limited to 6 languages when Universal-2 supports 99?**
Universal-3 Pro's architecture delivers state-of-the-art accuracy through deep per-language training. Broader language support is on the roadmap. Use Whisper-Streaming for languages outside the 6.

**Which model handles low-quality telephony / 8kHz audio?**
Universal-3 Pro (streaming or async) handles low-quality 8kHz telephony audio well, but this is not prominently documented. Mention proactively in contact center and phone agent evals. Note: as of early 2026, U3 Pro slightly underperforms Nova-3 on one CallHome telephony benchmark but outperforms on voice agent datasets.

**Does filler word / disfluency detection work on Universal-3 Pro?**
The `disfluencies` parameter is Universal-2 only. On Universal-3 Pro, use a prompt to handle filler words (e.g., "Remove filler words like um, uh, and ah" or "Tag all filler words in the transcript").

**What's the correct parameter name?**
`speech_models` (plural). Always set this explicitly — model defaults may differ between free-tier and paid accounts, and relying on defaults can cause surprises after upgrading.

**Is the EU region more expensive?**
No. EU processing (`api.eu.assemblyai.com`, `streaming.eu.assemblyai.com`) is the same price as US. Data stays within the EU for GDPR compliance.

**What happened to the `best` and `nano` model values?**
Both are deprecated. `best` → `universal-3-pro`. `nano` → `universal-2`. Update any legacy integrations using these identifiers.
