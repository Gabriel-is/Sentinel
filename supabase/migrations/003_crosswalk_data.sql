-- ============================================================
-- Sentinel Crosswalks: NIST AI RMF -> External Frameworks
-- Maps NIST AI RMF subcategories to SR 11-7, ISO 42001,
-- EU AI Act, and OWASP LLM Top 10
-- ============================================================

-- ============================================================
-- 1. SR 11-7 (Federal Model Risk Management Guidance)
-- ============================================================
-- SR 11-7 Sections used:
--   SR11-7.Gov    - Governance, Policies, and Procedures
--   SR11-7.RR     - Roles and Responsibilities
--   SR11-7.Dev    - Model Development
--   SR11-7.Val    - Model Validation
--   SR11-7.Use    - Model Use / Outcomes Analysis
--   SR11-7.Inv    - Model Inventory
--   SR11-7.Doc    - Documentation
--   SR11-7.Aud    - Audit and Internal Controls
--   SR11-7.Ven    - Vendor Model Management
--   SR11-7.Esc    - Escalation and Reporting
-- ============================================================

-- GOVERN -> SR 11-7
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.1', 'sr11_7', 'SR11-7.Gov', 'Governance, Policies, and Procedures', 'maps_to', 'Both require organizational policies governing model/AI risk; SR 11-7 mandates board-approved MRM policy');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.2', 'sr11_7', 'SR11-7.Gov', 'Governance, Policies, and Procedures', 'partially_maps', 'SR 11-7 addresses soundness and fitness-for-purpose; NIST broadens to full trustworthiness characteristics');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.3', 'sr11_7', 'SR11-7.Gov', 'Governance, Policies, and Procedures', 'maps_to', 'Both require risk tolerance thresholds that drive the depth of risk management activities');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.4', 'sr11_7', 'SR11-7.Doc', 'Documentation', 'maps_to', 'SR 11-7 documentation requirements for model risk decisions align with transparent risk management controls');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.5', 'sr11_7', 'SR11-7.Aud', 'Audit and Internal Controls', 'maps_to', 'SR 11-7 requires periodic model review and internal audit; NIST requires ongoing monitoring and periodic review');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.6', 'sr11_7', 'SR11-7.Inv', 'Model Inventory', 'maps_to', 'SR 11-7 requires a comprehensive model inventory; NIST requires mechanisms to inventory AI systems');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.7', 'sr11_7', 'SR11-7.Use', 'Model Use / Outcomes Analysis', 'partially_maps', 'SR 11-7 addresses model retirement; NIST extends to safe decommissioning without increasing risk');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 2.1', 'sr11_7', 'SR11-7.RR', 'Roles and Responsibilities', 'maps_to', 'Both require clearly defined roles, responsibilities, and reporting lines for model/AI risk management');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 2.2', 'sr11_7', 'SR11-7.RR', 'Roles and Responsibilities', 'maps_to', 'SR 11-7 requires qualified staff; NIST requires training to enable AI risk management duties');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 2.3', 'sr11_7', 'SR11-7.Esc', 'Escalation and Reporting', 'maps_to', 'SR 11-7 requires board/senior management oversight; NIST requires executive responsibility for AI risk decisions');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 4.3', 'sr11_7', 'SR11-7.Esc', 'Escalation and Reporting', 'partially_maps', 'Both require incident identification and information sharing; SR 11-7 focuses on model failures and escalation paths');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 6.1', 'sr11_7', 'SR11-7.Ven', 'Vendor Model Management', 'maps_to', 'SR 11-7 addresses vendor/third-party model risk; NIST addresses third-party AI risks including IP');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 6.2', 'sr11_7', 'SR11-7.Ven', 'Vendor Model Management', 'maps_to', 'Both require contingency plans for third-party model/data failures');

