# OPS Research & Architecture Foundation

**Status:** version 1 research baseline, created 2026-10-10; accuracy hardening 2026-10-10 (see `tests/ops-logic-check.mjs`)  
**Implementation:** Redmark Forge Sandbox, browser-only  
**Knowledge corpus:** `ops-knowledge-base.json`  
**Application:** `ops-studio.html`

## Scope and research method

This project structures publicly accessible material about the Objective Personality System (OPS) for learning and exploratory modelling. The knowledge base paraphrases source material and records URLs, source categories, access dates, and unresolved questions. It does not reproduce paid course content, private client material, proprietary diagrams, or large copied passages.

Source classes are kept separate:
- **Primary:** statements published by the OPS creators.
- **Secondary:** community explanations and independent guides.
- **Independent claim:** a third party's description of an expanded model or empirical claim.
- **Community tool:** a reference implementation useful for understanding conventions, not an authority on validity.

## Versioning: do not silently merge models

### Classic 512-type description
The official FAQ describes nine binary coins and 512 possible combinations. The community Starter Kit gives a staged account of the classic model: human-need distinctions, letter distinctions, animal stacks and modalities. In this corpus, the nine independent binary coins are represented as **3 human-needs + 2 letter + 2 animal + 2 modality coins = 9** (`2^9 = 512`). Information/Energy dominance is retained as a useful **derived distinction**, not counted as an extra independent tenth coin. The Type Code guide documents a common notation such as `FF – Fe/Se – PC/S(B)`.

Sources:
- https://www.objectivepersonality.com/faq
- https://www.objectivepersonality.com/stories
- https://subjectivepersonality.wordpress.com/foundations/ops-starter-kit/
- https://subjectivepersonality.wordpress.com/2021/04/30/the-objective-personality-type-code/

### Expanded 2,048-configuration claim
The independent Mahakram research page describes 11 binary dimensions (nine cognitive plus two social), producing 2,048 configurations. It also states that there are zero peer-reviewed OPS papers. The current corpus treats this as a separate, secondary-source claim, not a verified official replacement for the classic model.

Source:
- https://www.mahakram.in/research

## Domain model

- **ModelVersion:** named version, dimensions, count, calculation, provenance and caveats.
- **Source:** title, publisher, URL, source class, access date and research notes.
- **Dimension:** contrast, values, model version, summary, provenance and confidence status.
- **Function:** one of Se, Si, Ne, Ni, Te, Ti, Fe, Fi, with component decomposition and source references.
- **Animal:** P/S/B/C, information/energy grouping and explanatory notes.
- **Rule:** explicit structural or research-method constraint, its scope, source references and testability.
- **Case:** a local case record, hypothesis list, evidence items, counterevidence and next questions.
- **Observation:** timestamp, context, behavioural description, source/provenance, support/contradict/neutral relation, and notes.
- **ResearchQuestion:** unresolved issue, priority, status and notes.

## Implemented application capabilities

- Searchable encyclopedia for dimensions, functions, animals, glossary entries and rules.
- Source library with primary/secondary distinctions and direct links.
- Version comparison between the classic 512 and expanded 2,048 claims.
- Type-code workbench with modality, function and animal-stack fields, structural checks and a clearly non-authoritative code preview.
- Visual concept map that groups concepts by domain and shows relationships.
- Browser-local case files with evidence, alternative hypotheses and counterevidence.
- JSON export/import and a downloadable copy of the knowledge corpus.
- Local persistence in browser storage; no account or backend required.

## Important implementation limitation

The type-code workbench is a **research aid, not a complete canonical OPS type enumerator**. It validates basic syntax and selected structural constraints; it does not claim to reconstruct every official checklist, all cross-checks, or all historical revisions. A complete exhaustive enumerator must be built only after the exact target-version rules are sourced and independently checked against a trusted reference implementation.

## Structural coverage report

The in-app **Coverage** tab tracks implementation state separately from research status. The current classic-community-code coverage includes:

- 8/8 cognitive-function records and both modality fields.
- 4/4 animal symbols.
- 16/16 animal stacks listed in the cited community guide.
- Checks that the first animal agrees with the Oe/Oi and De/Di orientations of the savior functions.
- Checks that the first two animals consist of one information animal (Blast/Consume) and one energy animal (Play/Sleep).
- Exhaustive structural enumeration: 32 ordered savior-function pairs × 4 compatible stacks per pair × 4 modality combinations = 512 code configurations.

The enumeration confirms that the implemented rules produce the expected count for this selected public type-code convention. The corpus now distinguishes the two animal-stack selection bits from the descriptive P/S and B/C contrasts, and treats Info/Energy dominance as a derived label. It does **not** demonstrate that OPS is empirically valid, and it is not a claim that all current official checklist revisions or paid material are represented. The 2,048 model remains separately marked as research-needed because the two added social dimensions are not yet operationalised here.

### Rule conflict found and resolved conservatively

The workbench originally also demanded that the second animal share the second savior function's orientation component. Enumerating the space showed this rule keeps only **256** of the 512 configurations and rejects the cited example `MF – Ni/Fi – SB/P(C)`, so it contradicts the 512 total that the same document relies on. It is now shown as an **advisory** note only. The enumerator and the workbench share one rule set (`structureChecks`), so they can no longer disagree. If a source defines the real stack-selection rule, promote or replace it deliberately.

Sources for these stack conventions:
- https://subjectivepersonality.wordpress.com/foundations/ops-starter-kit/info-vs-energy-dominant/
- https://subjectivepersonality.wordpress.com/2021/04/30/the-objective-personality-type-code/
- https://app.subjectivepersonality.com/analyzer


