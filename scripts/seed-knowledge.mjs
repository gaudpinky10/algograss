/**
 * AlgoGrass AI — Knowledge Base Seeder
 * ─────────────────────────────────────
 * Seeds the `knowledge_base` MongoDB collection with up-to-date GDPR,
 * ICO enforcement, EU AI Act, EDPB opinions, and UK data protection content.
 *
 * Run from: F:\algograss-launch\db-setup\
 *   node ../algofinal/scripts/seed-knowledge.mjs
 *
 * Or with env var:
 *   MONGODB_URI="mongodb+srv://..." node seed-knowledge.mjs
 */

import { MongoClient } from 'mongodb'
import readline from 'readline'

const DB_NAME = 'algograss'
const COL     = 'knowledge_base'

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE ENTRIES
// Last updated: June 2026
// Sources: ICO, EDPB, EU AI Act official gazette, UK legislation.gov.uk
// ─────────────────────────────────────────────────────────────────────────────
const KNOWLEDGE_ENTRIES = [

  // ═══════════════════════════════════════════════════════════════
  // ICO ENFORCEMENT DECISIONS 2024–2026
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'ico-capita-fine-2025',
    title: 'ICO fines Capita £14 million for cybersecurity failure (2025)',
    category: 'ico-enforcement',
    source: 'ICO',
    publishedAt: new Date('2025-10-01'),
    tags: ['ICO', 'fine', 'cybersecurity', 'data breach', 'outsourcing', 'Capita', '2025'],
    content: `The ICO fined Capita plc and Capita Pension Solutions Limited a combined £14 million in October 2025 — the largest fine ever issued by the ICO. The outsourcing giant failed to respond quickly enough to a cyberattack that compromised the personal data of more than 6.6 million people. The fine was reduced from an initial £45 million after Capita demonstrated it had taken steps to improve its security. Key failures: inadequate incident response procedures, delay in notifying affected data subjects, failure to implement appropriate technical and organisational measures (TOMs) under Article 32 UK GDPR. This case demonstrates the ICO's willingness to issue very large fines for serious security failures affecting millions of individuals, even when the controller takes remedial action. Compliance lesson: organisations must have robust, tested incident response plans, clear breach notification procedures (72 hours to ICO under Article 33), and regularly audited security controls.`,
  },

  {
    slug: 'ico-advanced-computer-software-fine-2025',
    title: 'ICO fines Advanced Computer Software £3.07 million for NHS ransomware attack (2025)',
    category: 'ico-enforcement',
    source: 'ICO',
    publishedAt: new Date('2025-08-01'),
    tags: ['ICO', 'fine', 'ransomware', 'NHS', 'healthcare', 'Advanced Computer Software', '2025'],
    content: `The ICO fined Advanced Computer Software £3.07 million after a ransomware attack disrupted 82 NHS organisations in 2022. The investigation found that Advanced had failed to implement multi-factor authentication (MFA) across all its remote access systems, which allowed attackers to gain entry using stolen credentials. The attack affected NHS 111 and other critical health services, putting patient safety at risk. The ICO found breaches of Article 32 UK GDPR (security of processing) and Article 5(1)(f) (integrity and confidentiality). The fine was reduced from £6 million due to Advanced's cooperation and financial impact considerations. Key lesson: MFA is now considered a baseline security requirement for any organisation processing health or sensitive personal data. Healthcare and critical infrastructure sectors face heightened scrutiny. Organisations should conduct regular penetration testing, implement MFA everywhere, and have tested business continuity plans.`,
  },

  {
    slug: 'ico-reddit-fine-2026',
    title: 'ICO fines Reddit £14.47 million for children\'s data failures (February 2026)',
    category: 'ico-enforcement',
    source: 'ICO',
    publishedAt: new Date('2026-02-01'),
    tags: ['ICO', 'fine', 'children', 'age assurance', 'Reddit', 'Children\'s Code', '2026', 'social media'],
    content: `The ICO fined Reddit £14.47 million in February 2026 for failing to properly verify users' ages, which led to the unlawful processing of children's personal data. The ICO found that Reddit did not adequately implement age assurance measures required under the ICO's Children's Code (Age Appropriate Design Code). Children were able to access adult content without any meaningful age check, and their data was processed without the required higher protections the Children's Code demands. Imgur was also fined £247,590 in the same enforcement wave for similar failures. These fines signal that the ICO is now actively enforcing the Children's Code with substantial monetary penalties. All online services likely to be accessed by children under 18 must: implement robust age assurance, conduct a Children's Code DPIA, apply privacy by default settings, limit data collection to what is strictly necessary, not profile children for advertising, ensure parental consent mechanisms where appropriate (under 13s).`,
  },

  {
    slug: 'ico-2025-enforcement-overview',
    title: 'ICO 2025 enforcement overview: record £21.7 million in fines, focus shifts to security breaches',
    category: 'ico-enforcement',
    source: 'ICO / URM Consulting',
    publishedAt: new Date('2026-01-15'),
    tags: ['ICO', 'enforcement', '2025', 'fines', 'statistics', 'cybersecurity'],
    content: `The ICO issued 14 monetary penalties in 2025 with a combined value of £21.7 million — the highest annual total on record. However, the total number of enforcement actions was actually lower than previous years. The key shift: fines are bigger, targeting fewer but more serious cases, particularly major security incidents. Two-thirds of 2025 penalties addressed UK GDPR infringements (data security) rather than PECR marketing violations. The largest fines were: Capita group (£14m combined), Advanced Computer Software (£3.07m), plus additional penalties of £2.31m and £1.23m. ICO enforcement priorities for 2025-2026: (1) cybersecurity failures causing large-scale data breaches, (2) children's online privacy and age assurance failures, (3) adtech and cookie consent issues, (4) AI and automated decision-making compliance. The ICO also issued 5 fines in early 2026 exceeding £15 million combined, including the Reddit £14.47m fine.`,
  },

  {
    slug: 'ico-tiktok-children-investigation-2025',
    title: 'ICO opens investigation into TikTok\'s children\'s data recommender systems (March 2025)',
    category: 'ico-enforcement',
    source: 'ICO',
    publishedAt: new Date('2025-03-01'),
    tags: ['ICO', 'TikTok', 'children', 'recommender systems', 'profiling', 'investigation', '2025'],
    content: `In March 2025, the ICO opened a formal investigation into TikTok's processing of children's data in its recommender systems. The ICO is concerned about how social media and video-sharing platforms process children's data to generate personalised recommendations, particularly when this leads to harmful content being served to minors or increases the risk of platform addiction. The ICO also requested information from Meta in December 2025 about the processing of children's data on Instagram's recommender systems. In March 2026, the ICO issued an open letter to tech firms requiring them to strengthen age checks and better protect children's data. These investigations reflect a broad ICO strategy to hold major platforms accountable for children's privacy. UK businesses operating online services accessible to children must: assess whether their recommendation algorithms process children's data, conduct DPIAs specifically for recommender systems used by children, apply the Children's Code minimum standards (privacy by default, no profiling for advertising), and implement meaningful age assurance.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // UK DATA (USE AND ACCESS) ACT 2025
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'uk-data-use-access-act-2025-overview',
    title: 'UK Data (Use and Access) Act 2025 — key changes to UK GDPR and data protection law',
    category: 'uk-legislation',
    source: 'UK Parliament / legislation.gov.uk',
    publishedAt: new Date('2025-12-01'),
    tags: ['Data Use Access Act', 'DUAA', 'UK GDPR', '2025', 'UK law', 'legitimate interests', 'automated decisions'],
    content: `The Data (Use and Access) Act 2025 (DUAA) received Royal Assent in 2025. It is the most significant amendment to UK data protection law since the UK GDPR came into force. Key changes: (1) MANDATORY DATA PROTECTION COMPLAINTS PROCESS: From 19 June 2026, all organisations processing personal data must have a documented data protection complaints process in place — no exemption for small businesses. (2) RECOGNISED LEGITIMATE INTERESTS: The Act codifies examples of processing that may use legitimate interests without the full balancing test: direct marketing to existing customers, intra-group sharing for internal admin, and ensuring network and information security. (3) AUTOMATED DECISION-MAKING: New rules replace Article 22 UK GDPR. Conditions for non-special category data decisions are removed; conditions for special category data remain. (4) CHILDREN'S PRIVACY: The Act formally codifies the ICO's Children's Code requirements. (5) PECR FINES INCREASED: Maximum PECR fines rise to £17.5 million or 4% of global annual turnover. (6) NATIONAL DATA LIBRARY: Creation of a national data library to facilitate public sector data sharing. The DUAA does not replace the UK GDPR or DPA 2018 — it amends them. The ICO's fining guidance is under review to reflect the new law.`,
  },

  {
    slug: 'uk-duaa-complaints-process-june-2026',
    title: 'Data Protection complaints process mandatory from 19 June 2026 — DUAA requirement',
    category: 'uk-legislation',
    source: 'Data (Use and Access) Act 2025 / Employment Law Worldview',
    publishedAt: new Date('2026-01-10'),
    tags: ['DUAA', 'complaints process', '2026', 'mandatory', 'all organisations', '19 June 2026'],
    content: `Under the Data (Use and Access) Act 2025, from 19 June 2026 ALL organisations that process personal data must have a formal data protection complaints handling process. This is NOT limited to large companies or those with a DPO — it applies to every organisation regardless of size. Required elements: (1) Clear written policy explaining how to make a data protection complaint, (2) Named responsibility for handling complaints, (3) Documented timelines (typically within one month, same as DSAR timelines), (4) Records of complaints received and how they were resolved, (5) Evidence that complaints are handled properly and outcomes communicated to complainants. Action required: Review your privacy notice to include how to make a complaints — in addition to the right to complain to the ICO, you must now have your own internal process. Update your data protection documentation by 19 June 2026.`,
  },

  {
    slug: 'uk-duaa-pecr-fine-increase',
    title: 'PECR fines increase to £17.5 million under Data (Use and Access) Act 2025',
    category: 'uk-legislation',
    source: 'Data (Use and Access) Act 2025',
    publishedAt: new Date('2025-12-15'),
    tags: ['PECR', 'fines', 'DUAA', 'marketing', 'cookies', 'email', 'SMS', '2025'],
    content: `The Data (Use and Access) Act 2025 significantly increases the maximum fines available to the ICO for PECR (Privacy and Electronic Communications Regulations 2003) violations. PECR fines can now reach £17.5 million or 4% of global annual turnover, whichever is higher — up from the previous £500,000 cap. This brings PECR fines in line with UK GDPR fines. PECR covers: unsolicited marketing calls, texts, and emails; cookie consent requirements; requirements for direct marketing opt-outs. Common PECR violations: sending marketing emails without consent, using pre-ticked boxes, failing to provide working unsubscribe mechanisms, placing non-essential cookies without consent, conducting nuisance calls. The ICO's guidance on these areas is currently under review in light of the new fining powers. Organisations should audit their PECR compliance urgently — especially cookie banners, email marketing consent, and cold calling practices.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // EU AI ACT 2025–2026
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'eu-ai-act-timeline-2025-2026',
    title: 'EU AI Act implementation timeline: key dates and obligations 2025–2027',
    category: 'eu-ai-act',
    source: 'EU Official Journal / artificialintelligenceact.eu',
    publishedAt: new Date('2025-08-02'),
    tags: ['EU AI Act', 'timeline', 'GPAI', 'high-risk', 'obligations', '2025', '2026', '2027'],
    content: `The EU AI Act (Regulation 2024/1689) implementation timeline: AUGUST 2, 2024: Act entered into force. FEBRUARY 2, 2025: Prohibited AI systems chapter applied (Chapter II — bans on social scoring, real-time biometric surveillance in public spaces, subliminal manipulation, exploitation of vulnerabilities). AUGUST 2, 2025: GPAI (General-Purpose AI) model obligations commenced (Articles 51–55). Providers of models like GPT-4, Claude, Gemini must comply with: technical documentation, copyright transparency, systemic risk assessments for frontier models. New models placed on market from August 2025 must comply immediately; models already on market before that date have until August 2, 2027. AUGUST 2, 2026: High-risk AI obligations apply (Annex III systems — employment recruitment tools, creditworthiness assessments, access to education, critical infrastructure, law enforcement). Enforcement machinery becomes fully operational. Notified bodies begin conformity assessments. AUGUST 2, 2027: Final deadline for GPAI model providers whose models were on market before August 2025. PENALTIES: Up to €35 million or 7% of global turnover for prohibited practices; €15 million or 3% for high-risk violations; €7.5 million or 1.5% for GPAI violations.`,
  },

  {
    slug: 'eu-ai-act-gpai-obligations-august-2025',
    title: 'EU AI Act GPAI provider obligations — what is required from August 2025',
    category: 'eu-ai-act',
    source: 'EU AI Act Articles 51–55 / European Commission',
    publishedAt: new Date('2025-07-15'),
    tags: ['EU AI Act', 'GPAI', 'general purpose AI', 'compliance', 'obligations', '2025', 'transparency'],
    content: `From August 2, 2025, providers of General-Purpose AI (GPAI) models must comply with Articles 51–55 of the EU AI Act. ALL GPAI providers must: (1) Maintain technical documentation about the model including training data, architecture, capabilities and limitations, (2) Comply with EU copyright law and maintain a copyright compliance policy, (3) Publish a summary of training data content (publicly accessible), (4) Cooperate with the European AI Office. GPAI PROVIDERS WITH SYSTEMIC RISK (frontier models above 10^25 FLOPs training compute): Additional requirements include adversarial testing (red-teaming), incident reporting to the European AI Office, cybersecurity measures, energy efficiency reporting. The GPAI Code of Practice is a voluntary compliance tool that can demonstrate compliance. UK businesses using GPAI models in their products to serve EU users may need to assess whether they are deployers (less onerous) or providers (more onerous). UK AI is not directly subject to the EU AI Act but UK firms selling into the EU are.`,
  },

  {
    slug: 'eu-ai-act-high-risk-systems-august-2026',
    title: 'EU AI Act high-risk AI obligations — what must comply by August 2026',
    category: 'eu-ai-act',
    source: 'EU AI Act Annex III / European Commission',
    publishedAt: new Date('2026-01-01'),
    tags: ['EU AI Act', 'high-risk', 'Annex III', '2026', 'compliance', 'employment', 'credit', 'biometric'],
    content: `From August 2, 2026, AI systems classified as high-risk under Annex III of the EU AI Act must fully comply. HIGH-RISK AI SYSTEMS include: biometric identification and categorisation; critical infrastructure management; education and vocational training (AI that determines access to education, grading); employment and workers management (CV screening, task allocation, performance monitoring); essential private and public services (creditworthiness, insurance pricing); law enforcement (risk assessment, evidence evaluation); migration and border control; administration of justice. REQUIREMENTS FOR HIGH-RISK AI: Risk management system, data and data governance requirements, technical documentation, record-keeping and logging, transparency and user information, human oversight measures, accuracy, robustness and cybersecurity. CONFORMITY ASSESSMENT: High-risk systems must undergo conformity assessment before market placement, either through self-assessment or third-party notified body review. UK businesses using or deploying high-risk AI to serve EU customers must assess their obligations now — August 2026 is the deadline.`,
  },

  {
    slug: 'eu-ai-act-prohibited-practices-february-2025',
    title: 'EU AI Act — prohibited AI practices that were banned from February 2025',
    category: 'eu-ai-act',
    source: 'EU AI Act Chapter II / European Commission',
    publishedAt: new Date('2025-02-02'),
    tags: ['EU AI Act', 'prohibited', 'banned', 'social scoring', 'biometric', 'manipulation', '2025'],
    content: `From February 2, 2025, the following AI practices are completely prohibited in the EU under Chapter II of the EU AI Act: (1) SOCIAL SCORING: AI systems used by public authorities to evaluate or classify people based on social behaviour or personal characteristics, leading to detrimental treatment. (2) REAL-TIME BIOMETRIC SURVEILLANCE: Real-time remote biometric identification in publicly accessible spaces for law enforcement (very limited exceptions). (3) SUBLIMINAL MANIPULATION: AI using techniques beyond a person's consciousness to distort their behaviour in a harmful way. (4) EXPLOITING VULNERABILITIES: AI that exploits vulnerabilities of specific groups (age, disability, economic situation). (5) EMOTION RECOGNITION: In workplace and educational settings. (6) UNTARGETED FACIAL IMAGE SCRAPING: Scraping facial images from the internet or CCTV to build recognition databases. (7) PREDICTIVE POLICING: AI used to predict risk of criminal offences based on profiling or personality traits. Violations carry fines up to €35 million or 7% of global turnover.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // EDPB OPINIONS 2024–2026
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'edpb-ai-models-opinion-december-2024',
    title: 'EDPB Opinion 28/2024 on personal data in AI model development — key guidance',
    category: 'edpb-guidance',
    source: 'EDPB Opinion 28/2024',
    publishedAt: new Date('2024-12-17'),
    tags: ['EDPB', 'AI', 'training data', 'legitimate interest', 'anonymisation', '2024', 'opinion'],
    content: `The European Data Protection Board (EDPB) adopted Opinion 28/2024 in December 2024 on the use of personal data for developing and deploying AI models. Key findings: (1) LEGITIMATE INTEREST FOR AI TRAINING: The EDPB confirmed that legitimate interest (Article 6(1)(f) GDPR) can generally serve as a legal basis for developing and deploying AI models, but requires a three-step test: (a) identify a legitimate interest that is lawful, clear, and specific; (b) necessity assessment — is processing strictly necessary and are there less intrusive alternatives?; (c) balancing — do the data subjects' interests or fundamental rights override the controller's interest? (2) ANONYMISATION OF AI MODELS: For an AI model to be considered anonymous (not subject to GDPR), it must be very unlikely to directly or indirectly identify individuals whose data was used in training, and it must not be possible to extract personal data through queries. This is a high bar — most large language models are likely not fully anonymous. (3) UNLAWFULLY TRAINED MODELS: If a model was trained using unlawfully processed data, deploying the model may also be unlawful. The EDPB noted DPAs retain discretion on enforcement priorities.`,
  },

  {
    slug: 'edpb-joint-opinion-digital-omnibus-ai-2026',
    title: 'EDPB-EDPS Joint Opinion 1/2026 on Digital Omnibus AI — GDPR and AI Act interaction',
    category: 'edpb-guidance',
    source: 'EDPB-EDPS Joint Opinion 1/2026',
    publishedAt: new Date('2026-01-15'),
    tags: ['EDPB', 'EDPS', 'Digital Omnibus', 'AI Act', 'GDPR', 'joint opinion', '2026'],
    content: `The EDPB and EDPS adopted Joint Opinion 1/2026 at the start of 2026 on the European Commission's proposal for a Digital Omnibus on AI — a proposal to simplify implementation of the EU AI Act harmonised rules. The joint opinion addresses: how the EU AI Act and GDPR interact for AI systems that process personal data; the relationship between AI Act data governance requirements (Article 10) and GDPR data minimisation principles; accountability obligations for AI system providers and GDPR controller obligations; the role of Data Protection Authorities (DPAs) in AI enforcement alongside the European AI Office. Key message: GDPR and the EU AI Act are complementary frameworks — compliance with one does not automatically mean compliance with the other. Organisations developing or deploying AI systems that process personal data must comply with both simultaneously.`,
  },

  {
    slug: 'edpb-legitimate-interest-guidelines-2024',
    title: 'EDPB draft Guidelines on legitimate interest under Article 6(1)(f) GDPR',
    category: 'edpb-guidance',
    source: 'EDPB Guidelines',
    publishedAt: new Date('2024-11-01'),
    tags: ['EDPB', 'legitimate interest', 'Article 6', 'lawful basis', 'balancing test', 'guidelines'],
    content: `The EDPB issued draft guidelines on legitimate interests under Article 6(1)(f) GDPR, providing the most comprehensive guidance to date on this commonly used lawful basis. Key guidance: THREE-PART TEST: (1) Purpose test — the interest must be lawful, and clearly and specifically defined; (2) Necessity test — processing must be limited to what is strictly necessary; (3) Balancing test — interests of controller must not be overridden by data subject's interests or fundamental rights. EXAMPLES where legitimate interest is likely appropriate: fraud prevention, network security, direct marketing to existing customers (with opt-out), intra-group data sharing for admin, processing employee data for HR administration with appropriate safeguards. EXAMPLES where legitimate interest is unlikely to override: tracking individuals across websites without consent, profiling sensitive personal data, surveillance of employees beyond what is necessary, selling personal data to third parties for their own marketing. The balancing test must be documented. Under the UK Data (Use and Access) Act 2025, certain processing categories now have recognised legitimate interests codified in law for UK controllers.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // CHILDREN'S DATA AND AGE ASSURANCE
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'ico-childrens-code-enforcement-2025-2026',
    title: 'ICO Children\'s Code enforcement update 2025–2026: age assurance, social media, AI',
    category: 'childrens-data',
    source: "ICO Children's Code Strategy Update December 2025",
    publishedAt: new Date('2025-12-01'),
    tags: ['children', 'Children\'s Code', 'age assurance', 'ICO', 'social media', '2025', '2026'],
    content: `The ICO published its Children's Code Strategy Progress Update in December 2025. Key developments: (1) AGE ASSURANCE ENFORCEMENT: The ICO expects online services likely to be accessed by children under 18 to implement robust age assurance. Relying solely on self-declaration ("I am 18") is no longer sufficient for high-risk services. (2) RECOMMENDER SYSTEMS: The ICO is actively investigating how platforms use recommender algorithms to serve content to children, including TikTok (investigation opened March 2025) and Meta's Instagram (information requested December 2025). (3) OPEN LETTER TO TECH FIRMS (March 2026): The ICO wrote to tech firms requiring them to strengthen age checks. (4) AGE ASSURANCE AND COOKIES: Strictly necessary cookies used solely for age verification purposes may be permissible under the "strictly necessary" PECR exemption. (5) MANDATORY ICO CHILDREN'S CODE REQUIREMENTS: No tracking for advertising to children; privacy by default; do not use nudge techniques; consider the best interests of the child; data minimisation; no geolocation without genuine need; no profiling for algorithmic recommendations without high confidence user is adult.`,
  },

  {
    slug: 'age-assurance-requirements-uk-2026',
    title: 'Age assurance in 2026: what UK digital businesses need to do',
    category: 'childrens-data',
    source: 'ICO / Ofcom / Lewis Silkin',
    publishedAt: new Date('2026-04-17'),
    tags: ['age assurance', 'children', '2026', 'online safety', 'UK', 'Ofcom', 'ICO', 'DUAA'],
    content: `As of 2026, age assurance is required by multiple UK regulatory regimes simultaneously: (1) ICO CHILDREN'S CODE: Services likely accessed by under-18s must have appropriate age assurance. (2) ONLINE SAFETY ACT 2023 (Ofcom regulated): Adult content services must implement "robust" age verification using methods such as photo ID matching, bank card checks, or digital identity verification. (3) DATA (USE AND ACCESS) ACT 2025: Formally codifies Children's Code requirements in statute. The ICO and Ofcom issued joint statements in 2025 and plan a third joint statement in early 2026. ACCEPTABLE AGE ASSURANCE METHODS: Photo ID matching, credit card verification (as a proxy for age), mobile network operator age checks, digital identity wallets, government-issued digital credentials. PROFILING FOR AGE ASSURANCE: Using behavioural or device signals to estimate age is permissible as a supplement to (not replacement for) a robust age gate. PECR: Age-assurance cookies that are strictly necessary for the service are exempt from consent requirements. Action for businesses: map your user base, conduct a Children's Code DPIA if any users may be under 18, implement age assurance proportionate to the risk your service poses to children.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // UK CYBERSECURITY LEGISLATION
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'uk-cyber-security-resilience-bill-2025',
    title: 'UK Cyber Security and Resilience Bill 2025 — what it means for data protection',
    category: 'uk-legislation',
    source: 'UK Government / Mayer Brown',
    publishedAt: new Date('2025-11-12'),
    tags: ['cyber security', 'NIS2', 'resilience', 'UK bill', '2025', 'incident reporting'],
    content: `The UK Cyber Security and Resilience Bill was introduced to Parliament on 12 November 2025. It replaces the Network and Information Systems (NIS) Regulations 2018 and aligns the UK with EU NIS2 while reflecting post-Brexit policy priorities. Key differences from EU NIS2: (1) The UK bill is not a direct copy of NIS2 — it takes a similar approach but with British characteristics. (2) SCOPE: Broader than original NIS Regulations, covering more sectors and supply chains. The Bill gives ministers power to expand scope by secondary legislation. (3) INCIDENT REPORTING: Significant cyber incidents must be reported to DSIT (Department for Science, Innovation and Technology) within 24 hours (early warning), with a detailed report within 72 hours. (4) SUPPLY CHAIN: Increased obligations on organisations to assess and manage cyber risks in their supply chains. (5) ROYAL ASSENT: Expected during 2026, with full operational effect not anticipated until approximately 2028. Note: EU NIS2 (EU member states only) has been in force since October 2024, with member states required to transpose it by that date. UK organisations with EU operations may need to comply with both regimes.`,
  },

  {
    slug: 'nis2-eu-requirements-2024',
    title: 'EU NIS2 Directive — requirements and breach notification obligations (in force October 2024)',
    category: 'cybersecurity',
    source: 'NIS2 Directive (EU) 2022/2555',
    publishedAt: new Date('2024-10-17'),
    tags: ['NIS2', 'EU', 'cybersecurity', 'incident reporting', 'essential entities', 'important entities', '2024'],
    content: `The EU NIS2 Directive (Directive (EU) 2022/2555) came into force in EU member states on October 17, 2024. KEY REQUIREMENTS: INCIDENT REPORTING TIMELINES: (1) 24-hour early warning notification for significant incidents; (2) 72-hour full incident report with details of breach and mitigation; (3) One-month final report on recovery and long-term improvements. SECURITY MEASURES: Risk management policies covering supply chain security, access controls, MFA, encryption, business continuity, and security testing. SECTORS COVERED: 18 critical sectors in two tiers — "essential entities" (energy, transport, banking, health, water, digital infrastructure, ICT service management, public administration) and "important entities" (postal services, waste management, chemicals, food, general digital providers). APPLIES TO: Medium and large enterprises (50+ employees or €10m+ turnover). PENALTIES: Essential entities — up to €10 million or 2% of global revenue. Important entities — up to €7 million or 1.4% of global revenue. UK entities with EU operations must comply with NIS2 for their EU-based activities.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // CORE UK GDPR AND BREACH NOTIFICATION
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'uk-gdpr-breach-notification-rules',
    title: 'UK GDPR data breach notification — 72-hour rule and obligations explained',
    category: 'uk-gdpr',
    source: 'UK GDPR Articles 33-34 / ICO guidance',
    publishedAt: new Date('2024-01-01'),
    tags: ['data breach', '72 hours', 'Article 33', 'Article 34', 'notification', 'ICO', 'breach'],
    content: `Under UK GDPR Articles 33 and 34, data controllers must notify the ICO of a personal data breach within 72 hours of becoming aware of it, if the breach is likely to result in a risk to the rights and freedoms of individuals. WHEN MUST YOU NOTIFY THE ICO (Article 33): If the breach is likely to result in risk — this includes: unauthorised disclosure of personal data, loss of personal data, accidental damage to personal data. You must notify even if you do not have full information at the time — notify what you know and update the ICO. NOT required if the breach is unlikely to result in risk (e.g., accidental email to wrong recipient within the same organisation where data is retrieved immediately). WHEN MUST YOU NOTIFY INDIVIDUALS (Article 34): If the breach is likely to result in a HIGH risk to individuals — e.g., financial data breach, sensitive health data disclosed, credentials compromised. HOW TO NOTIFY THE ICO: Via the ICO's online self-reporting tool. Information required: nature of breach, categories and approximate number of individuals affected, name of DPO or contact, description of consequences, measures taken. PROCESSOR OBLIGATIONS: Processors must notify the controller "without undue delay" of any breach — controllers then decide whether to notify ICO. All organisations must maintain a record of all data breaches (Article 33(5)) even if they do not need to notify.`,
  },

  {
    slug: 'uk-gdpr-dsar-obligations',
    title: 'UK GDPR Data Subject Access Requests (DSARs) — complete guide to obligations',
    category: 'uk-gdpr',
    source: 'UK GDPR Article 15 / ICO guidance',
    publishedAt: new Date('2024-06-01'),
    tags: ['DSAR', 'Subject Access Request', 'SAR', 'Article 15', 'one month', 'rights', 'ICO'],
    content: `Under UK GDPR Article 15, data subjects have the right to access their personal data. KEY OBLIGATIONS: TIMESCALE: Respond within one calendar month of receiving the request. Can extend by a further two months for complex or numerous requests — but must inform the requester of the extension within the first month. WHAT TO PROVIDE: Confirmation of whether you process data about them; a copy of the data; information about the purposes of processing, categories of data, recipients, retention periods, rights (to rectify, erase, restrict, object), right to complain to ICO, information about automated decision-making, and for data not collected from the subject — the source. NO FEE: Free in most cases. Can charge a reasonable fee for manifestly unfounded or excessive requests, or refuse to comply. REDACTING THIRD PARTY DATA: You may need to redact personal data about third parties. EXEMPTIONS: Legal professional privilege, crime prevention, employment references, exam scripts. PROCESS TIPS: Acknowledge receipt immediately; search all systems (email, CRM, HR, paper records); use a DSAR register; get DPO sign-off on complex responses. The ICO actively investigates DSAR complaints and issues reprimands and fines for failures to respond within the one-month timeframe.`,
  },

  {
    slug: 'uk-gdpr-lawful-basis-guide',
    title: 'UK GDPR lawful basis for processing — choosing the right legal basis (Article 6)',
    category: 'uk-gdpr',
    source: 'UK GDPR Article 6 / ICO guidance',
    publishedAt: new Date('2024-03-01'),
    tags: ['lawful basis', 'Article 6', 'consent', 'legitimate interest', 'contract', 'legal obligation', 'vital interests'],
    content: `Under UK GDPR Article 6, you must have a lawful basis for every processing activity. The six lawful bases are: (1) CONSENT (Article 6(1)(a)): Freely given, specific, informed, unambiguous indication of agreement. Must be able to withdraw easily. Not appropriate where there is a power imbalance (employer-employee). (2) CONTRACT (Article 6(1)(b)): Processing necessary for a contract with the data subject, or to take steps at their request before entering into one. Cannot be used for processing that is merely convenient. (3) LEGAL OBLIGATION (Article 6(1)(c)): Processing required by law (e.g., HMRC tax records, PAYE, health and safety records). (4) VITAL INTERESTS (Article 6(1)(d)): Processing necessary to protect someone's life. Last resort basis — only use when consent cannot be obtained. (5) PUBLIC TASK (Article 6(1)(e)): For public authorities or tasks in the public interest. (6) LEGITIMATE INTERESTS (Article 6(1)(f)): Three-part test required. Most flexible basis for commercial organisations but requires documented balancing test. Not available to public authorities for public task processing. KEY: You must choose your lawful basis before you start processing, document it in your privacy notice, and stick to it. Switching basis later is not permitted under UK GDPR.`,
  },

  {
    slug: 'uk-gdpr-dpo-requirements',
    title: 'When must you appoint a Data Protection Officer (DPO) under UK GDPR?',
    category: 'uk-gdpr',
    source: 'UK GDPR Articles 37-39 / ICO guidance',
    publishedAt: new Date('2024-01-01'),
    tags: ['DPO', 'Data Protection Officer', 'Article 37', 'mandatory', 'appointment', 'ICO', 'requirements'],
    content: `Under UK GDPR Articles 37-39, a Data Protection Officer (DPO) is mandatory in three situations: (1) PUBLIC AUTHORITIES: All public authorities and bodies must appoint a DPO (except courts acting in judicial capacity). (2) LARGE-SCALE REGULAR SYSTEMATIC MONITORING: Organisations whose core activities require large-scale, regular, and systematic monitoring of individuals (e.g., a surveillance company, a large advertising platform tracking users across the web). (3) LARGE-SCALE SPECIAL CATEGORY DATA: Organisations whose core activities involve large-scale processing of special category data (health, biometric, criminal records, etc.) or data relating to criminal convictions. VOLUNTARY DPO: Any organisation can voluntarily appoint a DPO. WHAT COUNTS AS "LARGE-SCALE"? The ICO does not define specific thresholds, but factors include: number of individuals, geographic extent, volume of data, duration of processing, sensitivity of the data. A GP surgery processing patient health data probably doesn't need a DPO. A private hospital or health insurer does. KEY RULES FOR DPOs: Must have expert knowledge of data protection law; must be independent; must report to the highest management level; cannot be dismissed or penalised for performing their tasks; contact details must be published and registered with ICO; must be resourced to fulfil their tasks.`,
  },

  {
    slug: 'uk-gdpr-pecr-cookie-consent',
    title: 'PECR cookie consent requirements — what needs consent and what is exempt',
    category: 'pecr-cookies',
    source: 'PECR 2003 / ICO cookie guidance',
    publishedAt: new Date('2024-06-01'),
    tags: ['cookies', 'PECR', 'consent', 'analytics', 'marketing', 'strictly necessary', 'ICO'],
    content: `The Privacy and Electronic Communications Regulations 2003 (PECR) require consent for cookies and similar technologies unless they are "strictly necessary" for a service requested by the user. STRICTLY NECESSARY (NO CONSENT REQUIRED): Session cookies for shopping carts; authentication/login cookies; cookies remembering user's cookie preferences; security cookies (CSRF tokens, fraud prevention); load balancing cookies; cookies for age assurance (where strictly necessary). REQUIRES CONSENT: Analytics and tracking cookies (including Google Analytics); social media tracking pixels; advertising and remarketing cookies; personalisation cookies; A/B testing cookies; third-party embedding tracking. CONSENT REQUIREMENTS: Must be freely given, specific, informed, and unambiguous; pre-ticked boxes are not valid consent; consent must be as easy to withdraw as to give; users must be able to use the service even if they decline non-essential cookies. COOKIE BANNERS: Must offer genuine Reject All option equally prominent as Accept All; cannot use dark patterns or misleading designs to push users toward acceptance. ICO ENFORCEMENT: The ICO has been actively auditing cookie banners since 2023, issuing reprimands and preparing for fines. Under the DUAA 2025, PECR fines now reach £17.5m. Google Analytics: requires consent as it transfers data to Google in the US, involving both PECR (cookie consent) and UK GDPR (international transfer) considerations.`,
  },

  {
    slug: 'uk-gdpr-international-transfers',
    title: 'UK GDPR international data transfers after Brexit — IDTA, SCCs, and adequacy decisions',
    category: 'uk-gdpr',
    source: 'UK GDPR Articles 44-49 / ICO guidance',
    publishedAt: new Date('2024-09-01'),
    tags: ['international transfers', 'IDTA', 'SCCs', 'adequacy', 'USA', 'Brexit', 'Article 44', 'Article 46'],
    content: `After Brexit, the UK has its own international data transfer regime separate from the EU. TRANSFER TO ADEQUATE COUNTRIES (UK GDPR Article 45): The UK Secretary of State has issued adequacy regulations for: EU/EEA countries (all), Switzerland, Israel, New Zealand, Japan, Canada (commercial organisations), South Korea, and others. USA: The UK-US Data Bridge (extension of the EU-US Data Privacy Framework) allows transfers to certified US organisations. Always check the US Department of Commerce Data Privacy Framework participant list. TRANSFER TO NON-ADEQUATE COUNTRIES (UK GDPR Article 46): Use the UK International Data Transfer Agreement (IDTA) — the UK's equivalent of EU Standard Contractual Clauses (SCCs). The IDTA was approved by Parliament in March 2022. An "Addendum" to EU SCCs also allows UK controllers to add the UK Addendum to existing EU SCCs for UK-compliant transfers. Transfer Impact Assessments (TIAs) are required before relying on IDTA/Addendum — assess whether the recipient country's laws adequately protect the data. DEROGATIONS (Article 49): Explicit consent; necessary for contract performance; legal claims; vital interests; public interest; legitimate interests (high bar — occasional, not systematic). Note: EU GDPR transfers to the UK are covered by the EU-UK adequacy decision (still in force as of 2026, though subject to review).`,
  },

  {
    slug: 'uk-gdpr-dpia-requirements',
    title: 'When is a DPIA required under UK GDPR? Article 35 explained',
    category: 'uk-gdpr',
    source: 'UK GDPR Article 35 / ICO guidance',
    publishedAt: new Date('2024-04-01'),
    tags: ['DPIA', 'Data Protection Impact Assessment', 'Article 35', 'high risk', 'mandatory', 'ICO'],
    content: `Under UK GDPR Article 35, a Data Protection Impact Assessment (DPIA) is mandatory before processing that is "likely to result in a high risk" to individuals. MANDATORY TRIGGERS: (1) Systematic and extensive profiling or automated decisions with significant effects; (2) Large-scale processing of special category data (health, biometric, genetic, criminal); (3) Systematic large-scale monitoring of publicly accessible areas (CCTV, public tracking). ICO LIST OF HIGH-RISK PROCESSING (must always do DPIA): New technologies; denial of service decisions; large-scale profiling; biometric processing; children's data at scale; data matching/merging from multiple sources; invisible processing (data not collected from data subjects); tracking location or behaviour; vulnerable individuals (employees, children, elderly); innovative technology (AI, machine learning). DPIA CONTENTS: Description of processing and purposes; assessment of necessity and proportionality; risks to rights and freedoms; measures to address risk. CONSULTING THE ICO (Prior Consultation, Article 36): If after a DPIA the residual risk remains high, you MUST consult the ICO before proceeding. The ICO has 8 weeks to provide written advice (extendable to 14 weeks). GOOD PRACTICE: Conduct DPIAs early in project design (privacy by design); document and review annually or when processing changes significantly.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // MARKETING AND DIRECT MARKETING
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'pecr-email-marketing-rules',
    title: 'Email and SMS marketing rules under PECR — consent, soft opt-in, and opt-out',
    category: 'pecr-marketing',
    source: 'PECR Regulations 22-24 / ICO direct marketing guidance',
    publishedAt: new Date('2024-05-01'),
    tags: ['email marketing', 'SMS marketing', 'PECR', 'soft opt-in', 'consent', 'unsubscribe', 'B2C', 'B2B'],
    content: `Under PECR Regulations 22-24, sending marketing emails and SMS messages requires consent unless the "soft opt-in" exemption applies. B2C MARKETING (to individuals/sole traders): Full opt-in consent required before sending marketing emails or SMS. Pre-ticked boxes are not valid consent. Must provide clear opt-out/unsubscribe in every message. SOFT OPT-IN EXEMPTION (existing customers): Can send marketing emails without fresh consent if: (a) you obtained the contact details in the course of a sale or negotiations of a sale; (b) you're marketing similar products or services; (c) you gave the person a clear opportunity to opt out when collecting their details AND in every subsequent message. B2B MARKETING (to corporate bodies): PECR is more permissive for emails/SMS to corporate bodies — no consent required, but still must not market if they have opted out. Individual employees' work emails are different — they may be individuals (sole traders, partnerships) covered by the individual PECR rules. TELEPHONE MARKETING: Must screen against TPS (Telephone Preference Service) register before calling. UNLAWFUL PRACTICES: Renting or buying marketing lists without verifying consent; buying databases and emailing without consent; using pre-ticked boxes; failing to provide unsubscribe mechanism. ICO enforcement: PECR fines now up to £17.5m under DUAA 2025.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // ADTECH AND COOKIES (2024-2026)
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'ico-adtech-enforcement-2024-2025',
    title: 'ICO adtech and cookie enforcement 2024–2025: audit programme and real-time bidding',
    category: 'adtech',
    source: 'ICO',
    publishedAt: new Date('2024-10-01'),
    tags: ['adtech', 'cookies', 'real-time bidding', 'RTB', 'programmatic', 'consent', 'ICO', 'audit'],
    content: `The ICO has been running an active audit programme of adtech and cookie consent compliance since 2023. Key areas of focus: (1) REAL-TIME BIDDING (RTB): The ICO has consistently found that the existing RTB ecosystem is likely incompatible with UK GDPR, particularly regarding special category data being transmitted in bid requests without valid consent. ICO has issued enforcement notices to several data brokers. (2) COOKIE BANNERS: The ICO's audit programme found that many UK websites use dark patterns in cookie banners. Reject All buttons must be as prominent as Accept All. Consent must be granular — users should be able to consent to some cookies and not others. (3) GOOGLE ANALYTICS: The ICO has not banned Google Analytics in the UK (unlike some EU DPAs), but requires valid consent for GA cookies and appropriate IDTA for the data transfer to the US. (4) TCF (IAB Transparency and Consent Framework): The ICO is monitoring the TC framework, following the Belgian DPA's enforcement action. Organisations should: audit all third-party cookies and trackers; implement a proper consent management platform (CMP); ensure consent signals are passed correctly to all vendors; do not rely on "legitimate interests" for advertising tracking cookies.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // EMPLOYMENT DATA
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'uk-gdpr-employee-monitoring',
    title: 'UK GDPR employee monitoring — CCTV, email monitoring, and remote working surveillance',
    category: 'employment-data',
    source: 'UK GDPR / ICO Employment Practices Code',
    publishedAt: new Date('2024-07-01'),
    tags: ['employment', 'monitoring', 'CCTV', 'email', 'remote working', 'Article 6', 'Article 9'],
    content: `UK GDPR and the ICO's Employment Practices Code set out rules for monitoring employees. LAWFUL BASIS FOR MONITORING: Most employee monitoring uses legitimate interests (Article 6(1)(f)) or legal obligation (Article 6(1)(c)). Cannot rely on consent from employees due to the inherent power imbalance of employment relationship. TRANSPARENCY: Employees must be told in advance about all monitoring (via employment contracts, policies, privacy notices). Covert monitoring is only permitted in very exceptional circumstances (investigating serious criminal activity) and requires DPO involvement and DPIA. CCTV: Must have legitimate purpose; signs must be displayed; retention periods must be defined (ICO recommends 31 days for general areas); CCTV in changing rooms/toilets is not permitted; must be covered in a DPIA. EMAIL AND INTERNET MONITORING: Must be proportionate; blanket monitoring of all email content is not permitted without clear policy and legitimate reason; monitoring of personal webmail accounts accessed on work devices requires consent. REMOTE WORKING SURVEILLANCE: Keystroke logging, screenshot capture, webcam monitoring — all require DPIA, clear policy, proportionality assessment, and transparent disclosure to employees. Productivity monitoring tools (e.g., Microsoft Viva Insights) require careful data protection assessment. AI-powered monitoring tools: likely require DPIA, Children's Code DPIA if any employees are minors, and may constitute high-risk processing under EU AI Act if used for employment decisions.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // SME COMPLIANCE ESSENTIALS
  // ═══════════════════════════════════════════════════════════════

  {
    slug: 'uk-gdpr-sme-essentials-checklist',
    title: 'UK GDPR essentials for UK SMEs — minimum compliance checklist',
    category: 'sme-compliance',
    source: 'ICO guidance / AlgoGrass',
    publishedAt: new Date('2024-01-01'),
    tags: ['SME', 'small business', 'checklist', 'UK GDPR', 'essentials', 'compliance', 'basics'],
    content: `Minimum UK GDPR compliance requirements for UK small and medium-sized businesses: (1) ICO REGISTRATION: Most organisations processing personal data must register with the ICO and pay the data protection fee (Tier 1: £40/year, Tier 2: £60/year, Tier 3: £2,900/year). (2) PRIVACY NOTICE: A clear, accessible privacy notice (also called privacy policy) on your website explaining what data you collect, why, who you share it with, how long you keep it, and data subjects' rights. (3) DATA PROTECTION COMPLAINTS PROCESS: Mandatory from 19 June 2026 under the DUAA 2025 — document how to make a data protection complaint. (4) RECORD OF PROCESSING ACTIVITIES (ROPA): If you have 250+ employees, keeping a ROPA is mandatory. Good practice for all organisations. (5) CONSENT MANAGEMENT: Valid consent mechanism for marketing emails (opt-in, easy opt-out) and for cookies. (6) DSAR PROCESS: Process for handling Data Subject Access Requests — must respond within one month. (7) BREACH PROCEDURE: Know how to identify, contain, assess, and notify the ICO of data breaches within 72 hours. (8) VENDOR DPAs: Data Processing Agreements with all third-party processors (Mailchimp, Salesforce, Google Workspace, etc.). (9) DATA RETENTION POLICY: Define and enforce how long you keep different types of personal data. (10) SECURITY MEASURES: Access controls, encryption, MFA, regular backups, staff training.`,
  },

]

