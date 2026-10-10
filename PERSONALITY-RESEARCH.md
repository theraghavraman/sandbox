# Personality Studios: Research, Provenance & Validation Plan

**Status:** exploratory implementation, version 1.1  
**Pages:** `big-five-studio.html`, `mbti-studio.html`, `disc-studio.html`  
**Shared engine:** `personality-core.js`  
**Structured sources:** `personality-knowledge-base.json`

## What changed

Each studio now includes a visible Research, Method & Provenance panel. It explains the model, links to relevant primary/academic/vendor sources, labels what each source can and cannot support, and distinguishes evidence about a model from evidence about this particular implementation. The shared engine's scoring is explicitly described as exploratory; exported results carry a non-validation notice.

## Big Five

The Five-Factor Model is conventionally measured using continuous trait scales. Published instruments include the 60-item BFI-2 and its 30-item short form, with peer-reviewed development/measurement research. The BFI-2 authors state that their instrument is copyrighted and available for non-commercial research use; this repository does not reproduce BFI-2 items. IPIP is a public-domain item pool, but the current questionnaire uses original prompts rather than claiming to be an IPIP scale.

Current limits: the short custom questionnaire is uneven in item coverage and reverse-keyed item balance; no norms, factor analysis, reliability, test-retest, criterion-validity, or held-out validation have been run. Its 0–100 values are arithmetic indices within this item set, **not percentiles** and not comparisons to a population. The UI must not imply the custom score inherits BFI-2/IPIP validity.

References:
- IPIP: https://ipip.ori.org/
- Soto & John (2017), BFI-2: https://doi.org/10.1037/pspp0000096
- Soto & John (2017), BFI-2-S / BFI-2-XS: https://doi.org/10.1016/j.jrp.2017.02.004

## MBTI

The commercial MBTI instrument and its scoring/practitioner process are distinct from this original forced-choice preference explorer. The interface links to official reliability/validity material and ethical guidance, including nonjudgmental descriptions and restrictions against employment screening. Official instrument evidence is not evidence for this custom item set.

Current limits: only a few items represent each preference pair; the four-letter threshold can conceal context and near-ties. A code is a tentative self-reflection hypothesis, not an official MBTI type, diagnosis, skill measure, or performance prediction. Near-even responses are flagged as low-confidence.

References:
- Official reliability/validity overview: https://www.myersbriggs.org/research-and-library/validity-reliability/home.htm
- Code of Ethics: https://www.myersbriggs.org/using-type-as-a-professional/mbti-code-of-ethics/home.htm

## DISC

The current tool is an original situational forced-choice exercise. It is not the commercial Everything DiSC instrument, and it does not implement its eight-scale model. The vendor's public science summary is linked as a vendor source, not independent validation of this page.

Current limits: forced-choice results are ipsative within this set because selecting one option excludes the others. Counts should not be interpreted as independent trait scores or norms. There is no reliability, validity, test-retest, or criterion study for these questions. Ties remain visible.

Reference:
- Everything DiSC vendor research summary: https://www.everythingdisc.com/the-science-behind-disc

## Shared interpretation and safety rules

- No scores are presented as calibrated probabilities or population percentiles.
- Do not use these tools for clinical diagnosis, recruitment, employee selection, or other high-stakes decisions.
- Avoid deterministic claims: behavior depends on context and can change over time.
- The research knowledge base stores source class, URL, supported claim and limits. The studio is not a scientific validation merely because it cites scientific sources.
- The current pages compute results in the browser. Answers are not uploaded or automatically persisted.
- The integrity test checks model coverage, source provenance fields, page-to-engine wiring, and uncertainty disclosures. It is not a psychometric validation.

## Validation roadmap before claiming accuracy

1. Review every item against a published construct definition and a balanced blueprint; remove ambiguous/double-barrelled wording.
2. For Big Five, either implement a suitable public-domain IPIP instrument verbatim with its proper attribution/scoring, or keep the custom items explicitly exploratory. Do not reproduce copyrighted BFI-2 items.
3. For MBTI and DISC, retain the custom/original wording and clearly separate model-inspired reflection from official instruments.
4. Collect consented, de-identified pilot responses; preregister scoring and exclusions; inspect missingness, response distributions and item-total patterns.
5. Assess dimensional structure and internal consistency on an appropriate sample; test retest stability and convergent/discriminant relationships; report confidence intervals and subgroup limitations.
6. Use a held-out sample and an independent analysis before making any performance claims. For categorical models, report confusion matrices and class balance; for trait scales, report reliability and calibration only where meaningful.
7. Do not call an instrument “validated” based on code tests, plausible-looking profiles, or source links alone.