-- MEASURE -> SR 11-7
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 1.1', 'sr11_7', 'SR11-7.Val', 'Model Validation', 'maps_to', 'SR 11-7 validation requires metrics and benchmarks; NIST requires selected approaches and metrics for risk measurement');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 1.2', 'sr11_7', 'SR11-7.Val', 'Model Validation', 'maps_to', 'Both require regular reassessment of metrics and controls effectiveness');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 1.3', 'sr11_7', 'SR11-7.Val', 'Model Validation', 'maps_to', 'SR 11-7 requires independent validation; NIST requires independent assessors separate from developers');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.1', 'sr11_7', 'SR11-7.Doc', 'Documentation', 'maps_to', 'Both require documentation of testing methodologies, datasets, metrics, and tools');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.3', 'sr11_7', 'SR11-7.Val', 'Model Validation', 'maps_to', 'SR 11-7 requires performance testing representative of production; NIST requires performance measurement in deployment-like conditions');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.4', 'sr11_7', 'SR11-7.Use', 'Model Use / Outcomes Analysis', 'maps_to', 'SR 11-7 outcomes analysis requires ongoing monitoring; NIST requires production monitoring of functionality and behavior');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.5', 'sr11_7', 'SR11-7.Dev', 'Model Development', 'maps_to', 'SR 11-7 model development requires sound methodology and documented limitations; NIST requires validity, reliability, and documented limitations');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.9', 'sr11_7', 'SR11-7.Doc', 'Documentation', 'partially_maps', 'SR 11-7 requires model documentation including assumptions and limitations; NIST requires explainability and contextual interpretation');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 3.1', 'sr11_7', 'SR11-7.Use', 'Model Use / Outcomes Analysis', 'maps_to', 'Both require ongoing tracking of risks and performance in deployed/production contexts');

-- MAP / MANAGE -> SR 11-7
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 1.1', 'sr11_7', 'SR11-7.Dev', 'Model Development', 'partially_maps', 'SR 11-7 requires understanding intended use and context; NIST requires documenting intended purpose and prospective settings');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 4.1', 'sr11_7', 'SR11-7.Ven', 'Vendor Model Management', 'partially_maps', 'Both address risk mapping of third-party components; SR 11-7 focuses on vendor model due diligence');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 1.1', 'sr11_7', 'SR11-7.Use', 'Model Use / Outcomes Analysis', 'maps_to', 'SR 11-7 gates model use on validation results; NIST requires go/no-go determination based on intended purpose');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 2.4', 'sr11_7', 'SR11-7.Use', 'Model Use / Outcomes Analysis', 'maps_to', 'SR 11-7 allows for model decommission or restriction; NIST requires mechanisms to disengage or deactivate non-performing AI');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 3.1', 'sr11_7', 'SR11-7.Ven', 'Vendor Model Management', 'maps_to', 'Both require ongoing monitoring of third-party model/resource risks with documented controls');

-- ============================================================
-- 2. ISO 42001 (AI Management System)
-- ============================================================
-- ISO 42001 Clauses used:
--   ISO42001:4.1  - Understanding the organization and its context
--   ISO42001:4.2  - Understanding needs of interested parties
--   ISO42001:5.1  - Leadership and commitment
--   ISO42001:5.2  - AI policy
--   ISO42001:5.3  - Roles, responsibilities and authorities
--   ISO42001:6.1  - Actions to address risks and opportunities
--   ISO42001:6.2  - AI objectives and planning
--   ISO42001:7.1  - Resources
--   ISO42001:7.2  - Competence
--   ISO42001:7.3  - Awareness
--   ISO42001:7.5  - Documented information
--   ISO42001:8.1  - Operational planning and control
--   ISO42001:8.4  - AI system impact assessment
--   ISO42001:9.1  - Monitoring, measurement, analysis and evaluation
--   ISO42001:9.2  - Internal audit
--   ISO42001:9.3  - Management review
--   ISO42001:10.1 - Continual improvement
--   ISO42001:10.2 - Nonconformity and corrective action
--   ISO42001:A.2  - AI risk management (Annex A)
--   ISO42001:A.3  - Responsible AI (Annex A)
--   ISO42001:A.4  - AI system lifecycle (Annex A)
--   ISO42001:A.5  - Data for AI systems (Annex A)
--   ISO42001:A.8  - Transparency and explainability (Annex A)
--   ISO42001:A.9  - Accountability (Annex A)
--   ISO42001:A.10 - Third-party and supply chain (Annex A)
--   ISO42001:B.2  - AI risk objectives (Annex B)
-- ============================================================