## Input-driven source analysis (first implementation)

The **Analyze Material** tab turns the workspace into an input-driven exploratory report tool. Users can paste text, attempt to fetch a public HTTP(S) URL when its server allows browser CORS access, or upload TXT, Markdown, CSV, JSON, HTML, PDF and DOCX. PDF and DOCX extraction loads third-party browser libraries from a CDN on demand; scanned PDFs without a text layer are not OCR'd by this feature.

The current report generator is deliberately transparent and browser-only:
- Applies a small, explicit phrase dictionary to the provided text.
- Detects negation within the same clause (a phrase preceded by not/never/n't/without/etc.), counts every match (excerpts are capped, counts are not), and ignores a phrase nested inside a longer matched phrase so one stretch of text is not scored for two signals.
- Shows relative signal counts for OPS function/orientation/animal concepts and selected matching excerpts.
- Flags possible opposing signal categories as prompts to review, not as actual contradictions.
- Includes source-length limitations, alternative-explanation questions and interpretation guardrails.
- Exports the resulting report as a standalone HTML file.

**This is an initial lexical screening tool, not an LLM, full NLP pipeline, personality test or automatic type classifier.** Counts measure matched phrases, not psychological traits, confidence probabilities or validity. A keyword may be quoted, negated, hypothetical or used in a context unrelated to the person's own behaviour; users must inspect each excerpt. URL fetching will often fail for sites that block cross-origin requests, and this implementation intentionally has no server proxy. If a URL cannot be fetched, paste text or upload an authorised copy.

No source text is sent to a backend by the analysis code. The optional PDF.js and Mammoth scripts are fetched from a CDN when those file types are selected. Avoid uploading sensitive/private material without permission, and do not use the output for high-stakes decisions.

## Provenance-tracked corpus, retrieval and held-out evaluation

The **Corpus & Evaluation** tab adds an in-browser baseline for working with an OPS-labelled corpus. It accepts CSV/JSON rows with text/transcript, OPS type label, grouping key, source metadata, license and annotation-method fields. It can normalize common OPAI/AOP column names, export a normalized corpus, and retain per-example provenance in retrieved evidence.

### Retrieval and scoring method

- Builds TF-IDF vectors over unigrams and bigrams and ranks examples by cosine similarity. This is a transparent lexical retrieval baseline, not neural semantic embeddings.
- Parses supported classic OPS type-code forms and aggregates similarity-weighted neighbour labels separately for modality, lead/second function, Observer/Decider, Di/De, Oi/Oe and each animal position.
- Displays the top label, vote share, top-two margin, competing labels, source metadata and explicit uncertainty flags. Vote shares are not calibrated probabilities.
- Keeps imported data in page memory; no corpus is automatically uploaded or persisted. Explicit JSON export is available.
- Includes clearly marked synthetic examples to test the UI only; synthetic rows are blocked from evaluation.

### Evaluation protocol and limitations

The evaluation workflow assigns complete grouping keys to one side of a deterministic held-out split, then reports per-dimension accuracy, macro-F1 and a training-majority baseline. Accuracy counts rows with no sufficiently similar training text as errors (answered-only accuracy is shown separately), test rows that are near-duplicates of training rows (cosine ≥ 0.9) are removed, rows with structurally invalid labels or no real person/group/source key are excluded, and the headline baseline is evaluated on the same rows. It requires dataset/source URL, license/reuse metadata, annotation-method metadata and an explicit operator confirmation that labels are independently assigned and the split avoids leakage. The confirmation is a safeguard, not machine verification. The grouping key should be the person when the same person appears in multiple interviews; if speaker IDs are video-specific, grouping only by speaker ID can leak a person across splits. Inspect duplicates and source identity before accepting results.

The public [AOP interview-lines dataset](https://huggingface.co/datasets/ThingsThatDoStuff/aop-dataset-2022-11-10-interview-lines-by-youtube) exposes OPS-labelled transcript segments and type-related fields, so it is a relevant corpus lead. However, its visible dataset card does not state a license. It is therefore **not confirmed as open-source/open-data for reuse**. The application links to it but does not bundle or redistribute its records; obtain permission or confirm applicable terms before importing or reusing it. The OPAI model repository at https://github.com/stanbar/objectivepersonality.ai documents transcript classifiers and benchmarks, but its code uses the PolyForm Perimeter License, which includes a noncompete clause; this project does not copy its implementation.

A held-out score measures agreement with supplied labels only. Crowd-sourced, inherited, disputed or self-selected OPS labels are not an independent gold standard. Until a licensed corpus with independently assigned labels and a documented inter-rater process is available, treat evaluation as a pipeline smoke test rather than validation of OPS or reliable personality inference. This tool remains a research prototype, not a validated psychological assessment.

## Evidence and validation policy

1. Every concept should have a source or be marked as a hypothesis.
2. Record when two sources disagree; never silently overwrite history.
3. Treat creators' statements about reliability as attributed claims until independently replicated.
4. Keep empirical claims separate from definitions and framework-internal rules.
5. Do not infer medical conditions, genetics, sexuality, political views or other sensitive traits from a type code.
6. Use only lawful public research material and respect source licences and membership boundaries.

## Next research questions

The JSON corpus includes a prioritised list of open questions. Highest priority: obtain the current official checklist/version, establish the source of the expanded social dimensions, document exact type-stack compatibility rules, and identify independent validation data or peer-reviewed studies.

## Public source catalogue

See the `sources` array in `ops-knowledge-base.json`. All URLs are source references, not endorsements. Source availability and contents can change.