// ─────────────────────────────────────────────────────────────────────────────
// Seeder function
// ─────────────────────────────────────────────────────────────────────────────
async function getConnectionString() {
  const envUri = process.env.MONGODB_URI
  if (envUri) {
    console.log('  Using MONGODB_URI from environment')
    return envUri
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question('\nMongoDB connection string → ', uri => {
      rl.close()
      resolve(uri.trim())
    })
  })
}

async function main() {
  console.log('\n🧠 AlgoGrass AI — Knowledge Base Seeder')
  console.log('━'.repeat(50))
  console.log(`📚 Entries to seed: ${KNOWLEDGE_ENTRIES.length}`)

  const uri    = await getConnectionString()
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('\n✅ Connected to MongoDB Atlas')

    const db  = client.db(DB_NAME)
    const col = db.collection(COL)

    // Ensure text index exists
    console.log('\n📇 Ensuring text index...')
    try {
      await col.createIndex(
        { title: 'text', content: 'text', tags: 'text' },
        { name: 'fulltext_search', weights: { title: 10, tags: 5, content: 1 } }
      )
      console.log('   ✓ Text index ready')
    } catch (err) {
      if (err.code === 85 || err.code === 86) {
        console.log('   ✓ Text index already exists')
      } else {
        console.warn('   ⚠ Index warning:', err.message)
      }
    }

    // Upsert all entries
    console.log('\n📥 Seeding knowledge base entries...\n')
    let inserted = 0, updated = 0, errors = 0

    for (const entry of KNOWLEDGE_ENTRIES) {
      try {
        const result = await col.updateOne(
          { slug: entry.slug },
          {
            $set: {
              ...entry,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        )
        if (result.upsertedCount > 0) {
          inserted++
          console.log(`  ✅ [NEW]     ${entry.title.slice(0,65)}`)
        } else {
          updated++
          console.log(`  🔄 [UPDATE] ${entry.title.slice(0,65)}`)
        }
      } catch (err) {
        errors++
        console.error(`  ❌ [ERROR]  ${entry.slug}: ${err.message}`)
      }
    }

    const total = await col.countDocuments()

    console.log('\n' + '━'.repeat(50))
    console.log(`✅ Done! ${inserted} new entries, ${updated} updated, ${errors} errors`)
    console.log(`📊 Total knowledge base documents: ${total}`)
    console.log('━'.repeat(50))
    console.log('\n🚀 AlgoGrass AI can now answer questions using the latest data.\n')

  } catch (err) {
    console.error('\n❌ Error:', err.message)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
