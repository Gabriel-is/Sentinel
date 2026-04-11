# Sentinel Data Sources

Download these files into this directory before running the ingest script.

## Required for v1

### 1. NIST AI RMF 1.0 (AI 100-1)
- **URL:** https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf
- **Save as:** `nist-ai-100-1.pdf`
- **Extract:** 4 functions, categories, subcategories, trustworthiness characteristics

### 2. CRI FS AI RMF Guidebook v1.0
- **URL:** https://cyberriskinstitute.org/wp-content/uploads/2026/02/CRI-FS-AI-RMF-Guidebook_Full_v.1.0-1.docx
- **Save as:** `cri-fs-ai-rmf-guidebook.docx`
- **Extract:** 230 control objectives, RCM, adoption stages

### 3. NIST AI RMF Playbook
- **URL:** https://airc.nist.gov/AI_RMF_Playbook
- **Note:** This is a web page, not a PDF. Scrape or manually extract suggested actions per subcategory.
- **Save as:** `nist-ai-rmf-playbook.json` (after extraction)

### 4. NIST AI 600-1 (GenAI Profile)
- **URL:** https://airc.nist.gov/Docs/1
- **Save as:** `nist-ai-600-1.pdf`
- **Extract:** GenAI-specific risks, actions mapped to AI RMF subcategories

## Future (v2+)

### 5. NIST Critical Infrastructure AI Profile
- **URL:** TBD (concept note released April 7, 2026)
- Check: https://www.nist.gov/itl/ai-risk-management-framework

### 6. OCC-Published Documentation
- Annual reports, risk management policy, board charters, transformation docs
- Gabe will pull these from theocc.com

### 7. OWASP
- LLM Top 10: https://owasp.org/www-project-top-10-for-large-language-model-applications/
- Agentic Top 10: https://owasp.org/www-project-agentic-ai-threats/

### 8. KPMG FS AI RMF Analysis
- **URL:** https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2026/deconstructing-cyber-risk-institute.pdf
- Good supplementary analysis of the 230 controls
