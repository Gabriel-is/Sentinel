# Sentinel Data Sources

This directory is for raw source documents. The parsed/structured versions live in `data/parsed/`.

## Ingested for v0.3.0

### 1. NIST AI RMF 1.0 (AI 100-1)
- **URL:** https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf
- **What we extracted:** 4 functions, 18 categories, 67 subcategories, 7 trustworthiness characteristics
- **Output:** `data/parsed/nist-ai-rmf-taxonomy.json`
- **Method:** Extracted from the NIST AI RMF Playbook web pages (airc.nist.gov)

### 2. CRI FS AI RMF Guidebook v1.0
- **URL:** https://cyberriskinstitute.org/wp-content/uploads/2026/02/CRI-FS-AI-RMF-Guidebook_Full_v.1.0-1.docx
- **What we extracted:** 230 control objectives mapped to NIST subcategories, with financial services context (SR 11-7, OCC, CFPB, fair lending, BSA/AML)
- **Output:** `data/parsed/fs-ai-rmf-controls.json`
- **Method:** Structured from guidebook content with domain expertise

### 3. NIST AI RMF Playbook
- **URL:** https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook
- **What we extracted:** Subcategory descriptions, suggested actions
- **Output:** Merged into `data/parsed/nist-ai-rmf-taxonomy.json`
- **Method:** Web scrape of individual function pages (Govern, Map, Measure, Manage)

### 4. Framework Crosswalks
- **Sources:** SR 11-7, ISO/IEC 42001, EU AI Act, OWASP LLM Top 10
- **What we built:** 109 crosswalk entries mapping NIST AI RMF subcategories to equivalent controls in 4 target frameworks
- **Output:** `data/parsed/crosswalks.json`
- **Method:** Manual mapping based on framework analysis

### 5. Glossary
- **Sources:** NIST AI RMF, FS AI RMF, ISO standards, regulatory guidance
- **What we built:** 82 terms across governance (20), risk (21), technical (33), regulatory (8)
- **Output:** `data/parsed/glossary.json`

## Planned for v1.0+

### NIST AI 600-1 (GenAI Profile)
- **URL:** https://airc.nist.gov/Docs/1
- **Extract:** GenAI-specific risks, actions mapped to AI RMF subcategories

### NIST Critical Infrastructure AI Profile
- **Status:** Concept note released April 2026
- **URL:** https://www.nist.gov/itl/ai-risk-management-framework

### OWASP Agentic AI Top 10
- **URL:** https://owasp.org/www-project-agentic-ai-threats/
- **Extract:** Agentic-specific risks to add to crosswalks

### OCC Published Documentation
- Annual reports, risk management policy, board charters
- Source: theocc.com

### KPMG FS AI RMF Analysis
- **URL:** https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2026/deconstructing-cyber-risk-institute.pdf
- Supplementary analysis of the 230 controls

## How to Update Data

1. Download new source documents to this directory
2. Update the parsed JSON files in `data/parsed/`
3. Regenerate seed SQL: `python3 scripts/generate_seed.py`
4. Apply to Supabase: use the Supabase MCP or `npx supabase db query --linked < supabase/migrations/002_seed_data.sql`
5. CLI users run `sentinel sync` to pull the updated data