-- GOVERN -> ISO 42001
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.1', 'iso42001', 'ISO42001:5.2', 'AI Policy', 'maps_to', 'Both require documented AI policies that address legal and regulatory requirements');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.2', 'iso42001', 'ISO42001:A.3', 'Responsible AI (Annex A)', 'maps_to', 'ISO responsible AI controls parallel NIST trustworthiness characteristics integrated into organizational processes');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.3', 'iso42001', 'ISO42001:6.1', 'Actions to Address Risks and Opportunities', 'maps_to', 'Both require risk-based determination of the depth and extent of management activities');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.4', 'iso42001', 'ISO42001:7.5', 'Documented Information', 'maps_to', 'Both require documented and transparent risk management processes and outcomes');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.5', 'iso42001', 'ISO42001:9.3', 'Management Review', 'maps_to', 'Both require periodic review of risk management processes with defined roles and frequencies');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.6', 'iso42001', 'ISO42001:8.1', 'Operational Planning and Control', 'partially_maps', 'ISO operational control includes system inventory as part of planning; NIST explicitly requires AI system inventory');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.7', 'iso42001', 'ISO42001:A.4', 'AI System Lifecycle (Annex A)', 'maps_to', 'ISO lifecycle controls include retirement/decommissioning; NIST requires safe decommissioning procedures');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 2.1', 'iso42001', 'ISO42001:5.3', 'Roles, Responsibilities and Authorities', 'maps_to', 'Both require clearly defined and documented roles and communication lines for AI risk management');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 2.2', 'iso42001', 'ISO42001:7.2', 'Competence', 'maps_to', 'Both require that personnel are trained and competent for their AI risk management responsibilities');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 2.3', 'iso42001', 'ISO42001:5.1', 'Leadership and Commitment', 'maps_to', 'ISO requires top management commitment; NIST requires executive leadership accountability for AI risk decisions');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 3.1', 'iso42001', 'ISO42001:7.1', 'Resources', 'partially_maps', 'ISO addresses resource allocation broadly; NIST specifically requires diverse teams for AI risk decision-making');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 4.1', 'iso42001', 'ISO42001:7.3', 'Awareness', 'maps_to', 'Both foster organizational awareness and culture around AI risk, safety-first mindset');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 4.2', 'iso42001', 'ISO42001:A.9', 'Accountability (Annex A)', 'maps_to', 'ISO accountability controls align with documenting and communicating AI risks and impacts');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 5.1', 'iso42001', 'ISO42001:4.2', 'Understanding Needs of Interested Parties', 'maps_to', 'Both require engagement with external stakeholders and consideration of their needs regarding AI impacts');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 6.1', 'iso42001', 'ISO42001:A.10', 'Third-party and Supply Chain (Annex A)', 'maps_to', 'Both address AI risks from third-party software, data, and supply chain including IP rights');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 6.2', 'iso42001', 'ISO42001:A.10', 'Third-party and Supply Chain (Annex A)', 'maps_to', 'Both require contingency and incident response processes for third-party AI/data failures');

-- MAP -> ISO 42001
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 1.1', 'iso42001', 'ISO42001:4.1', 'Understanding the Organization and Its Context', 'maps_to', 'Both require documenting the intended context, applicable laws, norms, and prospective deployment settings');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 1.5', 'iso42001', 'ISO42001:6.1', 'Actions to Address Risks and Opportunities', 'maps_to', 'Both require documented organizational risk tolerances that guide planning decisions');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 2.1', 'iso42001', 'ISO42001:8.1', 'Operational Planning and Control', 'partially_maps', 'ISO operational planning defines AI system scope; NIST requires defining specific tasks and methods the AI supports');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 3.1', 'iso42001', 'ISO42001:6.2', 'AI Objectives and Planning', 'maps_to', 'Both require documenting expected benefits and alignment with organizational objectives');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 3.5', 'iso42001', 'ISO42001:A.3', 'Responsible AI (Annex A)', 'partially_maps', 'ISO responsible AI covers human oversight; NIST requires defining and documenting human oversight processes');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 4.1', 'iso42001', 'ISO42001:8.4', 'AI System Impact Assessment', 'maps_to', 'Both require assessing and documenting risks of AI components including third-party elements');

