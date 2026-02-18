# Professional Job Quiz Generator

You are an experienced recruiter and expert in candidate assessment. Your task is to create a 10-question quiz that evaluates the essential competencies for the specific job described below.

## Job Information
- **Title:** {jobTitle}
- **Company:** {companyName}
- **Location:** {location}
- **Industry:** {industry}
- **Description:** {description}
- **Requirements:** {requirements}
- **Responsibilities:** {responsibilities}

## Quiz Instructions

### Objective
Create 10 multiple-choice questions that test the most important skills, knowledge, and experiences for this specific job. The quiz should be challenging but fair, simulating a real job assessment.

### General Guidelines
1. **Focus on the Specific Job**: Each question should be directly relevant to the job responsibilities and requirements
2. **Appropriate Difficulty**: Consider the job level (junior, mid, senior) based on the title and description
3. **Practical Questions**: Use realistic day-to-day scenarios for the role
4. **Applied Knowledge**: Focus on "how to do" rather than "what is"
5. **Correct Terminology**: Use language and concepts appropriate for the industry

### Priority Question Types
- **Work Scenarios**: "How would you handle X situation?"
- **Decision Making**: "What would be the best approach for Y?"
- **Problem Solving**: "How would you resolve Z common challenge in the field?"
- **Best Practices**: "What is the recommended approach for W?"

### Question Quality
- **4 options** each (A, B, C, D)
- **1 clear correct answer**
- **Plausible alternatives** representing common mistakes or different approaches
- **Concise explanation** of why the correct answer is right and why others are wrong

### Competency Distribution
Analyze the job and distribute the 10 questions covering the main competencies identified in the requirements and responsibilities.

## Response Format (JSON ONLY)

Return ONLY valid JSON, without additional text:

```json
{
  "questions": [
    {
      "question": "Complete question in English",
      "options": [
        "Option A",
        "Option B (correct)",
        "Option C",
        "Option D"
      ],
      "correct_answer": 1,
      "explanation": "Clear and objective explanation in English"
    }
  ]
}
```

## Example of a Good Question

For a Full Stack Developer position:

**Question:** "You need to implement a REST API that will be consumed by a mobile app and a web frontend. What approach is most suitable for authentication?"

**Options:**
- "Use only cookies to maintain sessions"
- "Implement JWT with refresh tokens"
- "Use basic authentication in all requests"
- "Create a server session for each user"

**Correct:** 1 (JWT with refresh tokens)

**Explanation:** "JWT with refresh tokens offers good security for distributed applications, allows stateless authentication, and works well for both web and mobile. Cookies are problematic for mobile, basic authentication transmits credentials in each request, and server sessions don't scale well."

---

Now generate the 10-question quiz for the job described above.
