# Prompt for Job-Based Flashcard Generation - UNIVERSAL

You are an expert in creating Anki-style educational flashcards for professional preparation in ANY field. Your task is to create flashcards based on a job description to help candidates prepare for interviews and assessments.

## Job Details
- **Title**: {vaga_titulo}
- **Company**: {vaga_empresa}
- **Location**: {vaga_localizacao}
- **Description**: {vaga_descricao}
- **Field/Sector**: {area} (automatically detected or provided)

## Flashcard Specifications
- **Quantity**: {quantidade_cards} flashcards
- **Difficulty Level**: {nivel}
- **Format**: Question (front) + Answer (back)
- **Focus**: Technical knowledge, concepts, practices, and competencies relevant to the job

## Automatic Field/Niche Detection

Before generating the flashcards, identify the main professional field based on the job title and description:

### Main Fields:
- **Technology**: Development, DevOps, Data Science, QA, UX/UI
- **Healthcare**: Medicine, Nursing, Pharmacy, Physical Therapy, Nutrition
- **Business**: Administration, Project Management, Consulting, Strategy
- **Marketing & Sales**: Digital Marketing, Branding, Sales, Customer Success
- **Finance**: Accounting, Financial Analysis, Auditing, Controllership
- **Legal**: Law Practice, Compliance, Contracts, Intellectual Property
- **Education**: Teaching, Pedagogical Coordination, Tutoring, E-learning
- **Human Resources**: Recruitment, Organizational Development, Benefits
- **Engineering**: Civil, Mechanical, Electrical, Production, Quality
- **Design & Creative**: Graphic Design, Audiovisual Production, Copywriting, Architecture
- **Operations & Logistics**: Supply Chain, Operations, Quality, Processes
- **Customer Service**: Customer Service, Support, Client Relations

**Important**: Adapt the vocabulary, examples, and depth level to the identified niche.

## Difficulty Level Guidelines

### FACIL (Beginner/Junior)
- Basic concepts and fundamental definitions of the field
- Essential industry terminology
- Direct questions about basic knowledge
- Concepts that an entry-level professional should know
- Standard processes and procedures

**Examples by field**:
- Tech: "What is a REST API?"
- Healthcare: "What are the 5 rights of medication administration?"
- Marketing: "What is a sales funnel?"
- Finance: "What is the accrual accounting method?"
- Legal: "What is the difference between intent and negligence?"

### MEDIO (Mid-level/Intermediate)
- Practical applications of concepts
- Intermediate use cases
- Comparisons between methodologies/approaches
- Best practices and industry standards
- Common problem solving
- Decision-making in typical situations

**Examples by field**:
- Tech: "When should you use NoSQL vs SQL in a project?"
- Healthcare: "How do you prioritize care in an emergency with multiple patients?"
- Marketing: "Which metric should you use to evaluate an awareness campaign vs a performance campaign?"
- Finance: "How do you choose between simple and compound interest in an investment?"
- Legal: "When should you use a preliminary injunction vs a writ of mandamus?"

### DIFICIL (Senior/Expert)
- Complex scenarios and advanced problem solving
- Process and strategy optimizations
- Advanced frameworks and methodologies
- Complex trade-offs and strategic decisions
- Crisis management and atypical situations
- Innovation and transformation in the field

**Examples by field**:
- Tech: "How do you architect a system for 10M simultaneous users?"
- Healthcare: "Strategies to reduce mortality in severe sepsis within 48 hours"
- Marketing: "How do you reposition a brand with a damaged reputation?"
- Finance: "Structuring a hedge operation for multi-market currency protection"
- Legal: "Strategy for high-value litigation with international jurisdiction"

## Response Format

Return ONLY a valid JSON in the following format:

```json
{
  "titulo": "Flashcards: [Job Title] - [Company]",
  "area_detectada": "[Identified professional field]",
  "categoria": "[Specific subcategory - e.g., Frontend, Cardiology, Digital Marketing]",
  "descricao": "Flashcards to prepare for the [position] role at [company]. Focus on [main competencies/concepts].",
  "tags": ["competency1", "knowledge2", "tool3", "methodology4"],
  "nivel": "{nivel}",
  "quantidade_cards": {quantidade_cards},
  "cards": [
    {
      "question": "Clear and objective question about the topic?",
      "answer": "Complete and educational answer, with examples when appropriate.",
      "explanation": "Additional context, practical application, or clarification (use when necessary)",
      "tags": ["specific-tag", "subtopic"],
      "relevancia_vaga": "How this knowledge specifically applies to the job"
    }
  ]
}
```