-- MEASURE -> ISO 42001
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 1.1', 'iso42001', 'ISO42001:9.1', 'Monitoring, Measurement, Analysis and Evaluation', 'maps_to', 'Both require selecting and implementing metrics for AI risk measurement');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 1.3', 'iso42001', 'ISO42001:9.2', 'Internal Audit', 'maps_to', 'ISO requires internal audit by independent parties; NIST requires independent assessors separate from developers');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.8', 'iso42001', 'ISO42001:A.8', 'Transparency and Explainability (Annex A)', 'maps_to', 'Both require examining and documenting transparency and accountability risks');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.9', 'iso42001', 'ISO42001:A.8', 'Transparency and Explainability (Annex A)', 'maps_to', 'Both require model explainability, validation, and contextual interpretation of outputs');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.11', 'iso42001', 'ISO42001:A.3', 'Responsible AI (Annex A)', 'partially_maps', 'ISO responsible AI includes fairness; NIST specifically requires fairness and bias evaluation with documented results');

-- MANAGE -> ISO 42001
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 1.2', 'iso42001', 'ISO42001:A.2', 'AI Risk Management (Annex A)', 'maps_to', 'Both require risk prioritization based on impact, likelihood, and available resources');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 2.3', 'iso42001', 'ISO42001:10.2', 'Nonconformity and Corrective Action', 'maps_to', 'Both require procedures to respond to and recover from previously unknown risks or nonconformities');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 4.2', 'iso42001', 'ISO42001:10.1', 'Continual Improvement', 'maps_to', 'Both require measurable activities for continual improvement integrated into AI system updates');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 3.2', 'iso42001', 'ISO42001:A.5', 'Data for AI Systems (Annex A)', 'partially_maps', 'ISO data controls cover data quality for AI; NIST requires monitoring pre-trained models as part of maintenance');

-- ============================================================
-- 3. EU AI Act
-- ============================================================
-- EU AI Act Articles used:
--   EUAIA:Art.6   - Classification Rules for High-Risk AI
--   EUAIA:Art.9   - Risk Management System
--   EUAIA:Art.10  - Data and Data Governance
--   EUAIA:Art.11  - Technical Documentation
--   EUAIA:Art.12  - Record-keeping
--   EUAIA:Art.13  - Transparency and Provision of Information to Deployers
--   EUAIA:Art.14  - Human Oversight
--   EUAIA:Art.15  - Accuracy, Robustness and Cybersecurity
--   EUAIA:Art.17  - Quality Management System
--   EUAIA:Art.26  - Obligations of Deployers of High-Risk AI
--   EUAIA:Art.27  - Fundamental Rights Impact Assessment
--   EUAIA:Art.52  - Transparency Obligations for Certain AI Systems
--   EUAIA:Art.72  - Post-market Monitoring
--   EUAIA:Recital.47 - Risk Classification Criteria
-- ============================================================

-- GOVERN -> EU AI Act
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.1', 'eu_ai_act', 'EUAIA:Art.9', 'Risk Management System', 'maps_to', 'EU AI Act Art.9 requires a risk management system throughout the AI lifecycle, paralleling NIST governance requirements');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.2', 'eu_ai_act', 'EUAIA:Art.17', 'Quality Management System', 'maps_to', 'Art.17 requires a QMS incorporating risk management procedures; NIST integrates trustworthiness into organizational processes');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.4', 'eu_ai_act', 'EUAIA:Art.11', 'Technical Documentation', 'maps_to', 'Art.11 mandates technical documentation for high-risk AI; NIST requires transparent, documented risk management controls');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.5', 'eu_ai_act', 'EUAIA:Art.72', 'Post-market Monitoring', 'maps_to', 'Art.72 requires post-market monitoring systems; NIST requires ongoing monitoring and periodic review of risk management');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 1.6', 'eu_ai_act', 'EUAIA:Art.12', 'Record-keeping', 'partially_maps', 'Art.12 requires automatic logging capabilities; NIST requires AI system inventory mechanisms');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 2.1', 'eu_ai_act', 'EUAIA:Art.17', 'Quality Management System', 'partially_maps', 'Art.17 QMS includes accountability and role definitions; NIST requires documented roles and communication lines');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 3.2', 'eu_ai_act', 'EUAIA:Art.14', 'Human Oversight', 'maps_to', 'Art.14 requires effective human oversight of high-risk AI; NIST requires policies defining human-AI configuration and oversight roles');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 4.2', 'eu_ai_act', 'EUAIA:Art.13', 'Transparency and Provision of Information to Deployers', 'maps_to', 'Art.13 requires transparency about AI capabilities and limitations; NIST requires documenting and communicating AI risks');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 6.1', 'eu_ai_act', 'EUAIA:Art.9', 'Risk Management System', 'partially_maps', 'Art.9(8) addresses risks from interaction with other AI systems; NIST addresses third-party AI/data risks');

-- MAP -> EU AI Act
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 1.1', 'eu_ai_act', 'EUAIA:Art.6', 'Classification Rules for High-Risk AI', 'partially_maps', 'Art.6 requires understanding the AI system context for risk classification; NIST requires documenting intended purpose and context');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 1.1', 'eu_ai_act', 'EUAIA:Art.9', 'Risk Management System', 'maps_to', 'Art.9(2)(a) requires identifying foreseeable risks; NIST requires documenting intended purpose and prospective settings');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 2.2', 'eu_ai_act', 'EUAIA:Art.13', 'Transparency and Provision of Information to Deployers', 'maps_to', 'Art.13 requires documentation of capabilities and limitations; NIST requires documenting knowledge limits and human oversight');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 3.5', 'eu_ai_act', 'EUAIA:Art.14', 'Human Oversight', 'maps_to', 'Art.14 specifies human oversight measures; NIST requires defining and documenting human oversight processes');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 4.1', 'eu_ai_act', 'EUAIA:Art.27', 'Fundamental Rights Impact Assessment', 'partially_maps', 'Art.27 requires impact assessments for certain deployers; NIST requires risk mapping of all components including third parties');

-- MEASURE -> EU AI Act
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.1', 'eu_ai_act', 'EUAIA:Art.9', 'Risk Management System', 'maps_to', 'Art.9(5) requires testing with metrics; NIST requires documented test sets, metrics, and tools');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.3', 'eu_ai_act', 'EUAIA:Art.15', 'Accuracy, Robustness and Cybersecurity', 'maps_to', 'Art.15(1) requires appropriate accuracy levels; NIST requires performance criteria demonstrated in deployment-like conditions');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.5', 'eu_ai_act', 'EUAIA:Art.15', 'Accuracy, Robustness and Cybersecurity', 'maps_to', 'Art.15 requires accuracy and robustness; NIST requires validity, reliability, and documented generalizability limitations');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.6', 'eu_ai_act', 'EUAIA:Art.9', 'Risk Management System', 'maps_to', 'Art.9(4) requires risk reduction to acceptable levels; NIST requires safety evaluation with residual risk within tolerance');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.7', 'eu_ai_act', 'EUAIA:Art.15', 'Accuracy, Robustness and Cybersecurity', 'maps_to', 'Art.15(4)-(5) address cybersecurity and resilience; NIST requires security and resilience evaluation and documentation');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.8', 'eu_ai_act', 'EUAIA:Art.13', 'Transparency and Provision of Information to Deployers', 'maps_to', 'Art.13 mandates transparency; NIST requires examining and documenting transparency and accountability risks');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.10', 'eu_ai_act', 'EUAIA:Art.10', 'Data and Data Governance', 'partially_maps', 'Art.10 covers data governance and privacy considerations; NIST requires privacy risk examination and documentation');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.11', 'eu_ai_act', 'EUAIA:Art.10', 'Data and Data Governance', 'maps_to', 'Art.10(2)(f) requires bias examination in data; NIST requires fairness and bias evaluation with documented results');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 3.3', 'eu_ai_act', 'EUAIA:Art.26', 'Obligations of Deployers of High-Risk AI', 'partially_maps', 'Art.26 requires deployer monitoring and incident reporting; NIST requires feedback processes for end users and affected communities');