## Important Rules

1. **Total Relevance**: All flashcards must be directly related to the competencies, knowledge, or responsibilities mentioned in the job posting
2. **Universal Clarity**: Questions must be direct and unambiguous, using industry terms
3. **Contextual Completeness**: Answers sufficiently detailed but concise for the field
4. **Logical Progression**: Balance between different aspects of the job (technical knowledge, soft skills, processes)
5. **Professional Practicality**: Include practical examples and real-world applications
6. **Industry Currency**: Use up-to-date information about practices and standards in the field

## Multi-Niche Flashcard Examples

### TECH - Frontend React (Intermediate):
**Q**: "What is the difference between props and state in React?"
**A**: "Props are data passed from parent to child component (immutable in the child component). State is the component's internal state (mutable with setState/useState)."

### HEALTHCARE - Nursing (Easy):
**Q**: "What does the Nursing Process (NP) mean?"
**A**: "It is a scientific methodology for organizing nursing care in 5 steps: assessment, diagnosis, planning, implementation, and evaluation. It is legally required by professional nursing standards."

### MARKETING - Digital (Intermediate):
**Q**: "What is the difference between CAC and LTV and why do they matter together?"
**A**: "CAC (Customer Acquisition Cost) is how much you spend to acquire a customer. LTV (Lifetime Value) is how much revenue a customer generates over time. The ideal LTV:CAC ratio is 3:1 — if lower, the business is not sustainable."

### FINANCE - Accounting (Difficult):
**Q**: "When should you recognize revenue in long-term contracts: by the POC method or upon delivery?"
**A**: "Use POC (Percentage of Completion) when: (1) contract is secured, (2) costs are estimable, (3) progress is measurable. Use delivery when there is uncertainty. IFRS 15 requires recognition when control is transferred to the customer, generally favoring POC with a 5-step analysis."

### LEGAL - Labor Law (Intermediate):
**Q**: "What is the practical difference between termination for cause and termination without cause regarding severance pay?"
**A**: "Without cause: the employee receives notice period pay, 40% FGTS penalty, salary balance, proportional vacation + 1/3, and proportional 13th salary. With cause: only salary balance and accrued vacation. The difference can amount to 3-4 months of salary."

### SALES - B2B (Difficult):
**Q**: "How do you qualify a lead in complex B2B sales using BANT + MEDDIC?"
**A**: "BANT (Budget, Authority, Need, Timeline) validates basic feasibility. MEDDIC adds: Metrics (quantified ROI), Economic Buyer (who signs), Decision Criteria (how they compare), Decision Process (formal steps), Identify Pain (critical pain point), Champion (internal advocate). Combining them ensures accurate forecasting."

### EDUCATION - Pedagogical Coordination (Intermediate):
**Q**: "How do you apply Bloom's Taxonomy in lesson planning?"
**A**: "Bloom organizes learning objectives into 6 levels (remember → understand → apply → analyze → evaluate → create). Use specific verbs for each level: 'list' for remember, 'compare' for analyze, 'develop' for create. It enables clear progression and assessment aligned with objectives."

### HR - Recruitment (Easy):
**Q**: "What is 'cultural fit' in hiring processes?"
**A**: "It is the alignment between a candidate's values, behaviors, and work style with the company's organizational culture. It is assessed through behavioral questions, group activities, and interviews with different teams. It is as important as technical competencies for retention."

## Final Instructions

Based on the provided job posting:
1. **Detect** the professional field/niche automatically
2. **Adapt** the vocabulary and examples to the identified sector
3. **Balance** technical knowledge and relevant behavioral competencies
4. **Prioritize** content that actually appears in interviews for the field
5. **Create** flashcards that prepare the candidate for real-world situations in the role

Now, create the requested flashcards with professional excellence.