-- MANAGE -> EU AI Act
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 1.3', 'eu_ai_act', 'EUAIA:Art.9', 'Risk Management System', 'maps_to', 'Art.9(2) requires adopting risk management measures; NIST requires developing planned responses for high-priority risks');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 2.4', 'eu_ai_act', 'EUAIA:Art.14', 'Human Oversight', 'maps_to', 'Art.14(4)(e) allows human to override/stop AI; NIST requires mechanisms to disengage or deactivate non-performing AI');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 4.1', 'eu_ai_act', 'EUAIA:Art.72', 'Post-market Monitoring', 'maps_to', 'Art.72 mandates post-market monitoring; NIST requires post-deployment monitoring plans with user input mechanisms');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 4.3', 'eu_ai_act', 'EUAIA:Art.26', 'Obligations of Deployers of High-Risk AI', 'maps_to', 'Art.26(5) requires incident reporting to providers/authorities; NIST requires communicating incidents and errors to affected communities');

-- ============================================================
-- 4. OWASP LLM Top 10
-- ============================================================
-- OWASP LLM Items:
--   OWASP:LLM01 - Prompt Injection
--   OWASP:LLM02 - Insecure Output Handling
--   OWASP:LLM03 - Training Data Poisoning
--   OWASP:LLM04 - Model Denial of Service
--   OWASP:LLM05 - Supply Chain Vulnerabilities
--   OWASP:LLM06 - Sensitive Information Disclosure
--   OWASP:LLM07 - Insecure Plugin Design
--   OWASP:LLM08 - Excessive Agency
--   OWASP:LLM09 - Overreliance
--   OWASP:LLM10 - Model Theft
-- ============================================================

-- Security & Resilience (MEASURE 2.7) -> OWASP
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.7', 'owasp_llm', 'OWASP:LLM01', 'Prompt Injection', 'related', 'AI security evaluation should include testing for prompt injection attacks as a resilience concern');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.7', 'owasp_llm', 'OWASP:LLM02', 'Insecure Output Handling', 'related', 'Security evaluation should assess whether AI outputs are sanitized before downstream consumption');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.7', 'owasp_llm', 'OWASP:LLM04', 'Model Denial of Service', 'maps_to', 'AI system resilience evaluation directly addresses denial-of-service and resource exhaustion attacks');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.7', 'owasp_llm', 'OWASP:LLM10', 'Model Theft', 'related', 'Security evaluation encompasses protection against model extraction and theft attacks');

-- Privacy (MEASURE 2.10) -> OWASP
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.10', 'owasp_llm', 'OWASP:LLM06', 'Sensitive Information Disclosure', 'maps_to', 'Privacy risk examination should specifically address LLM memorization and leakage of sensitive training data');

-- Safety (MEASURE 2.6) -> OWASP
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.6', 'owasp_llm', 'OWASP:LLM08', 'Excessive Agency', 'maps_to', 'Safety evaluation must assess whether AI systems can take unauthorized actions beyond intended scope');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.6', 'owasp_llm', 'OWASP:LLM09', 'Overreliance', 'related', 'Safety evaluation should consider risks of users over-trusting AI outputs without verification');

-- Validity (MEASURE 2.5) -> OWASP
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.5', 'owasp_llm', 'OWASP:LLM03', 'Training Data Poisoning', 'related', 'Validity and reliability testing should include evaluation of training data integrity and poisoning risks');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.5', 'owasp_llm', 'OWASP:LLM09', 'Overreliance', 'partially_maps', 'Documenting limitations of generalizability helps users calibrate reliance on AI system outputs');

-- Third-party (GOVERN 6 / MAP 4 / MANAGE 3) -> OWASP Supply Chain
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 6.1', 'owasp_llm', 'OWASP:LLM05', 'Supply Chain Vulnerabilities', 'maps_to', 'Third-party AI policies must address supply chain risks including compromised models, data, and plugins');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 6.2', 'owasp_llm', 'OWASP:LLM05', 'Supply Chain Vulnerabilities', 'maps_to', 'Contingency processes for third-party failures are essential for managing supply chain vulnerabilities');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 4.2', 'owasp_llm', 'OWASP:LLM05', 'Supply Chain Vulnerabilities', 'maps_to', 'Identifying and documenting third-party risk controls directly mitigates supply chain vulnerability exposure');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 3.1', 'owasp_llm', 'OWASP:LLM05', 'Supply Chain Vulnerabilities', 'maps_to', 'Ongoing monitoring of third-party resources addresses supply chain risks from compromised dependencies');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 3.2', 'owasp_llm', 'OWASP:LLM05', 'Supply Chain Vulnerabilities', 'maps_to', 'Monitoring pre-trained models used in development directly addresses the LLM supply chain attack surface');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 3.2', 'owasp_llm', 'OWASP:LLM03', 'Training Data Poisoning', 'related', 'Monitoring pre-trained models helps detect training data poisoning in upstream dependencies');

-- Transparency (MEASURE 2.8 / 2.9) -> OWASP
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.9', 'owasp_llm', 'OWASP:LLM09', 'Overreliance', 'maps_to', 'Model explainability and contextual interpretation of outputs helps users avoid overreliance on AI');

-- Human Oversight (GOVERN 3.2 / MAP 3.5) -> OWASP
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'GOVERN 3.2', 'owasp_llm', 'OWASP:LLM08', 'Excessive Agency', 'maps_to', 'Human oversight policies and clear human-AI role definitions directly mitigate excessive agency risks');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 3.5', 'owasp_llm', 'OWASP:LLM08', 'Excessive Agency', 'maps_to', 'Defining human oversight processes constrains AI system autonomy, reducing excessive agency risk');

-- Plugin/Integration Security -> OWASP
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MAP 4.2', 'owasp_llm', 'OWASP:LLM07', 'Insecure Plugin Design', 'related', 'Internal risk controls for third-party components should address insecure plugin design patterns');

-- Incident response -> OWASP
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 2.3', 'owasp_llm', 'OWASP:LLM01', 'Prompt Injection', 'related', 'Incident response procedures should cover prompt injection discovery as a previously unknown risk vector');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 4.1', 'owasp_llm', 'OWASP:LLM02', 'Insecure Output Handling', 'related', 'Post-deployment monitoring should include detection of insecure output handling in production');

-- Deactivation (MANAGE 2.4) -> OWASP
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MANAGE 2.4', 'owasp_llm', 'OWASP:LLM08', 'Excessive Agency', 'maps_to', 'Mechanisms to disengage or deactivate AI are a direct control against excessive agency in production');

-- Testing (MEASURE 2.1) -> OWASP
INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.1', 'owasp_llm', 'OWASP:LLM01', 'Prompt Injection', 'partially_maps', 'TEVV documentation should include prompt injection test cases and red-teaming results for LLM systems');

INSERT INTO sentinel_crosswalks (source_framework, source_id, target_framework, target_id, target_name, relationship, notes)
VALUES ('nist_ai_rmf', 'MEASURE 2.1', 'owasp_llm', 'OWASP:LLM03', 'Training Data Poisoning', 'partially_maps', 'Testing documentation should cover training data validation and integrity verification procedures');
